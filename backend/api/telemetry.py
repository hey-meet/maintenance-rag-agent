import os
import json
import shutil
import uuid
from pathlib import Path
from datetime import date
from datetime import datetime ,timedelta
from typing import Dict, List, Optional
from PyPDF2 import PdfReader
from fastapi import APIRouter, UploadFile, File,Form, HTTPException,Body, status, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from agents.agent import maintenance_agent
from models.telemetry_schema import TelemetryAlert
from retrieval.query_generator import generate_query_from_alert
from retrieval.retriever import Retriever
from retrieval.context_builder import build_context
from parser.ingest import ingest_manual
from vectordb.embed import generate_embeddings
from vectordb.store_embeddings import store_embeddings
from utils.workorder_storage import append_workorder
from utils.workorder_storage import load_workorders
from utils.workorder_storage import complete_workorder

router = APIRouter()

SETTINGS_FILE = Path(__file__).resolve().parent.parent / "config" / "settings.json"
BASE_DIR = Path(__file__).resolve().parents[2]

MANUALS_DIR = BASE_DIR / "data" / "manuals"

MANUALS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

CHUNKS_DIR = (
    BASE_DIR /
    "backend" /
    "parser" /
    "chunks"
)

retriever = Retriever()
LAST_AGENT_RESULT = None

def get_telemetry_settings():
    try:
        if SETTINGS_FILE.exists():
            with open(SETTINGS_FILE, "r") as f:
                return json.load(f).get("telemetry", {})
    except Exception:
        pass
    return {}

# -------------------------------- DASHBOARD ROUTES --------------------------------

@router.get("/dashboard")
def get_dashboard():

    global LAST_AGENT_RESULT

    alerts = get_alerts()
    work_orders = get_work_orders()
    inventory = get_inventory()
    manuals = get_manuals()

    agent_status = get_agent_status()
    agent_memory = get_agent_memory()

    active_alert = {}

    if LAST_AGENT_RESULT:
        active_alert = {
            "alert_id": LAST_AGENT_RESULT.get("alert_id"),
            "machine_id": LAST_AGENT_RESULT.get("machine_id"),
            "error_code": LAST_AGENT_RESULT.get("error_code"),
            "severity": LAST_AGENT_RESULT.get("severity"),
            "status": LAST_AGENT_RESULT.get("status"),
            "temperature": LAST_AGENT_RESULT.get("temperature")
        }

    return {

        "systemOverview": {
            "active_alerts": agent_status.get(
                "active_alerts", 0
            ),

            "open_work_orders": agent_status.get(
                "open_work_orders", 0
            ),

            "indexed_manuals": len(
                manuals.get("manuals", [])
            ),

            "inventory_risks": len([
                item for item in inventory.get(
                    "inventory", []
                )
                if item.get("status") in [
                    "low_stock",
                    "out_of_stock"
                ]
            ]),

            "vector_chunks": agent_status.get(
                "vector_chunks", 0
            )
        },

        "machineHealthMatrix": {
            "alerts": alerts.get(
                "alerts", []
            )
        },

        "liveVitals": {
            "telemetry": active_alert
        },

        "diagnosticFlow": {
            "agent_state": agent_status.get(
                "state",
                "idle"
            ),

            "manual_context": (
                LAST_AGENT_RESULT.get(
                    "source_references",
                    []
                )
                if LAST_AGENT_RESULT
                else []
            ),

            "inventory_context": (
                LAST_AGENT_RESULT.get(
                    "inventory_matches",
                    []
                )
                if LAST_AGENT_RESULT
                else []
            ),

            "active_work_order": (
                LAST_AGENT_RESULT.get(
                    "work_order_draft",
                    {}
                )
                if LAST_AGENT_RESULT
                else {}
            )
        },

        "activeAlerts": alerts.get(
            "alerts", []
        ),

        "predictiveMaintenance": inventory.get(
            "inventory", []
        ),

        "workOrders": work_orders.get(
            "work_orders", []
        ),

        "activityFeed": {
            "alerts": alerts.get(
                "alerts", []
            ),

            "work_orders": work_orders.get(
                "work_orders", []
            )
        }
    }

@router.get("/critical-alerts")
def get_critical_alerts():

    alerts = get_alerts()["alerts"]

    critical_alerts = [
        alert
        for alert in alerts
        if alert["severity"] == "critical"
        and alert["status"] == "active"
    ]

    return {
        "status": "success",
        "count": len(critical_alerts),
        "alerts": critical_alerts
    }

# ---------------------------------- ALERT ROUTES ----------------------------------

