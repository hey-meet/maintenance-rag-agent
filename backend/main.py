from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.telemetry import router as telemetry_router

app = FastAPI(
    title="Maintenance RAG Agent",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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