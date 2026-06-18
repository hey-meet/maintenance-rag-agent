import os
from pathlib import Path
from datetime import date
from typing import Dict, List, Optional
from PyPDF2 import PdfReader
from fastapi import APIRouter, HTTPException, status
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
def get_dashboard_data():

    return {
        "status": "success",

        "active_alerts": [
            {
                "machine_id": "PUMP-01",
                "error_code": "E-404",
                "severity": "Critical",
                "temperature": 105
            }
        ],

        "machine_health": {
            "healthy": 12,
            "warning": 3,
            "critical": 1
        },

        "telemetry": {
            "temperature": 105,
            "vibration": 6.8,
            "rpm": 1420,
            "pressure": 92
        },

        "activity_feed": [
            {
                "time": "11:20 PM",
                "event": "Telemetry alert received"
            },
            {
                "time": "11:21 PM",
                "event": "Query generated"
            },
            {
                "time": "11:21 PM",
                "event": "3 chunks retrieved"
            },
            {
                "time": "11:21 PM",
                "event": "Context built"
            }
        ],

        "work_orders": [
            {
                "id": "WO-1001",
                "machine": "PUMP-01",
                "status": "Pending"
            }
        ]
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


@router.get("/agent/dashboard", response_model=AgentDashboardSummaryResponse, status_code=status.HTTP_200_OK)
def get_agent_dashboard_summary():
    """
    Aggregates overall analytics tracking infrastructure counts for dashboard visual grids.
    
    Future Integration Points:
    - Future: Manual Retrieval Service parsing file directories directly.
    """
    return AgentDashboardSummaryResponse(
        active_alerts=3,
        open_work_orders=14,
        indexed_manuals=3,
        inventory_risks=2,
        vector_chunks=42890
    )

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