@router.get("/alerts")
def get_alerts():

    alerts_path = Path("../data/alerts/alerts.json")

    if not alerts_path.exists():
        raise HTTPException(
            status_code=404,
            detail="alerts.json not found"
        )

    with open(alerts_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    telemetry_settings = get_telemetry_settings()
    critical_temp = telemetry_settings.get("critical_temp", 90)
    severity_filter = telemetry_settings.get("severity_filter", "warning").lower()
    severity_levels = {"info": 1, "warning": 2, "critical": 3}
    min_level = severity_levels.get(severity_filter, 0)

    validated_alerts = []

    for alert in data:
        if alert.get("temperature", 0) >= critical_temp:
            alert["severity"] = "critical"
            
        alert_level = severity_levels.get(alert.get("severity", "info").lower(), 0)
        
        if alert_level >= min_level:
            validated_alerts.append(
                TelemetryAlert(**alert).dict()
            )

    return {
        "status": "success",
        "alerts": validated_alerts
    }


# ---------------------------------- WORK ORDER ROUTES ----------------------------------
@router.get("/work-orders")
def get_work_orders():

    work_orders = load_workorders()

    return {
        "status": "success",
        "total_work_orders": len(work_orders),
        "work_orders": work_orders
    }

@router.post("/work-orders/{work_order_id}/complete")
def complete_work_order(work_order_id: str):

    work_order = complete_workorder(work_order_id)

    if not work_order:

        raise HTTPException(
            status_code=404,
            detail="Work order not found."
        )

    return {
        "status": "success",
        "message": "Work order marked as completed.",
        "work_order": work_order
    }
# ---------------------------------- INVENTORY ROUTES ----------------------------------


@router.get("/inventory")
def get_inventory():

    global LAST_AGENT_RESULT

    inventory_path = Path("../data/inventory/inventory_data.json")

    if not inventory_path.exists():
        raise HTTPException(
            status_code=404,
            detail="inventory_data.json not found"
        )

    with open(inventory_path, "r", encoding="utf-8") as file:
        inventory_data = json.load(file)

    ai_inventory = []

    if LAST_AGENT_RESULT:

        ai_inventory = LAST_AGENT_RESULT.get(
            "inventory_matches",
            []
        )

    return {
        "status": "success",

        "inventory": inventory_data,

        "ai_inventory_matches": ai_inventory,

        "inventory_available": (
            LAST_AGENT_RESULT.get(
                "inventory_available",
                False
            )
            if LAST_AGENT_RESULT
            else False
        )
    }

# ----------------------------- UPLOAD MANUALS ROUTES ------------------------------

@router.get("/manuals")
def get_manuals():

    manuals = []

    print("=" * 50)
    print("CURRENT FILE =", Path(__file__).resolve())
    print("BASE_DIR =", BASE_DIR.resolve())
    print("MANUALS_DIR =", MANUALS_DIR.resolve())
    print("EXISTS =", MANUALS_DIR.exists())

    pdf_files = list(
        MANUALS_DIR.glob("*.pdf")
    )

    print("PDF FILES =", pdf_files)
    print("=" * 50)

    for pdf_file in pdf_files:

        try:
            reader = PdfReader(str(pdf_file))
            pages = len(reader.pages)

        except:
            pages = 0

        chunk_file = (
            BASE_DIR /
            "backend" /
            "parser" /
            "chunks" /
            f"{pdf_file.stem}_chunks.json"
        )

        chunk_exists = chunk_file.exists()

        manuals.append({

            "manual_id":
                f"MAN-{pdf_file.stem.upper()[:8]}",

            "machine_id":
                pdf_file.stem.upper(),

            "file_name":
                pdf_file.name,

            "manual_type":
                "Maintenance",

            "version":
                "1.0",

            "pages":
                pages,

            "total_chunks":
                0,

            "indexed_chunks":
                0,

            "status":
                "indexed"
                if chunk_exists
                else "uploaded",

            "upload_date":
                datetime.fromtimestamp(
                    pdf_file.stat().st_mtime
                ).strftime("%Y-%m-%d")
        })

    return {
        "status": "success",
        "manuals": manuals
    }


@router.post("/manuals/upload")
async def upload_manual_file(

    file: UploadFile = File(...),

    machine_id: str = Form(...),

    manual_type: str = Form(...),

    version: str = Form(...)

):

    if not file.filename.endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF manuals are supported."
        )

    destination = (
        MANUALS_DIR /
        file.filename
    )

    if destination.exists():

        raise HTTPException(
            status_code=400,
            detail="Manual already exists."
        )

    with open(destination, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    try:

        reader = PdfReader(
            str(destination)
        )

        pages = len(
            reader.pages
        )

    except:

        pages = 0

    return {

        "status": "success",

        "message":
            "Manual uploaded successfully.",

        "manual": {

            "manual_id":
                f"MAN-{uuid.uuid4().hex[:6].upper()}",

            "machine_id":
                machine_id,

            "file_name":
                file.filename,

            "manual_type":
                manual_type,

            "version":
                version,

            "pages":
                pages,

            "status":
                "uploaded"
        }
    }

@router.post("/manuals/chunk/{manual_id}")
def generate_manual_chunks(manual_id: str):

    pdf_path = (
        MANUALS_DIR /
        manual_id
    )

    if not pdf_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Manual not found."
        )

    chunk_file = (
        CHUNKS_DIR /
        f"{pdf_path.stem}_chunks.json"
    )

    # Duplicate protection
    if chunk_file.exists():

        return {
            "status": "success",
            "message": "Chunks already exist.",
            "chunk_file": chunk_file.name
        }

    try:

        result = ingest_manual(
            str(pdf_path)
        )

        return {
            "status": "success",
            "message": "Chunks generated successfully.",
            "manual": pdf_path.name,
            "chunk_file": result["chunk_file"],
            "total_chunks": result["total_chunks"]
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

@router.post("/manuals/embed/{manual_id}")
def embed_manual(manual_id: str):

    chunk_file = (
        CHUNKS_DIR /
        f"{Path(manual_id).stem}_chunks.json"
    )

    if not chunk_file.exists():

        raise HTTPException(
            status_code=404,
            detail="Chunk file not found."
        )

    try:

        embedding_results = generate_embeddings(
            str(chunk_file)
        )

        result = store_embeddings(
            embedding_results
        )

        return {
            "status": "success",
            "manual": manual_id,
            "embedded": result["embedded"],
            "total_vectors": result["total_vectors"],
            "message": (
                "Embeddings already exist."
                if not result["embedded"]
                else "Embeddings generated successfully."
            )
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

@router.get("/manuals/view/{filename}")
def view_manual(filename: str):

    file_path = (
        MANUALS_DIR /
        filename
    )

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Manual not found."
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf"
    )
@router.get("/manuals/download/{filename}")
def download_manual(filename: str):

    file_path = (
        MANUALS_DIR /
        filename
    )

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Manual not found."
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename,
        headers={
            "Content-Disposition":
            f'attachment; filename="{filename}"'
        }
    )

