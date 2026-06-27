"""
Department Mapper

Maps telemetry alerts to the responsible maintenance department
based on the machine error code.
"""


def get_department(alert: dict) -> str:
    """
    Returns the responsible department for a telemetry alert.

    Priority:
    1. Error Code
    2. Default -> Maintenance
    """

    error_code = str(
        alert.get("error_code", "")
    ).upper().strip()

    # --------------------------------------------------
    # Production (General Machine Alarms)
    # --------------------------------------------------
    if (
        error_code.startswith("ALARM 90")
        or error_code.startswith("ALARM 300")
        or error_code.startswith("ALARM 301")
        or error_code.startswith("ALARM 302")
        or error_code.startswith("ALARM 303")
        or error_code.startswith("ALARM 304")
        or error_code.startswith("ALARM 305")
        or error_code.startswith("ALARM 306")
        or error_code.startswith("ALARM 307")
        or error_code.startswith("ALARM 308")
    ):
        return "Production"

    # --------------------------------------------------
    # Maintenance
    # --------------------------------------------------
    maintenance_keywords = [
        "ALARM 350",
        "ALARM 351",
        "ALARM 400",
        "ALARM 401",
        "ALARM 404",
        "ALARM 405",
        "ALARM 410",
        "ALARM 411",
        "ALARM 414",
        "ALARM 416",
        "ALARM 417",
        "ALARM 700",
        "ALARM 704",
        "ALARM 749",
        "ALARM 750",
        "ALARM 751",
        "ALARM 761",
        "SERVO",
        "SPINDLE",
        "REFERENCE_POSITION",
        "DOGLESS_REFERENCE_POSITION",
        "ABSOLUTE_ENCODER",
    ]

    if any(keyword in error_code for keyword in maintenance_keywords):
        return "Maintenance"

    # --------------------------------------------------
    # Electrical
    # --------------------------------------------------
    electrical_keywords = [
        "POWER",
        "HEAT_EXCHANGER",
        "CONTROL_FAN",
        "ALARM 900",
        "ALARM 910",
        "ALARM 911",
        "ALARM 912",
        "ALARM 913",
        "ALARM 914",
        "ALARM 915",
        "ALARM 916",
        "ALARM 924",
        "ALARM 930",
    ]

    if any(keyword in error_code for keyword in electrical_keywords):
        return "Electrical"

    # --------------------------------------------------
    # Automation
    # --------------------------------------------------
    automation_keywords = [
        "COMMUNICATION",
        "INTERFACE",
        "IO_LINK",
        "REMOTE_BUFFER",
        "HIGH_SPEED_DI",
        "READER_PUNCHER",
    ]

    if any(keyword in error_code for keyword in automation_keywords):
        return "Automation"

    # --------------------------------------------------
    # Electronics
    # --------------------------------------------------
    electronics_keywords = [
        "LCD",
        "CRT",
        "DISPLAY",
        "BACKLIGHT",
        "FUSE",
        "MEMORY_BACKUP_BATTERY",
    ]

    if any(keyword in error_code for keyword in electronics_keywords):
        return "Electronics"

    # --------------------------------------------------
    # Default
    # --------------------------------------------------
    return "Maintenance"