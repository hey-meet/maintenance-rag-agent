from fastapi import FastAPI
from api.telemetry import router as telemetry_router

app = FastAPI(
    title="Maintenance RAG Agent",
    version="1.0.0"
)

app.include_router(
    telemetry_router,
    prefix="/api/telemetry",
    tags=["Telemetry"]
)

@app.get("/")
def root():
    return {
        "message": "Maintenance RAG Agent Running"
    }