import os
from pathlib import Path
from datetime import date
from typing import Dict, List, Optional
from PyPDF2 import PdfReader
from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel

from models.telemetry_schema import TelemetryAlert
from retrieval.query_generator import generate_query_from_alert
from retrieval.retriever import Retriever
from retrieval.context_builder import build_context

router = APIRouter()

retriever = Retriever()


@router.post("/alert")
def receive_alert(payload: TelemetryAlert):

    try:

        query = generate_query_from_alert({
            "machine_id": payload.machine_id,
            "error_code": payload.error_code,
            "temperature": payload.temp
        })

        retrieved_results = retriever.search(query)

        context = build_context(
            query=query,
            retrieved_results=retrieved_results,
            alert={
                "machine_id": payload.machine_id,
                "error_code": payload.error_code
            }
        )

        return {
            "status": "success",
            "message": "Telemetry retrieval pipeline completed",
            "context": context
        }

    except Exception as e:

        return {
            "status": "error",
            "message": "Internal server error",
            "details": str(e)
        }

@router.get("/dashboard")
def get_dashboard():

    alerts = get_alerts()
    work_orders = get_work_orders()
    inventory = get_inventory()

    manuals = get_manuals()

    agent_status = get_agent_status()

    agent_memory = get_agent_memory()

    return {

        "systemOverview": {

            "active_alerts":
                agent_status.active_alerts,

            "open_work_orders":
                agent_status.open_work_orders,

            "indexed_manuals":
                agent_status.indexed_manuals,

            "inventory_risks":
                agent_status.inventory_risks,

            "vector_chunks":
                agent_status.vector_chunks
        },

        "machineHealthMatrix": {
            "alerts": alerts["alerts"]
        },

        "liveVitals": {
            "telemetry":
                agent_memory.active_alert
        },

        "diagnosticFlow": {

            "agent_state":
                agent_status.state,

            "manual_context":
                agent_memory.manual_context,

            "inventory_context":
                agent_memory.inventory_context,

            "active_work_order":
                agent_memory.active_work_order
        },

        "activeAlerts":
            alerts["alerts"],

        "predictiveMaintenance":
            inventory["inventory"],

        "workOrders":
            work_orders["work_orders"],

        "activityFeed": {

            "alerts":
                alerts["alerts"],

            "work_orders":
                work_orders["work_orders"]
        }
    }


@router.get("/alerts")
def get_alerts():

    return {
        "status": "success",
        "alerts": [
            {
                "alert_id": "ALT-2026-001",
                "machine_id": "PUMP-01",
                "error_code": "E-404",
                "temperature": 105,
                "severity": "critical",
                "status": "active",
                "timestamp": "2026-06-17 23:10:00"
            },
            {
                "alert_id": "ALT-2026-002",
                "machine_id": "CNC-03",
                "error_code": "E-221",
                "temperature": 87,
                "severity": "warning",
                "status": "active",
                "timestamp": "2026-06-17 22:45:00"
            },
            {
                "alert_id": "ALT-2026-003",
                "machine_id": "LATHE-01",
                "error_code": "E-110",
                "temperature": 72,
                "severity": "warning",
                "status": "resolved",
                "timestamp": "2026-06-17 21:15:00"
            }
        ]
    }


