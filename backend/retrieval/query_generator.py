import json
import os

SAVED_ALERT_FILE = "sample_alart.json"
HIGH_TEMP_THRESHOLD = 90
LOW_PRESSURE_THRESHOLD = 50

def generate_query_from_alert(alert):
    quary_parts = []

    machine_id = alert.get("machine_id", "")
    if machine_id:
        quary_parts.append(machine_id)

    error_code = alert.get("error_code", "")
    if error_code:
        quary_parts.append(f"error code {error_code}")

    error_description = alert.get("error_description", "")
    if error_description:
        quary_parts.append(error_description)

# getting Temparature
  
    temperature = alert.get("temperature", 0)
    if temperature >= HIGH_TEMP_THRESHOLD:
        quary_parts.append(f"operating at dangerously high temperature of {temperature}°C")

    else:
        quary_parts.append(f"operating at {temperature}°C")

  # getting vibration

    vibration = alert.get("vibration", "")
    if vibration.lower() == "high":
        quary_parts.append("showing excessive vibration")

  # getting Pressure

    pressure = alert.get("pressure", "")
    if pressure is not None:
        pressure = str(pressure).strip()

    if pressure in ("", "None", "none"):
        pressure = None
    else:
        pressure = int(pressure)

    if pressure is not None and pressure <= LOW_PRESSURE_THRESHOLD:
        quary_parts.append(f"with critically low pressure of {pressure} bar")

    else:
        quary_parts.append(f"with pressure at {pressure} bar")

  # getting status

    status = alert.get("status", "")
    if status:
        quary_parts.append(status)

    quary_parts.append(
        "What are the step-by-step procedures for maintenance and troubleshooting, "
        "safety precautions, root cause analysis, required tools, "
        "and spare parts needed to fix this issue?"
    )

    final_query = ", ".join(quary_parts)

    return final_query