# --------------------------------- AGENT ROUTES ---------------------------------

@router.get("/agent/status")
def get_agent_status():

    global LAST_AGENT_RESULT

    if LAST_AGENT_RESULT:

        severity = str(
            LAST_AGENT_RESULT.get(
                "severity",
                "LOW"
            )
        ).lower()

        state = (
            "attention"
            if severity in ["critical", "high"]
            else "monitor"
        )

        return {
            "state": state,

            "active_alerts": 1,

            "pending_tasks": len(
                LAST_AGENT_RESULT.get(
                    "repair_steps",
                    []
                )
            ),

            "open_work_orders": 1,

            "vector_chunks": LAST_AGENT_RESULT.get(
                "total_chunks",
                0
            ),

            "agent_health": (
                "stable"
                if LAST_AGENT_RESULT.get(
                    "recommendation_status"
                ) == "success"
                else "warning"
            )
        }

    return {
        "state": "idle",
        "active_alerts": 0,
        "pending_tasks": 0,
        "open_work_orders": 0,
        "vector_chunks": 0,
        "agent_health": "standby"
    }


@router.get("/agent/alerts")
def get_agent_alerts():
    """
    TASK 1: DYNAMIC AGENT ALERTS
    Fetches high-priority telemetry alerts dynamically from the active system alert source
    shared by the main dashboards and active health matrix pools.
    """
    system_alerts_payload = get_alerts()
    raw_alerts = system_alerts_payload.get("alerts", [])
    
    agent_formatted_alerts = []
    for alert in raw_alerts:
        # Map dashboard system metrics securely to the agent console schema
        agent_formatted_alerts.append({
            "id": alert.get("alert_id", "UNKNOWN"),
            "component": alert.get("machine_id", "Unknown Asset"),
            "issue": f"Error Code {alert.get('error_code', 'N/A')} detected",
            "severity": alert.get("severity", "warning"),
            "timestamp": "Active" if alert.get("status") == "active" else "Resolved"
        })
        
    return agent_formatted_alerts

@router.post("/agent/process")
def process_agent_alert(payload: dict = Body(...)):

    global LAST_AGENT_RESULT

    try:

        # Execute full maintenance pipeline
        result = maintenance_agent.process_alert(
            payload
        )

        # Persist AI-generated work order
        append_workorder(result)

        # Store latest result for memory, work-order, pipeline routes
        LAST_AGENT_RESULT = result

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Agent processing failed.",
                "reason": str(error)
            }
        )

@router.get("/agent/pipeline")
def get_agent_pipeline():

    from datetime import datetime

    global LAST_AGENT_RESULT

    base_time = datetime.now().strftime("%H:%M:")

    if LAST_AGENT_RESULT:

        logs = []

        logs.append({
            "timestamp": f"{base_time}01",
            "message": "Telemetry alert successfully received."
        })

        logs.append({
            "timestamp": f"{base_time}04",
            "message": f"Generated query for error code {LAST_AGENT_RESULT.get('error_code')}."
        })

        logs.append({
            "timestamp": f"{base_time}08",
            "message": f"Retrieved {LAST_AGENT_RESULT.get('total_chunks', 0)} manual context chunks."
        })

        logs.append({
            "timestamp": f"{base_time}12",
            "message": "Cross-referenced technical manual data."
        })

        logs.append({
            "timestamp": f"{base_time}16",
            "message": "Prescriptive recommendation generated by AI engine."
        })

        if LAST_AGENT_RESULT.get("inventory_available"):

            logs.append({
                "timestamp": f"{base_time}18",
                "message": "Required inventory items available."
            })

        else:

            logs.append({
                "timestamp": f"{base_time}18",
                "message": "Inventory availability check completed."
            })

        logs.append({
            "timestamp": f"{base_time}20",
            "message": "Recommendation synchronized with AI Assistant dashboard."
        })

        return logs

    return [
        {
            "timestamp": f"{base_time}00",
            "message": "Waiting for alert transmission."
        }
    ]

@router.get("/agent/memory")
def get_agent_memory():

    global LAST_AGENT_RESULT

    if LAST_AGENT_RESULT:

        return LAST_AGENT_RESULT.get(
            "agent_memory_view",
            {}
        )

    return {
        "severity": "MONITOR",
        "department": "Maintenance Team",
        "estimated_time": "Unknown",
        "recommended_steps": [],
        "required_tools": [],
        "required_parts": [],
        "inventory_status": "NO ACTIVE ALERT",
        "work_order": "PENDING"
    }