@router.get("/work-orders")
def get_work_orders():

    return {
        "status": "success",
        "work_orders": [
            {
                "work_order_id": "WO-2026-801",
                "machine_id": "Hydraulic Press P-04",
                "error_code": "E-4042: Main pressure line micro-fracture & seal structural fault",
                "priority": "critical",
                "status": "in_progress",
                "assigned_department": "Hydraulics & Heavy Mechanical",
                "due_date": "2026-06-18",
                # Future AI Agent Output
                "recommended_steps": [
                    "Isolate hydraulic press fluid line V-12 and bleed remaining system pressure.",
                    "Degrease assembly casing to expose the micro-fracture boundary.",
                    "Execute precision TIG weld overlay along the structural fault line.",
                    "Replace high-pressure nitrile seals on primary manifold ports."
                ],
                # Future AI Agent Output
                "required_tools": ["TIG Welder", "Flaw Detector", "Hydraulic Torque Wrench"],
                # Future AI Agent Output
                "required_parts": ["Nitrile Seal Kit P04-S", "ISO 46 Hydraulic Fluid (20L)"],
                # Future AI Agent Output
                "manual_reference": {
                    "source": "SOP-MAINT-HYD-04",
                    "page": "42",
                    "section": "Sec. 4.2: High-Pressure Containment Remediation"
                }
            },
            {
                "work_order_id": "WO-2026-802",
                "machine_id": "CNC Milling Unit C-12",
                "error_code": "E-1108: Spindle harmonic resonance bearing tolerance breach",
                "priority": "high",
                "status": "in_progress",
                "assigned_department": "Precision Automation Systems",
                "due_date": "2026-06-19",
                # Future AI Agent Output
                "recommended_steps": [
                    "Disassemble spindle housing assembly and extract worn ceramic bearings.",
                    "Inspect spindle shaft alignment using digital optical micrometer.",
                    "Press-fit premium grade-5 replacement bearing tracks.",
                    "Execute baseline vibration calibration sweep at 12,000 RPM."
                ],
                # Future AI Agent Output
                "required_tools": ["Digital Micrometer", "Hydraulic Press Tool", "Vibration Analyzer"],
                # Future AI Agent Output
                "required_parts": ["Ceramic Bearing Set C12-BRG", "Lithium Complex Grease"],
                # Future AI Agent Output
                "manual_reference": {
                    "source": "CNC-M-TH-09",
                    "page": "115",
                    "section": "Sec. 11.8: Axis Rotor Stabilization Assembly"
                }
            },
            {
                "work_order_id": "WO-2026-803",
                "machine_id": "Robotic Arm Assembly R-02",
                "error_code": "E-8821: Axis 3 servo motor wiring harness continuity loss",
                "priority": "medium",
                "status": "on_hold",
                "assigned_department": "Robotics Engineering",
                "due_date": "2026-06-22",
                # Future AI Agent Output
                "recommended_steps": [
                    "Remove articulating joint safety shielding from Axis 3 framework.",
                    "Run complete pin-to-pin continuity trace using analytical multimeter.",
                    "Splice and insulate fractured conductor paths within the main loom.",
                    "Re-secure flexible conduit bracket to prevent future friction wear."
                ],
                # Future AI Agent Output
                "required_tools": ["Insulated Wire Strippers", "Digital Multimeter", "Heat Shrink Gun"],
                # Future AI Agent Output
                "required_parts": ["Shielded Multi-Core Harness Section", "Conduit Clamps"],
                # Future AI Agent Output
                "manual_reference": {
                    "source": "ROB-SYS-VOL2",
                    "page": "204",
                    "section": "Sec. 3.7: Multi-Axis Harness Architecture Calibration"
                }
            },
            {
                "work_order_id": "WO-2026-804",
                "machine_id": "Rotary Compressor K-08",
                "error_code": "E-0339: Post-overheating safety loop & core thermal blockage",
                "priority": "high",
                "status": "completed",
                "assigned_department": "Thermal Infrastructure & HVAC",
                "due_date": "2026-06-16",
                # Future AI Agent Output
                "recommended_steps": [
                    "Drain system cooling lines into designated environmental storage tanks.",
                    "Pump heavy descaling solution through internal cooling core matrix.",
                    "Verify coolant flow sensor activation rates post-flush.",
                    "Re-torque structural casing bolts according to factory spec."
                ],
                # Future AI Agent Output
                "required_tools": ["Pneumatic Flushing Rig", "Calibrated Torque Wrench"],
                # Future AI Agent Output
                "required_parts": ["Descaling Agent (5L)", "Coolant Radiator Gasket K8"],
                # Future AI Agent Output
                "manual_reference": {
                    "source": "COMP-MAINT-01",
                    "page": "89",
                    "section": "Sec. 9.1: Liquid-to-Air Exchanger Matrix Flushing"
                }
            },
            {
                "work_order_id": "WO-2026-805",
                "machine_id": "Induction Furnace F-01",
                "error_code": "E-7112: Secondary pump switchgear contactor mechanical oxidization",
                "priority": "medium",
                "status": "completed",
                "assigned_department": "High-Voltage Plant Electrical",
                "due_date": "2026-06-15",
                # Future AI Agent Output
                "recommended_steps": [
                    "Lock out, tag out (LOTO) main power distribution box sub-panel 4.",
                    "Remove pitted and oxidized mechanical contactor assembly blocks.",
                    "Install heavy-duty 400A vacuum contactor onto DIN rail mounting.",
                    "Test coil engagement sequence under simulated load conditions."
                ],
                # Future AI Agent Output
                "required_tools": ["LOTO Kit", "Insulated Screwdriver Set", "Phase Rotation Meter"],
                # Future AI Agent Output
                "required_parts": ["400A Vacuum Contactor", "DIN Rail Terminal Blocks"],
                # Future AI Agent Output
                "manual_reference": {
                    "source": "FURN-ELE-P3",
                    "page": "14",
                    "section": "Sec. 1.4: High-Amperage Solenoid Switching Topologies"
                }
            }
        ]
    }

