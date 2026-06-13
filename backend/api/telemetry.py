from fastapi import APIRouter
from backend.models.telemetry_schema import TelemetryAlert

router = APIRouter()


@router.post("/alert")
async def receive_telemetry_alert(alert: TelemetryAlert):

    print("\nTelemetry Alert Received")
    print(alert.model_dump())

    return {
        "status": "success",
        "message": "Telemetry alert received"
    }