@router.get("/agent/work-order")
def get_agent_work_order():

    global LAST_AGENT_RESULT

    if LAST_AGENT_RESULT:

        work_order = LAST_AGENT_RESULT.get(
            "work_order_draft",
            {}
        )

        return {
            "id": work_order.get(
                "work_order_id",
                "PENDING"
            ),

            "machine": work_order.get(
                "machine_id",
                "UNKNOWN"
            ),

            "priority": work_order.get(
                "priority",
                "LOW"
            ).upper(),

            "status": work_order.get(
                "status",
                "PENDING"
            ),

            "assigned_team": LAST_AGENT_RESULT.get(
                "agent_memory_view",
                {}
            ).get(
                "department",
                "Maintenance Team"
            ),

            "estimated_time": work_order.get(
                "estimated_time",
                "Unknown"
            )
        }

    return {
        "id": "PENDING",
        "machine": "NO ACTIVE ALERT",
        "priority": "LOW",
        "status": "WAITING",
        "assigned_team": "Maintenance Team",
        "estimated_time": "Unknown"
    }

# --------------------------------- ANALYTICS ROUTES ---------------------------------

@router.get("/analytics", status_code=status.HTTP_200_OK)
def get_industrial_analytics():
    """
    Appended high-density structural metrics data route for Analytics.jsx dashboard components.
    """
    return {
        "status": "success",
        
        "executive_kpis": [
            { "id": "fhi", "label": "Fleet Health Index", "value": "91.2%", "trend": "+1.4%", "status": "optimal", "desc": "vs Last Period Target (90.0%)" },
            { "id": "mttr", "label": "Mean Time To Repair (MTTR)", "value": "2.4 hrs", "trend": "-14.0%", "status": "optimal", "desc": "Average critical asset resolution" },
            { "id": "aca", "label": "Active Critical Alerts", "value": "14 Nodes", "trend": "+2 Nodes", "status": "danger", "desc": "Requires immediate intervention" },
            { "id": "ra", "label": "Retrieval Accuracy (RAG)", "value": "94.8%", "trend": "+2.1%", "status": "optimal", "desc": "Vector precision on documentation" },
            { "id": "wocr", "label": "Work Order Completion", "value": "88.5%", "trend": "+0.7%", "status": "stable", "desc": "Target execution efficiency" },
            { "id": "irc", "label": "Inventory Risk Count", "value": "3 Items", "trend": "-1 Item", "status": "stable", "desc": "Critical spares below fallback limit" }
        ],
        
        "maintenance_trends": [
            { "week": "W22", "preventive": 65, "corrective": 25, "emergency": 10 },
            { "week": "W23", "preventive": 70, "corrective": 20, "emergency": 10 },
            { "week": "W24", "preventive": 55, "corrective": 30, "emergency": 15 },
            { "week": "W25", "preventive": 80, "corrective": 15, "emergency": 5 },
            { "week": "W26", "preventive": 75, "corrective": 22, "emergency": 3 }
        ],
        
        "alert_distribution": {
            "severity": [
                { "label": "Critical", "count": 14, "percent": 20, "class": "danger" },
                { "label": "High", "count": 22, "percent": 32, "class": "warning" },
                { "label": "Medium", "count": 25, "percent": 36, "class": "primary" },
                { "label": "Low", "count": 8, "percent": 12, "class": "sage" }
            ],
            "recurringCodes": [
                { "code": "E-4042", "desc": "Hydraulic Pressure Transient Fault", "count": 42 },
                { "code": "E-1108", "desc": "Spindle Thermal Delta Threshold Exceeded", "count": 29 },
                { "code": "E-8821", "desc": "RAG Retrieval Incomplete Match Context", "count": 18 },
                { "code": "E-7112", "desc": "Synchronizer Phase Variance Shift", "count": 11 }
            ]
        },
        
        "machine_hotspots": [
            { "name": "Hydraulic Press P-04", "health": 64, "alerts": 14, "downtime": "12.4h", "risk": "Critical", "riskClass": "danger" },
            { "name": "CNC Milling Unit C-12", "health": 78, "alerts": 9, "downtime": "6.2h", "risk": "High", "riskClass": "warning" },
            { "name": "Rotary Compressor K-08", "health": 89, "alerts": 6, "downtime": "2.1h", "risk": "Medium", "riskClass": "primary" },
            { "name": "Induction Furnace F-01", "health": 96, "alerts": 2, "downtime": "0.0h", "risk": "Low", "riskClass": "sage" },
            { "name": "Robotic Arm Assembly R-02", "health": 92, "alerts": 4, "downtime": "1.5h", "risk": "Low", "riskClass": "sage" }
        ],
        
        "telemetry_trends": [
            { "metric": "Thermal Core Levels", "status": "Spike Detected", "val": "94°C", "dev": "+12%", "state": "danger", "bars": [60, 62, 65, 88, 94] },
            { "metric": "Manifold Pressure Index", "status": "Nominal Range", "val": "4.2 bar", "dev": "-2%", "state": "sage", "bars": [45, 44, 43, 42, 42] },
            { "metric": "Spindle Rotary Speed (RPM)", "status": "Fluctuation Present", "val": "14,200", "dev": "+7%", "state": "warning", "bars": [70, 75, 62, 85, 78] },
            { "metric": "Mean Axis Vibration Multiplier", "status": "Threshold Exceeded", "val": "4.1 mm/s", "dev": "+24%", "state": "danger", "bars": [35, 42, 55, 72, 89] }
        ],
        
        "rag_performance": {
            "metrics": [
                { "label": "Retrieval Accuracy", "val": "94.8%", "trend": "+2.1%", "state": "increase" },
                { "label": "Avg Context Score", "val": "0.892", "trend": "+0.04", "state": "increase" },
                { "label": "Manual Coverage", "val": "98.2%", "trend": "Static", "state": "stable" },
                { "label": "Indexed Chunks", "val": "142,840", "trend": "+12.4k", "state": "increase" },
                { "label": "Query Success Rate", "val": "99.1%", "trend": "+0.3%", "state": "increase" },
                { "label": "Avg Retrieval Latency", "val": "240ms", "trend": '-45ms', "state": "decrease" }
            ],
            "insights": [
                "Vector space query alignment improved following embedding indexing run on 2026-06-15.",
                "Unmapped technical structures detected inside mechanical schematics sections for Subsystem-B."
            ]
        },
        
        "knowledge_base_data": {
            "stats": [
                { "label": "Total Manuals Saved", "val": "412 Docs" },
                { "label": "Indexed Manuals", "val": "408 Docs" },
                { "label": "Pages Processed", "val": "34,150 Pages" },
                { "label": "Generated Chunks", "val": "142,840 Chunks" }
            ],
            "progress": 99.0
        },
        
        "work_order_analytics": {
            "statusDistribution": [
                { "state": "Open", "count": 12, "pct": 20, "color": "var(--danger-color)" },
                { "state": "In Progress", "count": 28, "pct": 46, "color": "var(--warning-color)" },
                { "state": "Completed", "count": 16, "pct": 26, "color": "var(--primary-color)" },
                { "state": "On Hold", "count": 5, "pct": 8, "color": "var(--text-muted)" }
            ],
            "departments": [
                { "name": "Hydraulics Subsystems", "load": 42 },
                { "name": "Electrical Infrastructures", "load": 28 },
                { "name": "Mechanical Actuators", "load": 18 },
                { "name": "Robotics Kinematics", "load": 12 }
            ]
        },
        
        "inventory_risks": [
            { "part": "Piston Seal Kit H-04", "status": "Low Stock", "stock": "2 units", "leadTime": "14 Days", "risk": "High" },
            { "part": "Carbide Inserts CNMG-12", "status": "Out Of Stock", "stock": "0 units", "leadTime": "4 Days", "risk": "Critical" },
            { "part": "Rotary Shaft Bearing B-88", "status": "Critical Spare Threshold", "stock": "1 unit", "leadTime": "22 Days", "risk": "High" }
        ],
        
        "ai_insights": [
            { "type": "critical", "text": "Hydraulic Press P-04 has generated 42% of all critical alert telemetries recorded this month.", "action": "Triggering Predictive Run" },
            { "type": "optimal", "text": "Current preventative maintenance matrix cycle has successfully reduced global MTTR by 14.0%.", "action": "Strategy Validated" },
            { "type": "warning", "text": "CNC Unit C-12 vibration anomalies show structural multi-point increasing trending models.", "action": "Review Vector Manuals" },
            { "type": "warning", "text": "Critical spare inventory shortage may impact 2 active downstream high-priority work orders.", "action": "Procurement Flagged" }
        ],
        
        "factory_performance": [
            { "area": "Stamping Line A", "availability": "94.2%", "reliability": "91.5%", "cost": "$14,200", "risk": "Low", "riskState": "sage" },
            { "area": "Machining Block B", "availability": "88.1%", "reliability": "84.2%", "cost": "$31,800", "risk": "High", "riskState": "warning" },
            { "area": "Assembly Enclosure C", "availability": "98.5%", "reliability": "97.1%", "cost": "$5,400", "risk": "Minimal", "riskState": "sage" },
            { "area": "Foundry Cluster D", "availability": "82.4%", "reliability": "79.8%", "cost": "$44,000", "risk": "Critical", "riskState": "danger" }
        ]
    }    

