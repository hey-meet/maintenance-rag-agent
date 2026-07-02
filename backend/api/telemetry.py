import os
import json
import shutil
import uuid
from pathlib import Path
from datetime import date
from datetime import datetime ,timedelta
from collections import Counter
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
from utils.worker_service import filter_workers_by_department
from utils.machine_health import get_machine_health_summary
from api.reports import router as reports_router
from api.analytics import router as analytics_router

router = APIRouter()
print("Reports router imported:", reports_router)

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

# ============================================================================
# MACHINE HEALTH
# Generates machine health metrics from alert history
# ============================================================================

@router.get("/machine-health")
def get_machine_health():
    return get_machine_health_summary()

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

    validated_alerts = []

    for alert in data:
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

    Fetches telemetry alerts for the AI Assistant while preserving the
    complete original telemetry payload for downstream processing.
    """

    system_alerts_payload = get_alerts()
    raw_alerts = system_alerts_payload.get("alerts", [])

    agent_formatted_alerts = []

    for alert in raw_alerts:

        agent_formatted_alerts.append({

            # -----------------------------
            # UI Display Fields
            # -----------------------------
            "id": alert.get("alert_id", "UNKNOWN"),
            "component": alert.get("machine_id", "Unknown Asset"),
            "issue": f"Error Code {alert.get('error_code', 'N/A')} detected",
            "severity": alert.get("severity", "warning"),
            "timestamp": "Active" if alert.get("status") == "active" else "Resolved",

            # -----------------------------
            # ORIGINAL TELEMETRY PAYLOAD
            # (Required by Maintenance Agent)
            # -----------------------------
            "alert_id": alert.get("alert_id"),
            "machine_id": alert.get("machine_id"),
            "error_code": alert.get("error_code"),
            "temperature": alert.get("temperature"),
            "status": alert.get("status"),
            "severity_raw": alert.get("severity"),
            "original_timestamp": alert.get("timestamp")
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

            "alert_id": work_order.get(
                "alert_id",
                "UNKNOWN"
            ),

            "machine": work_order.get(
                "machine_id",
                "UNKNOWN"
            ),

            "error_code": work_order.get(
                "error_code",
                "N/A"
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
        "alert_id": "N/A",
        "machine": "NO ACTIVE ALERT",
        "error_code": "N/A",
        "priority": "LOW",
        "status": "WAITING",
        "assigned_team": "Maintenance Team",
        "estimated_time": "Unknown"
    }
# --------------------------------- REPORT ROUTES ---------------------------------
router.include_router(reports_router)

#------------------------------------ANALYTICS ROUTES-------------------------------------
router.include_router(analytics_router)

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
        "chunk_size": 100,
        "chunk_overlap": 200,
        "confidence_cutoff": 0.75
    },
    "reasoning": {
        "llm_provider": "openai",
        "active_model": "gpt-4o",
        "temperature": 0.2
    }
}
# ============================================================================
# LOAD SETTINGS (Synchronized route path)
# ============================================================================
@router.get("/settings")
def get_settings():
    try:
        # Read settings.json dynamically
        with open(SETTINGS_FILE, "r") as file:
            settings = json.load(file)

    except FileNotFoundError:
        # Initialize settings with operational defaults
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
        }
    }
# ============================================================================
# SAVE SETTINGS (Writes structural changes down to settings.json)
# ============================================================================
@router.put("/settings")
async def update_settings(request: Request):
    try:
        payload = await request.json()

        with open(SETTINGS_FILE, "w") as file:
            json.dump(payload, file, indent=4)

        return {
            "status": "success",
            "message": "Settings updated successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save configuration: {str(e)}"
        )
# ============================================================================
# RESET SETTINGS (Restores functional baseline configuration map)
# ============================================================================
@router.post("/settings/reset")
def reset_settings():
    try:
        with open(SETTINGS_FILE, "w") as file:
            json.dump(DEFAULT_SETTINGS, file, indent=4)

        return {
            "status": "success",
            "message": "Settings restored to default configuration"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restore default settings: {str(e)}"
        )