@router.get("/inventory")
def get_inventory():
    return {
        "status": "success",
        "inventory": [
            {
                "part_id": "PART-992-A",
                "part_name": "Nitrile Seal Kit P04-S",
                "part_code": "SK-NIT-04",
                "category": "Hydraulics",
                "current_stock": 14,
                "minimum_stock": 15,
                "status": "low_stock",
                "warehouse_location": "Bay 3, Shelf B",
                "supplier": "Fluitronics Corp.",
                "lead_time_days": 3,
                "unit_cost_inr": 3550,
                "compatible_machines": [
                    "Hydraulic Press P-04",
                    "Hydraulic Press P-05"
                ],
                "linked_work_orders": [
                    "WO-2026-801",
                    "WO-2026-804"
                ]
            },
            {
                "part_id": "PART-881-C",
                "part_name": "Ceramic Bearing Set C12-BRG",
                "part_code": "BRG-CER-12",
                "category": "Mechanical",
                "current_stock": 0,
                "minimum_stock": 4,
                "status": "out_of_stock",
                "warehouse_location": "Bay 1, Secure Cage",
                "supplier": "Apex Precision Rotors",
                "lead_time_days": 7,
                "unit_cost_inr": 25800,
                "compatible_machines": [
                    "CNC Milling Unit C-12",
                    "CNC Lathe L-09"
                ],
                "linked_work_orders": [
                    "WO-2026-812"
                ]
            },
            {
                "part_id": "PART-109-M",
                "part_name": "400A Vacuum Contactor",
                "part_code": "CON-VAC-400",
                "category": "Electrical",
                "current_stock": 3,
                "minimum_stock": 2,
                "status": "in_stock",
                "warehouse_location": "Bay 4, Cabinet E",
                "supplier": "Schneider Heavy Indus.",
                "lead_time_days": 12,
                "unit_cost_inr": 104000,
                "compatible_machines": [
                    "Induction Furnace F-01"
                ],
                "linked_work_orders": []
            }
        ]
    }


# =========================================================================
# KNOWLEDGE BASE SCHEMAS, REGISTRY & ROUTES (APPENDED FOR WEEK 3)
# =========================================================================

MANUALS_DIR = Path("data/manuals")

class ManualResponseSchema(BaseModel):
    manual_id: str
    machine_id: str
    file_name: str
    manual_type: str
    version: str
    pages: int
    status: str
    upload_date: str
    total_chunks: int
    indexed_chunks: int

# Dynamic configuration index mapping real file strings to factory operational definitions
KNOWLEDGE_FALLBACK_INDEX: Dict[str, Dict] = {
    "OM-HYD-SEC4.2_v2.pdf": {
        "machine_id": "Hydraulic Press P-04",
        "manual_type": "Operator Manual",
        "version": "4.2",
        "status": "indexed",
        "upload_date": "2026-06-15",
        "density_ratio": 4
    },
    "CNC-M-TH-09_factory.pdf": {
        "machine_id": "CNC Milling Unit C-12",
        "manual_type": "Technical Manual",
        "version": "9.1",
        "status": "indexed",
        "upload_date": "2026-06-16",
        "density_ratio": 4
    },
    "ROB-SYS-VOL2_revised.pdf": {
        "machine_id": "Robotic Arm Assembly R-02",
        "manual_type": "Wiring Diagrams",
        "version": "2.0",
        "status": "indexing",
        "upload_date": "2026-06-17",
        "density_ratio": 4
    },
    "A16B-1600-0520(CNC).pdf": {
        "machine_id": "CNC-01",
        "manual_type": "Technical Manual",
        "version": "1.0",
        "status": "indexed",
        "upload_date": "2026-06-17",
        "density_ratio": 2
    }
}


