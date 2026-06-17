from fastapi import APIRouter

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

