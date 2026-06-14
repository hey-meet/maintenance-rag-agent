from fastapi import APIRouter

from retrieval.query_generator import generate_query_from_alert
from retrieval.retriever import Retriever
from retrieval.context_builder import build_context

router = APIRouter()

retriever = Retriever()


@router.post("/alert")
def receive_alert(payload: dict):

    try:

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

        query = generate_query_from_alert({
            "machine_id": machine_id,
            "error_code": error_code,
            "temperature": temp
        })

        retrieved_results = retriever.search(query)

        context = build_context(
            query=query,
            retrieved_results=retrieved_results
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