def compute_pdf_pages(file_path: Path) -> int:
    """Safely extracts overall file page parameters using PyPDF2 binary context tracking."""
    try:
        with open(file_path, "rb") as pdf_file:
            reader = PdfReader(pdf_file)
            return len(reader.pages)
    except Exception:
        return 120  # Stable fallback page boundary


def parse_local_knowledge_base() -> Dict[str, ManualResponseSchema]:
    """Scans physical directory storage workspace and populates standardized schemas."""
    ledger: Dict[str, ManualResponseSchema] = {}
    
    if not MANUALS_DIR.exists():
        MANUALS_DIR.mkdir(parents=True, exist_ok=True)
    
    pdf_assets = sorted([p for p in MANUALS_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".pdf"])
    
    for rank, asset_path in enumerate(pdf_assets, start=1):
        name_string = asset_path.name
        generated_id = f"DOC-{rank:03d}"
        
        extracted_pages = compute_pdf_pages(asset_path)
        metadata_preset = KNOWLEDGE_FALLBACK_INDEX.get(
            name_string,
            {
                "machine_id": f"ASSET-ID-ENG-{rank:02d}",
                "manual_type": "Technical Manual",
                "version": "1.0",
                "status": "indexed",
                "upload_date": str(date.today()),
                "density_ratio": 3
            }
        )
        
        ratio = metadata_preset.get("density_ratio", 4)
        calculated_total = extracted_pages * ratio
        calculated_indexed = int(calculated_total * 0.7) if metadata_preset.get("status") == "indexing" else calculated_total
        
        ledger[generated_id] = ManualResponseSchema(
            manual_id=generated_id,
            machine_id=metadata_preset.get("machine_id"),
            file_name=name_string,
            manual_type=metadata_preset.get("manual_type"),
            version=metadata_preset.get("version"),
            pages=extracted_pages,
            status=metadata_preset.get("status"),
            upload_date=metadata_preset.get("upload_date"),
            total_chunks=calculated_total,
            indexed_chunks=calculated_indexed
        )
        
    return ledger


@router.get("/manuals", status_code=status.HTTP_200_OK)
def get_manuals():
    """Returns read-only list payload tracking all scanned knowledge assets inside data/manuals/."""
    current_ledger = parse_local_knowledge_base()
    all_manuals = list(current_ledger.values())
    
    return {
        "status": "success",
        "total_manuals": len(all_manuals),
        "manuals": all_manuals
    }


@router.get("/manuals/{manual_id}", status_code=status.HTTP_200_OK)
def get_manual_by_id(manual_id: str):
    """Fetches full parameter block metrics isolated to a standalone file index."""
    current_ledger = parse_local_knowledge_base()
    selected_manual = current_ledger.get(manual_id.upper())
    
    if not selected_manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "status": "error",
                "message": f"Manual asset code '{manual_id}' not found within system memory indexes."
            }
        )
        
    return {
        "status": "success",
        "manual": selected_manual
    }


# =========================================================================
# AI ASSISTANT ROUTER EXTENSIONS & NEW PYDANTIC MODELS (ADDED FOR AGENT APP)
# =========================================================================

class AgentQueryRequest(BaseModel):
    query: str


class ManualReferenceSchema(BaseModel):
    docId: str
    page: str
    section: str


class AgentQueryResponse(BaseModel):
    analysis: str
    severity: str
    department: str
    estimated_time: str
    recommended_steps: List[str]
    required_tools: List[str]
    required_parts: List[str]
    manual_reference: ManualReferenceSchema
    inventory_status: str
    work_order: str


class AgentStatusResponse(BaseModel):
    state: str
    active_alerts: int
    open_work_orders: int
    indexed_manuals: int
    inventory_risks: int
    vector_chunks: int


class AgentMemoryResponse(BaseModel):
    active_alert: Dict
    active_work_order: Dict
    inventory_context: Dict
    manual_context: Dict


class AgentDashboardSummaryResponse(BaseModel):
    active_alerts: int
    open_work_orders: int
    indexed_manuals: int
    inventory_risks: int
    vector_chunks: int


