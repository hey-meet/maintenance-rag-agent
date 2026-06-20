from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, validator


class TelemetryAlert(BaseModel):

    alert_id: Optional[str] = Field(
        default=None,
        description="Unique alert identifier (e.g. ALT-2026-001)"
    ) 

    machine_id: str = Field(
        ...,
        description="ID of the industrial machine"
    )

    error_code: str = Field(
        ...,
        description="Machine error code"
    )

    temp: float = Field(
        ...,
        description="Machine temperature"
    )

    severity:Literal["critical", "warning"]=Field(
        ...,
        description="Alert severity level: 'critical' or 'warning'"
    )

    status:Literal["active", "resolved"] = Field(
        ...,
        description= "Alert status: 'active' or 'breakdown'"

    )

    timestamp: Optional[datetime]=Field(
        default=None,
        description="Datetime when the alert was triggered"
    )

    @validator("machine_id", "error_code")
    def clean_strings(cls, value):

        if not value or not value.strip():
            raise ValueError(
                "Field cannot be empty or blank spaces."
            )

        return value.strip().upper()

    @validator("alert_id", pre=True, always=True)
    def clean_alert_id(cls, value):
        
        if value is not None:
            return value.strip().upper()
        return value
    
    @validator("temp")
    def validate_tempe(cls, value):
        
        if value < -50 or value > 1500:
            raise ValueError(
                f"Temperature {value}°C is out of realistic range (-50 to 1500)."
            )
        return value
