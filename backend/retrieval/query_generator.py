SAMPLE_ALERTS = [
{
    "alert_id": "ALT-2026-002",
    "machine_id": "PUMP-01",
    "error_code": "E-302",
    "temperature": 75,
    "pressure": 45,
    "error_description": "pressure drop fluid leak",
    "severity": "warning",
    "status": "active",
},
{
    "alert_id": "ALT-2026-003",
    "machine_id": "CONVEYOR-07",
    "error_code": "E-110",
    "temperature": 60,
    "vibration": "high",
    "error_description": "belt misalignment mechanical fault",
    "severity": "warning",
    "status": "active",
    "timestamp": "2026-06-17 22:45:00"
},
{
    "alert_id": "ALT-2026-004",
    "machine_id": "CNC-01",
    "error_code": "E-605",
    "error_description": "invalid servo parameter setting",
    "severity": "warning",
    "status": "resolved",
    "timestamp": "2026-06-17 21:15:00"
}
]

HIGH_TEMP_THRESHOLD = 90
LOW_PRESSURE_THRESHOLD = 50


def generate_query_from_alert(alert):
    query_parts = []
    
     #---------Alart id--------------
    alert_id=alert.get("alert_id","")
    if alert_id:
        query_parts.append(alert_id)

    #-----------TimeStamp------------
    timestamp=alert.get("timestamp","")
    if timestamp:
        query_parts.append(f" || {timestamp}")
        
    # --------- Machine ID --------------
    machine_id = alert.get("machine_id", "")
    if machine_id:
        query_parts.append(f"\n{machine_id}")

    # --------- Error code --------------
    error_code = alert.get("error_code", "")
    if error_code:
        query_parts.append(f"error code {error_code}")

    # --------- Error description --------------
    error_description = alert.get("error_description", "")
    if error_description:
        query_parts.append(error_description)
    else:
        query_parts.append("Fault")

    # --------- Temperature --------------
    temperature = alert.get("temperature")

    if temperature is None:
        query_parts.append("temperature not available")
    else:
        query_parts.append(f"operating at {temperature}°C")

    # --------- Vibration --------------
    vibration = alert.get("vibration", "")
    if isinstance(vibration, str) and vibration.lower() == "high":
        query_parts.append("showing excessive vibration")

    # --------- Pressure --------------
    pressure = alert.get("pressure", None)
    if pressure is not None:
        pressure = str(pressure).strip()
    if pressure in ("", "None", "none", None):
        pressure = None
    else:
        try:
            pressure = float(pressure)
        except (ValueError, TypeError):
            pressure = None

    if pressure is not None and pressure <= LOW_PRESSURE_THRESHOLD:
        query_parts.append(f"with critically low pressure of {pressure} bar")
    elif pressure is not None:
        query_parts.append(f"with pressure at {pressure} bar")

    # --------- Status --------------
    status = alert.get("status", "")
    if status == "active":
        query_parts.append("active fault")
    else:
        query_parts.append("System Breakdown")

    # --------- Severity --------------
    severity = alert.get("severity", "")
    if severity:
        query_parts.append(f"Condition is:{severity}")

   
    Final_query_prompt = ("What are the step-by-step procedures for maintenance and troubleshooting, "
        "safety precautions, root cause analysis, required tools, "
        "and spare parts needed to fix this issue?")
    query_parts.append(f"{Final_query_prompt}")

    return ", ".join(query_parts)

# ----------- Print the Query ----------------

def print_query(alert, query):
    print("\n------------- Alert details --------------\n")
    for key, value in alert.items():
        print(f"{key:<20}: {value}")

    print("\n------------- Generated Query ----------------")
    print(f"\n{query}")


def main():
    print("=" * 55)
    print("\n...Testing with sample machine alerts ...\n")

    for i, alert in enumerate(SAMPLE_ALERTS):
        print(f"\n------- Alert {i + 1} -------")
        query = generate_query_from_alert(alert)
        print_query(alert, query)

    print("\n" + "=" * 55)
    print("\n-------------- Done ----------------\n")


if __name__ == "__main__":
    main()
