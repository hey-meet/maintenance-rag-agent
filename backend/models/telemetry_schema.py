from pydantic import BaseModel, Field, validator


class TelemetryAlert(BaseModel):

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

    @validator("machine_id", "error_code")
    def clean_strings(cls, value):

        if not value or not value.strip():
            raise ValueError(
                "Field cannot be empty or blank spaces."
            )

        return value.strip().upper()