# ==========================================================================
# STATIC INDUSTRIAL MOCK STORAGE (DATABASE MATRIX MATCHING TELEMETRY STYLES)
# ==========================================================================
MOCK_REPORTS_LEDGER: Dict[str, Dict] = {
    "REP-2026-X01": {
        "id": "REP-2026-X01",
        "name": "Q2 Comprehensive Hydraulics Audit",
        "type": "Compliance Audit Report",
        "generated_by": "Sarah Jenkins (Reliability Lead)",
        "date": "2026-06-15",
        "machine": "Hydraulic Press P-04",
        "status": "Approved",
        "format": "PDF / XLSX",
        "risk_level": "HIGH",
        "health_trend": "Degrading (-8% over 30d)",
        "mttr_impact": "-14 mins projected",
        "savings": "$12,500 / Quarter",
        "summary": "Critical bypass valve degradation detected alongside trace micro-particulate contamination in fluid lines. System compliance threshold approaching boundary limit parameters.",
        "findings": [
            "Bypass valve V-12 seating seal showing sign of high thermal fatigue wear.",
            "Fluid particulate count at 19μm exceeds ISO 4406 cleanliness threshold standard."
        ],
        "risks": [
            "Potential complete seal failure within 45 operating cycles if pressure transients persist.",
            "Secondary pump motor cavitation risk due to fluid delivery line aeration."
        ],
        "actions": [
            "Schedule immediate LOTO procedure for full teardown and replacement of valve V-12.",
            "Execute mandatory secondary flush cycle and clean out filter matrix elements."
        ]
    },
    "REP-2026-X02": {
        "id": "REP-2026-X02",
        "name": "CNC Spindle Resonance Assessment",
        "type": "Asset Reliability Assessment",
        "generated_by": "System AI Engine",
        "date": "2026-06-18",
        "machine": "CNC Milling Unit C-12",
        "status": "Ready for Review",
        "format": "PDF",
        "risk_level": "MEDIUM",
        "health_trend": "Stable (Baseline Checked)",
        "mttr_impact": "-5 mins projected",
        "savings": "$4,200 / Quarter",
        "summary": "Periodic spectral acceleration runs identify subtle harmonic variations within the 3.2kHz bracket. Bearing tracks intact but tracking structural aging trends.",
        "findings": [
            "Micro-chatter signatures present during high-feed structural milling cycles.",
            "Spindle temperature stabilized at 62°C under continuous maximum torque constraints."
        ],
        "risks": [
            "Accelerated degradation of tooling assemblies if vibration amplitude bounds step out of line.",
            "Micro-imperfections on surface finish specifications for structural custom parts."
        ],
        "actions": [
            "Apply bounded limits to maximum operational RPM thresholds until secondary diagnostic run.",
            "Re-grease automatic axis guides during upcoming standard weekly PM window."
        ]
    },
    "REP-2026-X03": {
        "id": "REP-2026-X03",
        "name": "Thermal Envelope Structural Analysis",
        "type": "AI Prescriptive Maintenance Summary",
        "generated_by": "Marcus Vance (Plant Director)",
        "date": "2026-06-19",
        "machine": "Induction Furnace F-01",
        "status": "Approved",
        "format": "PDF / CSV",
        "risk_level": "LOW",
        "health_trend": "Optimal (+2% Efficiency)",
        "mttr_impact": "N/A (Baseline Match)",
        "savings": "$28,000 / Annualized",
        "summary": "Thermal structural mapping shows exceptional distribution across insulation tiles. Current system profile reflects optimized gas-air mixture controls.",
        "findings": [
            "Refractory wall degradation velocity is tracking 12% below anticipated timeline expectations.",
            "Exhaust stack sensor array matches reference calibration standards perfectly."
        ],
        "risks": [
            "Minimal immediate structural risk parameters flagged.",
            "Minor scale buildup on backup coolant induction manifolds."
        ],
        "actions": [
            "Execute standard clean checks on backup lines during next planned facility shutdown.",
            "Update asset registry index to extend target asset lifespan rating by 6 months."
        ]
    },
    "REP-2026-X04": {
        "id": "REP-2026-X04",
        "name": "Axis 3 Servo Harness Continuity Trace",
        "type": "Failure Investigation Report",
        "generated_by": "Elena Rostova (Robotics Eng)",
        "date": "2026-06-14",
        "machine": "Robotic Arm Assembly R-02",
        "status": "Approved",
        "format": "PDF",
        "risk_level": "MEDIUM",
        "health_trend": "Recovering (+5% Post-splice)",
        "mttr_impact": "-22 mins verified",
        "savings": "$8,900 / Incident",
        "summary": "Investigation into sudden continuity loss across Axis 3 joint loop layout tracking. Physical wear patterns isolate mechanical friction degradation within articulation conduit.",
        "findings": [
            "Internal signaling copper core suffered micro-fracturing due to high cyclical twist stress parameters.",
            "Conduit guide retention bracket clamp assembly worked loose, exposing wire harness array."
        ],
        "risks": [
            "Intermittent signaling drops if secondary strain relief mounts aren't set down tight.",
            "Creep wear on neighboring electrical distribution cables inside the shared loom block."
        ],
        "actions": [
            "Execute local conductor wire splice using standard heavy-gauge thermal shrink links.",
            "Retrofit articulating joint module using high-flex industrial protective conduit shielding."
        ]
    },
    "REP-2026-X05": {
        "id": "REP-2026-X05",
        "name": "Exchanger Fluidic Matrix Descale Run",
        "type": "Work Order Effectiveness Review",
        "generated_by": "Dave Kincaid (HVAC Lead)",
        "date": "2026-06-16",
        "machine": "Rotary Compressor K-08",
        "status": "Ready for Review",
        "format": "XLSX",
        "risk_level": "LOW",
        "health_trend": "Stable (Core Flushed)",
        "mttr_impact": "-8 mins baseline",
        "savings": "$6,100 / Semester",
        "summary": "Post-remediation assessment of core cooling circuit loops after targeted chemical wash application metrics. Fluid movement thresholds fully returned to original operational blueprints.",
        "findings": [
            "Descaling agents successfully dissolved localized calcium carbonate layer profiles.",
            "Coolant radiator gasket replaced to eliminate secondary atmospheric leakage paths."
        ],
        "risks": [
            "Slow residual scaling aggregation if localized raw make-up water feed hardness spikes.",
            "Minor pressure differential drift until air pockets clear the distribution manifolds."
        ],
        "actions": [
            "Establish secondary chemical checking rules down inside daily routine inspection walks.",
            "Re-torque structural flange casing hex array down to strict manufacturer tolerances."
        ]
    }
}