@router.post("/agent/query", response_model=AgentQueryResponse, status_code=status.HTTP_200_OK)
def agent_query(payload: AgentQueryRequest):
    """
    Executes prescriptive maintenance logic based on input query string parameters.
    
    Future Integration Points:
    - Future: LangGraph Agent orchestrator mapping logic dependencies.
    - Future: ChromaDB Retrieval layer parsing semantic document manual segments.
    - Future: Inventory Validation Service checking current ERP stock balances.
    - Future: Work Order Service submitting tracking parameters directly to plant database.
    """
    user_query = payload.query.lower()
    
    # Intelligent response fallback matching target mock telemetry structures
    if "furnace" in user_query or "f-01" in user_query:
        return AgentQueryResponse(
            analysis=f'Target evaluation sequence executed for: "{payload.query}". Secondary induction loop switchgear thermal signature anomalous. Micro-oxidization verified on high-voltage contact blocks.',
            severity="HIGH",
            department="High-Voltage Plant Electrical",
            estimated_time="30 Mins",
            recommended_steps=[
                "Lock out, tag out (LOTO) main power distribution box sub-panel 4.",
                "Remove pitted and oxidized mechanical contactor assembly blocks.",
                "Install heavy-duty 400A vacuum contactor onto DIN rail mounting."
            ],
            required_tools=["LOTO Kit", "Insulated Screwdriver Set", "Phase Rotation Meter"],
            required_parts=["400A Vacuum Contactor", "DIN Rail Terminal Blocks"],
            manual_reference=ManualReferenceSchema(
                docId="FURN-ELE-P3",
                page="Page 14",
                section="Sec. 1.4"
            ),
            inventory_status="VERIFIED_AVAILABLE (3 units in Central Cage B)",
            work_order="WO-2026-805"
        )
    
    # Default high pressure hydraulic manifold resolution fallback payload mapping
    return AgentQueryResponse(
        analysis=f'Target evaluation sequence executed for: "{payload.query}". Thermal runaway sequence verified in Hydraulic Press P-04 pressure manifold. Vector match isolates anomalous micro-frictional degradation inside bypass line V-12.',
        severity="CRITICAL",
        department="Hydraulics / Mechanical Maintenance",
        estimated_time="45 Mins",
        recommended_steps=[
            "Depressurize main reservoir line accumulator circuit.",
            "Manually isolate bypass valve V-12 and install primary lockout tag.",
            "Inspect internal spool seating surfaces for micro-frictional scoring."
        ],
        required_tools=["Analog Pressure Calibrator", "32mm Spanner set", "Lockout/Tagout Kit"],
        required_parts=["V-12 Viton Seal Kit (Part #HYD-9902)", "Bypass Spool Core Assembly"],
        manual_reference=ManualReferenceSchema(
            docId="OM-HYD-SEC4.2",
            page="Page 42",
            section="Sec 4.2.1"
        ),
        inventory_status="VERIFIED_AVAILABLE (2 units in Central Cage B)",
        work_order="WO-2026-88402"
    )


@router.get("/agent/status", response_model=AgentStatusResponse, status_code=status.HTTP_200_OK)
def get_agent_status():
    """
    Returns general system metrics tracking cognitive workflow pipeline parameters.
    
    Future Integration Points:
    - Future: Analytics Service providing live runtime engine performance properties.
    """
    return AgentStatusResponse(
        state="idle",
        active_alerts=3,
        open_work_orders=14,
        indexed_manuals=3,
        inventory_risks=2,
        vector_chunks=42890
    )


@router.get("/agent/memory", response_model=AgentMemoryResponse, status_code=status.HTTP_200_OK)
def get_agent_memory():
    """
    Returns real-time contextual cache snapshot holding working environment items.
    
    Future Integration Points:
    - Future: LangGraph Agent transient state variables and checkpoint history trackers.
    """
    return AgentMemoryResponse(
        active_alert={
            "machine_id": "Hydraulic Press P-04",
            "error_code": "E-4042",
            "telemetry_metrics": {"temperature": 105.4, "pressure": 92.1}
        },
        active_work_order={
            "work_order_id": "WO-2026-801",
            "status": "in_progress",
            "assigned_team": "Hydraulics Heavy Maintenance"
        },
        inventory_context={
            "required_part": "Nitrile Seal Kit P04-S",
            "stock_status": "low_stock",
            "available_units": 14
        },
        manual_context={
            "document_id": "OM-HYD-SEC4.2_v2.pdf",
            "active_section": "Sec. 4.2: High-Pressure Containment Remediation",
            "relevance_score": 0.942
        }
    )


