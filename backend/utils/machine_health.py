# Machine_Health check
import json
import os
from datetime import datetime

ALERTS_FILE_PATH = os.path.join("data", "alerts", "alerts.json")

# ---------------------------------------------------------------------------
# Step 1: Load alerts from the JSON file
# ---------------------------------------------------------------------------
def load_alerts(file_path: str = ALERTS_FILE_PATH) -> list:
    """
    Reads the alerts.json file and returns a list of alert dictionaries.
    If the file is missing or empty, returns an empty list instead of crashing.
    """
    if not os.path.exists(file_path):
        return []
 
    with open(file_path, "r") as f:
        data = json.load(f)
 
    # Some alert files store alerts directly as a list, others wrap them
    # inside a key like {"alerts": [...]}. We handle both cases here.
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "alerts" in data:
        return data["alerts"]
 
    return []
 
# ---------------------------------------------------------------------------
# Step 2: Group alerts by machine_id
# ---------------------------------------------------------------------------
def group_alerts_by_machine(alerts: list) -> dict:
    """
    Groups a flat list of alerts into a dictionary keyed by machine_id.
    """
    grouped = {}
 
    for alert in alerts:
        machine_id = alert.get("machine_id", "UNKNOWN")
 
        if machine_id not in grouped:
            grouped[machine_id] = []
 
        grouped[machine_id].append(alert)
 
    return grouped

# ---------------------------------------------------------------------------
# Step 3: Calculate a health score for one machine's alerts
# ---------------------------------------------------------------------------

SEVERITY_PENALTY = {
    "critical": 40,
    "warning": 20,
    "info": 5,
    "safe": 0,
}
 
TEMP_SAFE_LIMIT = 80      
TEMP_DANGER_LIMIT = 120   
MAX_TEMP_PENALTY = 30
 
ACTIVE_ALERT_PENALTY_PER_ALERT = 5
MAX_ACTIVE_ALERT_PENALTY = 25
 
 
def calculate_temperature_penalty(temperature: float) -> int:
    """
    Converts a raw temperature value into a penalty score.
    - At or below TEMP_SAFE_LIMIT      -> 0 penalty
    - At or above TEMP_DANGER_LIMIT    -> MAX_TEMP_PENALTY
    - In between                       -> scaled proportionally
    """
    if temperature <= TEMP_SAFE_LIMIT:
        return 0
    if temperature >= TEMP_DANGER_LIMIT:
        return MAX_TEMP_PENALTY
 
    temp_range = TEMP_DANGER_LIMIT - TEMP_SAFE_LIMIT
    distance_into_range = temperature - TEMP_SAFE_LIMIT
    penalty = (distance_into_range / temp_range) * MAX_TEMP_PENALTY
 
    return int(round(penalty))

def calculate_active_alert_penalty(active_alert_count: int) -> int:
    """
    More active alerts = lower health. Capped so one machine can't go
    below 0 just because it has many alerts.
    """
    penalty = active_alert_count * ACTIVE_ALERT_PENALTY_PER_ALERT
    return min(penalty, MAX_ACTIVE_ALERT_PENALTY)

def get_highest_severity(machine_alerts: list) -> str:
    """
    Picks the worst (most severe) severity out of all alerts for a machine.
    Severity order, worst to best: critical > warning > info > safe
    """
    severity_order = ["critical", "warning", "info", "safe"]
 
    found_severities = [
        alert.get("severity", "info").lower() for alert in machine_alerts
    ]
 
    for severity in severity_order:
        if severity in found_severities:
            return severity
 
    return "safe"


 
def calculate_health_score(machine_alerts: list) -> dict:
    """
    Takes all alerts belonging to ONE machine and calculates the health score
    """
    # Only count alerts that are still "active" (not resolved/closed).
    active_alerts = [
        alert for alert in machine_alerts
        if alert.get("status", "active").lower() == "active"
    ]
 
    active_alert_count = len(active_alerts)
 
    # Use the highest temperature in all alerts for this machine.
    temperatures = [alert.get("temperature", 0) for alert in machine_alerts]
    highest_temperature = max(temperatures) if temperatures else 0
 
    worst_severity = get_highest_severity(machine_alerts)
 
    # The most recent alert gives us the latest error code and the last_updated timestamp.
    latest_alert = machine_alerts[-1] if machine_alerts else {}
    latest_error_code = latest_alert.get("error_code", "N/A")
    last_updated = latest_alert.get("timestamp", datetime.now().isoformat())
 
    # --- Score calculation ---
    score = 100
    score -= SEVERITY_PENALTY.get(worst_severity, 0)
    score -= calculate_temperature_penalty(highest_temperature)
    score -= calculate_active_alert_penalty(active_alert_count)
 
    score = max(0, min(100, score))
 
    if score >= 80:
        status = "healthy"
    elif score >= 50:
        status = "warning"
    else:
        status = "critical"
 
    return {
        "health_score": score,
        "status": status,
        "temperature": highest_temperature,
        "severity": worst_severity,
        "error_code": latest_error_code,
        "active_alerts": active_alert_count,
        "last_updated": last_updated,
    }
 
# ---------------------------------------------------------------------------
# Step 4: Build the final summary for every machine
# ---------------------------------------------------------------------------
def get_machine_health_summary(file_path: str = ALERTS_FILE_PATH) -> list:
    alerts = load_alerts(file_path)
    grouped_alerts = group_alerts_by_machine(alerts)
 
    summary_list = []
 
    for machine_id, machine_alerts in grouped_alerts.items():
        health_data = calculate_health_score(machine_alerts)
 
        machine_summary = {"machine_id": machine_id, **health_data}
        summary_list.append(machine_summary)
 
    return summary_list 

if __name__ == "__main__":
    result = get_machine_health_summary()
    print(json.dumps(result, indent=4))