# ==========================================================================
# ENDPOINTS
# ==========================================================================

@router.get("/reports", status_code=status.HTTP_200_OK)
def get_reports():
    """Returns the comprehensive data aggregation layout blocks required by the Command Center dashboard."""
    # Convert database map parameters down to a raw clean library list block
    report_library_list = list(MOCK_REPORTS_LEDGER.values())

    return {
        "status": "success",
        
        "overview_metrics": {
            "total_reports_generated": 1428,
            "reports_this_month": 42,
            "assets_covered_percent": 94.6,
            "compliance_score": 98.4,
            "open_audit_findings": 6,
            "ai_generated_reports": 312
        },
        
        "report_generation_options": {
            "assets": [
                "Hydraulic Press P-04",
                "CNC Milling Unit C-12",
                "Induction Furnace F-01",
                "Robotic Arm Assembly R-02",
                "Rotary Compressor K-08"
            ],
            "date_ranges": [
                {"label": "Previous 7 Days Trace", "value": "7"},
                {"label": "Previous 30 Days Trace", "value": "30"},
                {"label": "Full Structural Quarter", "value": "90"},
                {"label": "Comprehensive Annual Cycle", "value": "365"}
            ],
            "report_types": [
                {"label": "Executive Maintenance Summary", "value": "executive-summary"},
                {"label": "Asset Reliability Assessment", "value": "reliability-assessment"},
                {"label": "Predictive Maintenance Report", "value": "predictive-maint"},
                {"label": "Failure Investigation Report", "value": "failure-investigation"},
                {"label": "Compliance Audit Report", "value": "compliance-audit"},
                {"label": "Work Order Effectiveness Review", "value": "wo-effectiveness"},
                {"label": "Inventory Risk Assessment", "value": "inventory-risk"},
                {"label": "AI Prescriptive Maintenance Summary", "value": "ai-prescriptive"}
            ]
        },
        
        "report_library": report_library_list,
        
        "reliability_snapshot": {
            "top_risk_assets": [
                {"id": "1", "tag": "Hydraulic P-04", "risk": "high"},
                {"id": "2", "tag": "Milling Unit C-12", "risk": "med"},
                {"id": "3", "tag": "Conveyor Line V-02", "risk": "med"},
                {"id": "4", "tag": "Boiler Assembly B-09", "risk": "low"},
                {"id": "5", "tag": "Extruder E-11", "risk": "low"}
            ],
            "most_frequent_failure_code": {
                "code": "F-CODE: 402",
                "description": "Fluid Component Cavitation",
                "occurrences": 14
            },
            "highest_workload_department": {
                "name": "Heavy Fabrication",
                "utilization_rate": 84.0,
                "active_orders": 28
            },
            "compliance_trend": {
                "quarter": "Q2-2026",
                "score": 98.4,
                "delta": "+0.6%"
            },
            "preventive_vs_corrective": {
                "preventive_percent": 82.0,
                "corrective_percent": 18.0
            }
        },
        
        "ai_recommendations": [
            {
                "title": "Reduce vibration-related downtime on CNC C-12",
                "severity": "CRITICAL",
                "business_impact": "Prevents tool breakage risks saving estimated $9,500 replacement costs.",
                "action": "Review spindle resonance bearing tracks at weekly interval windows.",
                "benefit": "Preserves precise engineering tolerances required by ISO-9001 quality audits."
            },
            {
                "title": "Increase safety stock for Ceramic Bearing Sets",
                "severity": "HIGH",
                "business_impact": "Eliminates potential 3-day supply-chain lead-time exposure.",
                "action": "Adjust automatic procurement reorder threshold triggers to 4 units.",
                "benefit": "Drops potential unexpected down-time maintenance windows by 72 hours."
            },
            {
                "title": "Review hydraulic pressure instability trend",
                "severity": "MONITOR",
                "business_impact": "Prevents progressive fatigue degradation of main structural cylinder gaskets.",
                "action": "Complete full teardown of fluid line bypass valve V-12 during Q2 planned plant pause.",
                "benefit": "Secures full compliance alignment with secondary state environmental protection parameters."
            },
            {
                "title": "Calibrate Thermal Sensor Arrays on Furnace F-01",
                "severity": "LOW",
                "business_impact": "Mitigates minor thermal overshoot errors that increase regional energy fuel consumption metrics.",
                "action": "Deploy field team to recalibrate thermocouple output links using dry-well reference points.",
                "benefit": "Guarantees thermal signature audit documentation maps directly to reference parameters."
            }
        ],
        
        "compliance_metrics": {
            "loto_compliance": 100.0,
            "inspection_completion": 96.8,
            "documentation_coverage": 99.1,
            "manual_reference_coverage": 92.0,
            "safety_audit_pass_rate": 100.0
        },
        
        "export_center": {
            "formats": ["PDF", "Excel", "CSV", "Audit Package"],
            "export_ready": True,
            "last_generated_report": "REP-2026-X03"
        }
    }