@router.get("/agent/prompts", response_model=List[str], status_code=status.HTTP_200_OK)
def get_agent_prompts():
    """
    Returns static historical suggested query arrays for conversational context entry fields.
    """
    return [
        "Isolate diagnostic steps for hydraulic pump error code E-HYD-402",
        "Compile thermal risk analysis summary for Induction Furnace F-01",
        "Generate work order for CNC spindle vibration anomaly"
    ]


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

# ======================================================================
# ROUTE 2: LIVE AGENT CORE HEALTH METRICS
# ======================================================================
@router.get("/settings/agent-health")
def get_agent_health():
    """
    Supplies telemetry metrics for the Live Agent Health Dashboard module.
    """
    return {
        "status": "success",
        "agent_status": "nominal",
        "retrieval_accuracy": 94.62,
        "avg_context_score": 0.814,
        "avg_response_time_ms": 1420,
        "indexed_manuals": 84,
        "vector_chunks": 112450,
        "query_success_rate": 100.0
    }

# ======================================================================
# ROUTE 3: DISTRIBUTED PLATFORM CONNECTIONS
# ======================================================================
@router.get("/settings/integrations")
def get_platform_integrations():
    """
    Exposes industrial cluster integration binding states for data node mapping.
    """
    return {
        "status": "success",
        "integrations": [
            {
                "name": "ChromaDB Cluster",
                "status": "connected",
                "endpoint": "http://localhost:8000/chromadb"
            },
            {
                "name": "LLM Orchestrator",
                "status": "connected",
                "endpoint": "http://localhost:8000/llm"
            },
            {
                "name": "Telemetry Stream",
                "status": "connected",
                "endpoint": "mqtt://telemetry-broker"
            },
            {
                "name": "CMMS Work Order Service",
                "status": "degraded",
                "endpoint": "http://localhost:8000/work-orders"
            },
            {
                "name": "Inventory Service",
                "status": "connected",
                "endpoint": "http://localhost:8000/inventory"
            }
        ]
    }

# ======================================================================
# ROUTE 4: RETRIEVAL ENGINE ANCILLARY DATA
# ======================================================================
@router.get("/settings/retrieval-metrics")
def get_retrieval_metrics():
    """
    Retrieves dynamic semantic retrieval metrics from vector space nodes.
    """
    return {
        "status": "success",
        "estimated_context_precision": 88.6,
        "indexed_corpus_weight": 14240,
        "active_manuals": 84,
        "average_chunk_score": 0.89,
        "retrieval_latency_ms": 240
    }

# ======================================================================
# ROUTE 5: EPHEMERAL MEMORY PERFORMANCE METRICS
# ======================================================================
@router.get("/settings/memory-metrics")
def get_memory_metrics():
    """
    Returns running diagnostics on historical context caching performance.
    """
    return {
        "status": "success",
        "memory_usage_mb": 42.8,
        "memory_limit_mb": 512,
        "stored_repair_histories": 286,
        "historical_work_orders": 1248,
        "active_context_sessions": 18
    }

# ======================================================================
# ROUTE 6: PRODUCTION LIVE DEPLOY ORCHESTRATION
# ======================================================================
@router.post("/settings/deploy")
async def deploy_agent_configuration(request: Request):
    """
    Deploys the altered agent matrix to live edge cluster services.
    Uses generic body extraction avoiding validation models.
    """
    payload = await request.json()
    
    # Process modifications asynchronously inside the runtime if required
    return {
        "status": "success",
        "message": "Agent configuration deployed successfully",
        "deployment_id": "CFG-2026-001",
        "affected_services": [
            "telemetry",
            "retrieval",
            "reasoning",
            "safety",
            "memory"
        ]
    }

# ======================================================================
# ROUTE 7: BASELINE RESTORATION ROLLBACK
# ======================================================================
@router.post("/settings/reset")
def rollback_configuration_baseline():
    """
    Flushes all current runtime state deviations and falls back to system profile defaults.
    """
    return {
        "status": "success",
        "message": "Configuration restored to operational baseline",
        "baseline_profile": "Industrial_Default_v1"
    }        