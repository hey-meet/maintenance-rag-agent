HIGH_TEMP_THRESHOLD = 90


def generate_query_from_alert(alert):

    query_parts = []

    # -------- Alert ID --------
    alert_id = alert.get("alert_id")
    if alert_id:
        query_parts.append(alert_id)

    # -------- Machine ID --------
    machine_id = alert.get("machine_id")
    if machine_id:
        query_parts.append(machine_id)

    # -------- Error Code --------
    error_code = alert.get("error_code")
    if error_code:
        query_parts.append(error_code)

        readable_error = error_code.replace("_", " ")
        query_parts.append(readable_error)

    # -------- Temperature --------
    temperature = alert.get("temperature")

    if temperature is not None:

        query_parts.append(
            f"temperature {temperature} degree celsius"
        )

        if temperature >= HIGH_TEMP_THRESHOLD:
            query_parts.append(
                "high temperature condition"
            )

    # -------- Severity --------
    severity = alert.get("severity")

    if severity:
        query_parts.append(
            f"{severity} severity"
        )

    # -------- Status --------
    status = alert.get("status", "").lower()

    if status == "active":
        query_parts.append(
            "active machine fault"
        )

    elif status == "resolved":
        query_parts.append(
            "resolved maintenance issue"
        )

    # -------- Maintenance Query --------
    query_parts.append(
        "maintenance procedure troubleshooting "
        "repair steps root cause analysis "
        "required tools spare parts safety precautions"
    )

    return " ".join(query_parts)