@router.get("/reports/{report_id}", status_code=status.HTTP_200_OK)
def get_report_by_id(report_id: str):
    """Fetches high-density parameters matching a single standalone report document index."""
    target_key = report_id.upper().strip()
    
    if target_key not in MOCK_REPORTS_LEDGER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "status": "error",
                "message": "Report not found"
            }
        )
        
    return {
        "status": "success",
        "report": MOCK_REPORTS_LEDGER[target_key]
    }


@router.post("/reports/generate", status_code=status.HTTP_200_OK)
def generate_report(payload: dict):
    """Initializes simulated manufacturing intelligence engine logs to build an immutable data asset."""
    # Simulates direct layout generation tracking hooks without database locks
    return {
        "status": "success",
        "report_id": "REP-2026-X06",
        "message": "Report generation initiated",
        "estimated_completion": "30 seconds"
    }

@router.get("/settings")
def get_agent_settings():
    """
    Initializes all control points on Settings.jsx with complete system 
    hardware parameter configuration, semantic thresholds, and governance values.
    """
    return {
        "status": "success",
        "settings": {
            "telemetry": {
                "critical_temp": 95,
                "critical_vibration": 4.5,
                "pressure_drop": 1.2,
                "escalation_delay": 5,
                "auto_work_order": True
            },
            "retrieval": {
                "similarity_score": 0.75,
                "top_k": 4,
                "chunk_size": 512,
                "chunk_overlap": 64,
                "source_priority": "balanced",
                "confidence_cutoff": 0.70
            },
            "reasoning": {
                "llm_provider": "openai",
                "active_model": "gpt-4o-industrial",
                "max_context": 32768,
                "temperature": 0.15,
                "max_repair_steps": 12,
                "multi_step_planning": True,
                "tool_recommendation": True,
                "part_recommendation": True,
                "safety_validation_layer": True
            },
            "safety": {
                "loto_verification": True,
                "human_approval": True,
                "citation_required": True,
                "auto_reject_low_confidence": False
            },
            "memory": {
                "context_window": 4,
                "memory_depth": 20,
                "store_previous_repairs": True,
                "use_historical_orders": True
            }
        }
    }


