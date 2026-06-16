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