from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator

class TelemetryAlert(BaseModel):
    """Schema for validating incoming IoT machine telemetry alerts."""
    alert_id: str = Field(..., description="Unique identifier for the telemetry alert")
    machine_id: str = Field(..., description="ID of the industrial machine generating the alert")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the alert")
    error_code: str = Field(..., description="Specific error code (e.g., ERR_MOTOR_OVERHEAT_102)")
    severity: str = Field(..., description="Severity level: INFO, WARNING, CRITICAL")
    metrics: Dict[str, Any] = Field(..., description="Raw sensor metrics like temperature, pressure, RPM")

    @validator('severity')
    def validate_severity(cls, v):
        allowed = ['INFO', 'WARNING', 'CRITICAL']
        if v.upper().strip() not in allowed:
            raise ValueError(f"Severity must be one of {allowed}")
        return v.upper().strip()

    @validator('machine_id', 'error_code')
    def clean_and_uppercase_strings(cls, v):
        """Ensures all IDs and error codes are clean and standardized to uppercase."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or blank spaces.")
        return v.strip().upper()

if __name__ == "__main__":
    sample_data = {
        "alert_id": "ALT-9921",
        "machine_id": "  cnc-mill-04  ",  # Testing string cleaning
        "error_code": "err_temp_99",      # Testing uppercase conversion
        "severity": "critical",
        "metrics": {"temperature": 104.5, "rpm": 3200}
    }
    try:
        validated_alert = TelemetryAlert(**sample_data)
        print("✅ Day 1 Validation Test Passed!")
        print(validated_alert.json(indent=2))
    except Exception as e:
        print(f"❌ Validation Failed: {e}")