# ============================================================================
# GET SETTINGS
# Returns all settings, health and integrations in a single request
# ============================================================================

# Operational baseline defaults for the system rollback option
DEFAULT_SETTINGS = {
    "telemetry": {
        "critical_temp": 90,
        "severity_filter": "warning"
    },
    "retrieval": {
        "similarity_score": 0.8,
        "top_k": 5,
        "chunk_size": 512,
        "chunk_overlap": 64,
        "confidence_cutoff": 0.75
    },
    "reasoning": {
        "llm_provider": "openai",
        "active_model": "gpt-4o",
        "temperature": 0.2
    },
    "safety": {
        "human_approval": True,
        "citation_required": True
    },
    "notifications": {
        "email_enabled": True
    }
}

# ============================================================================
# LOAD SETTINGS (Synchronized route path)
# ============================================================================
@router.get("/settings")
def get_settings():
    try:
        # Read settings.json dynamically from local operational space
        with open(SETTINGS_FILE, "r") as file:
            settings = json.load(file)
    except FileNotFoundError:
        # Safe self-healing step if settings file has not been initialized yet
        settings = DEFAULT_SETTINGS
        with open(SETTINGS_FILE, "w") as file:
            json.dump(settings, file, indent=4)

    return {
        "status": "success",
        "settings": settings,
        "health": {
            "agent_status": "nominal",
            "retrieval_accuracy": 94.62,
            "avg_context_score": 0.814,
            "avg_response_time_ms": 1420,
            "estimated_context_precision": 88.6,
            "indexed_corpus_weight": 14240,
            "active_manuals": 84,
        },
        "integrations": [
            {
                "name": "ChromaDB",
                "status": "connected",
                "endpoint": "/chromadb",
            },
            {
                "name": "LLM Engine",
                "status": "connected",
                "endpoint": "/llm"
            },
            {
                "name": "Telemetry Service",
                "status": "connected",
                "endpoint": "/telemetry"
            },
            {
                "name": "Email Service",
                "status": "connected",
                "endpoint": "/email"
            }
        ],
    }

# ============================================================================
# SAVE SETTINGS (Writes structural changes down to settings.json)
# ============================================================================
@router.put("/settings")
async def update_settings(request: Request):
    try:
        payload = await request.json()
        
        # Save operational matrix modifications into config/settings.json
        with open(SETTINGS_FILE, "w") as file:
            json.dump(payload, file, indent=4)

        return {
            "status": "success",
            "message": "Settings updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save cluster configuration: {str(e)}")

# ============================================================================
# RESET SETTINGS (Restores functional baseline configuration map)
# ============================================================================
@router.post("/settings/reset")
def reset_settings():
    try:
        # Re-write file with default profile boundaries
        with open(SETTINGS_FILE, "w") as file:
            json.dump(DEFAULT_SETTINGS, file, indent=4)

        return {
            "status": "success",
            "message": "Settings restored to default configuration baseline"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore baseline: {str(e)}")
