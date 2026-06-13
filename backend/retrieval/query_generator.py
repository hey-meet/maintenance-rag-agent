SAMPLE_ALERTS = [
    {
        "machine_id": "PUMP-01",
        "error_code": "E-404",
        "temperature": 105,  # temperature in celsius
        "vibration": "high",
        "status": "critical",
        "error_description": "overheating thermal fault"
    },
    {
        "machine_id": "PUMP-01",
        "error_code": "E-302",
        "temperature": 75,
        "pressure": 45,
        "status": "critical",
        "error_description": "pressure drop fluid leak"
    },
    {
        "machine_id": "CONVEYOR-07",
        "error_code": "E-110",
        "temperature": 60,
        "vibration": "high",
        "status": "warning",
        "error_description": "belt misalignment mechanical fault"
    },
    {
        "machine_id": "CNC-01",
        "error_code": "E-605",
        "status": "warning",
        "error_description": "invalid servo parameter setting"
    }
]

HIGH_TEMP_THRESHOLD = 90
LOW_PRESSURE_THRESHOLD = 50


def generate_query_from_alert(alert):
    query_parts = []

    # --------- Machine ID --------------
    machine_id = alert.get("machine_id", "")
    if machine_id:
        query_parts.append(machine_id)

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
    temperature = alert.get("temperature", 0)
    if temperature == 0:
        query_parts.append("operating at normal temperature")
    else:
        query_parts.append(f"operating at {temperature}°C")
    if temperature >= HIGH_TEMP_THRESHOLD:
        query_parts.append("dangerously high temperature")

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
            pressure = int(pressure)
        except (ValueError, TypeError):
            pressure = None

    if pressure is not None and pressure <= LOW_PRESSURE_THRESHOLD:
        query_parts.append(f"with critically low pressure of {pressure} bar")
    elif pressure is not None:
        query_parts.append(f"with pressure at {pressure} bar")

    # --------- Status --------------
    status = alert.get("status", "")
    if status:
        query_parts.append(f"Status showing: {status}")

    # --------- Severity --------------
    query_parts.append(
        "What are the step-by-step procedures for maintenance and troubleshooting, "
        "safety precautions, root cause analysis, required tools, "
        "and spare parts needed to fix this issue?"
    )

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
