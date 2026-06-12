from pydantic import BaseModel, Field
from typing import Optional


class TelemetryAlert(BaseModel):
    machine_id: str = Field(..., min_length=1)
    error_code: str = Field(..., min_length=1)
    temp: float
    timestamp: Optional[str] = None