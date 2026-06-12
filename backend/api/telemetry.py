from fastapi import APIRouter

router = APIRouter()


@router.post("/alert")
def receive_alert(payload: dict):

    machine_id = payload.get("machine_id")
    error_code = payload.get("error_code")
    temp = payload.get("temp")

    if not machine_id:
        return {
            "status": "error",
            "message": "machine_id is required"
        }

    if not error_code:
        return {
            "status": "error",
            "message": "error_code is required"
        }

    if temp is None:
        return {
            "status": "error",
            "message": "temp is required"
        }

    if not isinstance(temp, (int, float)):
        return {
            "status": "error",
            "message": "temp must be numeric"
        }

    print(payload)

    return {
        "status": "success",
        "message": "Telemetry alert received",
        "data": payload
    }