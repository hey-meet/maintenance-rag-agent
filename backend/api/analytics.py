import json
import re
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict
from typing import Dict, List, Any, Optional

from fastapi import APIRouter, HTTPException

router = APIRouter()

# ----------------------------------------------------------------------
# 1. FIXED WORK ORDERS FILE PATH RESOLUTION
# ----------------------------------------------------------------------
# Climbs up from backend/api/analytics.py to locate the root "maintenance-rag-agent" folder 
# and looks for data/workorders/workorders.json from the top project workspace down.
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = next((p for p in CURRENT_DIR.parents if p.name == "maintenance-rag-agent"), CURRENT_DIR.parents[1])
WORKORDERS_FILE = PROJECT_ROOT / "data" / "workorders" / "workorders.json"


# ----------------------------------------------------------------------
# SYSTEM VALUE NORMALIZATION HELPERS
# ----------------------------------------------------------------------

def normalize_status(status_val: Any) -> str:
    """Normalizes variation inputs like 'in_progress', 'IN_PROGRESS', or 'open' safely handling None."""
    if not status_val:
        return "Unknown"
    cleaned = str(status_val).replace("_", " ").strip().lower()
    if cleaned == "open":
        return "Open"
    elif cleaned in ["in progress", "in_progress"]:
        return "In Progress"
    elif cleaned == "completed":
        return "Completed"
    elif cleaned == "pending":
        return "Pending"
    return cleaned.title()


def normalize_priority(priority_val: Any) -> str:
    """Normalizes variation inputs like 'CRITICAL', 'high', 'Medium' safely handling None."""
    if not priority_val:
        return "Low"
    cleaned = str(priority_val).strip().lower()
    if cleaned == "critical":
        return "Critical"
    elif cleaned == "high":
        return "High"
    elif cleaned == "medium":
        return "Medium"
    elif cleaned == "low":
        return "Low"
    return cleaned.title()


def classify_machine_health(incident_count: int) -> str:
    """Classifies industrial machine health based on dynamic threshold rules."""
    if incident_count >= 5:
        return "Critical"
    elif incident_count >= 3:
        return "High"
    elif incident_count >= 1:
        return "Medium"
    return "Healthy"


# ----------------------------------------------------------------------
# FILE READ & CORE PARSING HELPERS
# ----------------------------------------------------------------------

def load_raw_workorders() -> List[Dict[str, Any]]:
    """Reads workorders.json safely once per request, handling errors resiliently."""
    if not WORKORDERS_FILE.exists():
        return []
    try:
        with open(WORKORDERS_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, List) else []
    except (json.JSONDecodeError, IOError):
        return []


def parse_time_to_hours(time_str: Optional[Any]) -> float:
    """Parses messy string patterns like '2.5 Hours' or '45 Minutes' to a float hour count."""
    if not time_str or not isinstance(time_str, str):
        return 0.0

    cleaned = time_str.lower().strip()
    match = re.search(r"(\d+(?:\.\d+)?)\s*(hour|min)", cleaned)
    
    if not match:
        return 0.0
    
    value = float(match.group(1))
    unit = match.group(2)
    
    if "min" in unit:
        return value / 60.0
    return value


def parse_date_safely(date_str: Optional[Any]) -> Optional[datetime]:
    """Parses standard ISO string variants safely to datetime objects."""
    if not date_str or not isinstance(date_str, str):
        return None
    try:
        cleaned = date_str.replace("Z", "").split(".")[0]
        return datetime.strptime(cleaned, "%Y-%m-%dT%H:%M:%S")
    except ValueError:
        try:
            return datetime.strptime(date_str.split(" ")[0], "%Y-%m-%d")
        except ValueError:
            return None


def is_valid_item(text: str) -> bool:
    """Filters out invalid values, placeholders, and empty strings from metadata processing."""
    invalid_placeholders = {"none", "n/a", "null", "placeholder", "unknown", "tbd", "nothing"}
    cleaned = text.strip().lower()
    return bool(cleaned and cleaned not in invalid_placeholders)


# ----------------------------------------------------------------------
# CORE ANALYTICS ENGINE
# ----------------------------------------------------------------------

def generate_analytics_payload(work_orders: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Aggregates raw work order data into visual charts and KPI elements."""
    total_orders = len(work_orders)

    # Core Value Metric Accumulators using Normalizers and explicit safe fallbacks
    statuses = [normalize_status(w.get("status")) for w in work_orders]
    priorities = [normalize_priority(w.get("priority")) for w in work_orders]
    
    # ----------------------------------------------------------------------
    # 2. FIXED ASSIGNED_DEPARTMENT & STRING PROPERTY FALLBACKS (CRASH PROTECTION)
    # ----------------------------------------------------------------------
    departments = [str(w.get("assigned_department") or "Unassigned").strip().title() for w in work_orders]
    machines = [str(w.get("machine_id") or "Unknown Asset").strip().upper() for w in work_orders]
    errors = [str(w.get("error_code") or "N/A").strip().upper() for w in work_orders]

    status_counts = Counter(statuses)
    priority_counts = Counter(priorities)
    dept_counts = Counter(departments)
    machine_counts = Counter(machines)
    error_counts = Counter(errors)

    # Acknowledgment Tracking
    ack_count = sum(1 for w in work_orders if w.get("acknowledged") is True)
    not_ack_count = total_orders - ack_count
    ack_percentage = round((ack_count / total_orders) * 100, 2) if total_orders > 0 else 0.0

    # Advanced References, Parts, Tools, and Steps Tracking
    manual_sources = []
    sections = []
    pages = []
    
    all_parts = []
    all_tools = []
    all_repair_steps = []
    
    durations = []
    daily_grouping = defaultdict(int)
    monthly_grouping = defaultdict(int)

    for w in work_orders:
        # Parse Duration
        hours = parse_time_to_hours(w.get("estimated_time"))
        if hours > 0:
            durations.append(hours)

        # Updated Manual References Analytics
        manual_ref = w.get("manual_reference")
        if isinstance(manual_ref, dict):
            source_file = manual_ref.get("source")
            if source_file and is_valid_item(str(source_file)):
                manual_sources.append(str(source_file).strip())
                
            section_info = manual_ref.get("section")
            if section_info and is_valid_item(str(section_info)):
                sections.append(str(section_info).strip().title())
                
            page_info = manual_ref.get("page")
            if page_info and is_valid_item(str(page_info)):
                pages.append(f"Page {str(page_info).strip()}")

        # Spare Parts List Flattening
        req_parts = w.get("required_parts")
        if isinstance(req_parts, list):
            for part in req_parts:
                if part and is_valid_item(str(part)):
                    all_parts.append(str(part).strip().title())

        # Tool Usage List Flattening
        req_tools = w.get("required_tools")
        if isinstance(req_tools, list):
            for tool in req_tools:
                if tool and is_valid_item(str(tool)):
                    all_tools.append(str(tool).strip().title())

        # Repair Actions Flattening (Deduped per work order)
        rec_steps = w.get("recommended_steps")
        if isinstance(rec_steps, list):
            seen_steps_in_order = set()
            for step in rec_steps:
                if step and is_valid_item(str(step)):
                    normalized_step = str(step).strip().capitalize()
                    if normalized_step not in seen_steps_in_order:
                        all_repair_steps.append(normalized_step)
                        seen_steps_in_order.add(normalized_step)

        # Parse Timeline Trends
        created_dt = parse_date_safely(w.get("created_at"))
        if created_dt:
            day_key = created_dt.strftime("%Y-%m-%d")
            month_key = created_dt.strftime("%Y-%m")
            daily_grouping[day_key] += 1
            monthly_grouping[month_key] += 1

    # Calculation of Time & Counts Analytics
    avg_hours = round(sum(durations) / len(durations), 2) if durations else 0.0
    min_hours = round(min(durations), 2) if durations else 0.0
    max_hours = round(max(durations), 2) if durations else 0.0
    total_hours = round(sum(durations), 2)

    unique_machines_count = len(machine_counts)
    unique_errors_count = len(error_counts)
    unique_depts_count = len(dept_counts)
    unique_manuals_count = len(Counter(manual_sources))

    avg_errors_per_machine = round(total_orders / unique_machines_count, 2) if unique_machines_count > 0 else 0.0

    # Sorting Trends
    sorted_daily_trend = [{"date": k, "count": daily_grouping[k]} for k in sorted(daily_grouping.keys())]
    sorted_monthly_trend = [{"month": k, "count": monthly_grouping[k]} for k in sorted(monthly_grouping.keys())]

    # Contextual Dashboard Insights Generation
    most_active_dept = dept_counts.most_common(1)[0][0] if dept_counts else "N/A"
    most_frequent_error = error_counts.most_common(1)[0][0] if error_counts else "N/A"
    worst_machine = machine_counts.most_common(1)[0][0] if machine_counts else "N/A"
    top_manual = Counter(manual_sources).most_common(1)[0][0] if manual_sources else "N/A"
    
    unique_days_count = len(daily_grouping) if daily_grouping else 1
    avg_orders_per_day = round(total_orders / unique_days_count, 2)
    avg_orders_per_machine = round(total_orders / unique_machines_count, 2) if unique_machines_count > 0 else 0.0
    
    # Advanced Object-based Peak Maintenance Day
    if daily_grouping:
        peak_day_raw = max(daily_grouping, key=daily_grouping.get)
        peak_day_dt = parse_date_safely(peak_day_raw)
        peak_maintenance_day_obj = {
            "date": peak_day_raw,
            "formatted": peak_day_dt.strftime("%d %b %Y") if peak_day_dt else peak_day_raw,
            "count": daily_grouping[peak_day_raw]
        }
    else:
        peak_maintenance_day_obj = {"date": "N/A", "formatted": "N/A", "count": 0}

    # Activity Feed Processing (Top 10 Newest with safe string transformations)
    def sort_key(x):
        dt = parse_date_safely(x.get("created_at"))
        return dt.timestamp() if dt else 0

    sorted_recent_feed = sorted(work_orders, key=sort_key, reverse=True)[:10]
    sanitized_feed = [
        {
            "work_order_id": w.get("work_order_id") or "UNKNOWN",
            "machine_id": w.get("machine_id") or "Unknown",
            "error_code": w.get("error_code") or "N/A",
            "priority": normalize_priority(w.get("priority")),
            "status": normalize_status(w.get("status")),
            "assigned_department": str(w.get("assigned_department") or "Unassigned").strip().title(),
            "created_at": w.get("created_at") or "",
            "estimated_time": w.get("estimated_time") or "Unknown",
            "acknowledged": w.get("acknowledged", False),
            "updated_at": w.get("updated_at") or ""
        }
        for w in sorted_recent_feed
    ]

    return {
        "kpiSummary": {
            "totalWorkOrders": total_orders,
            "openWorkOrders": status_counts.get("Open", 0),
            "inProgressWorkOrders": status_counts.get("In Progress", 0),
            "completedWorkOrders": status_counts.get("Completed", 0),
            "pendingWorkOrders": status_counts.get("Pending", 0),
            "criticalPriority": priority_counts.get("Critical", 0),
            "highPriority": priority_counts.get("High", 0),
            "mediumPriority": priority_counts.get("Medium", 0),
            "lowPriority": priority_counts.get("Low", 0),
            "acknowledged": ack_count,
            "pendingAcknowledgement": not_ack_count,
            "totalMachines": unique_machines_count,
            "uniqueErrorCodes": unique_errors_count,
            "uniqueDepartments": unique_depts_count,
            "uniqueManuals": unique_manuals_count,
            "averageErrorsPerMachine": avg_errors_per_machine,
            "averageEstimatedMaintenanceTime": f"{avg_hours} Hours"
        },
        "statusDistribution": [{"name": k, "value": v} for k, v in status_counts.items()],
        "priorityDistribution": [{"name": k, "value": v} for k, v in priority_counts.items()],
        "departmentDistribution": [{"department": k, "workOrders": v} for k, v in dept_counts.items()],
        "machineDistribution": [{"machine_id": k, "count": v} for k, v in machine_counts.most_common(10)],
        "errorCodeDistribution": [{"error_code": k, "count": v} for k, v in error_counts.most_common(10)],
        "dailyTrend": sorted_daily_trend,
        "monthlyTrend": sorted_monthly_trend,
        "manualUsage": {
            "mostReferencedManuals": [{"manual_id": k, "count": v} for k, v in Counter(manual_sources).most_common(5)],
            "mostReferencedSections": [{"section": k, "count": v} for k, v in Counter(sections).most_common(5)],
            "mostReferencedPages": [{"page": k, "count": v} for k, v in Counter(pages).most_common(5)]
        },
        "sparePartsAnalytics": {
            "topRequiredSpareParts": [{"part_name": k, "count": v} for k, v in Counter(all_parts).most_common(10)]
        },
        "toolUsageAnalytics": {
            "mostFrequentlyRequiredTools": [{"tool_name": k, "count": v} for k, v in Counter(all_tools).most_common(10)]
        },
        "recommendationAnalytics": {
            "mostFrequentlyRecommendedRepairActions": [{"action": k, "count": v} for k, v in Counter(all_repair_steps).most_common(10)]
        },
        "estimatedMaintenanceTime": {
            "averageHours": avg_hours,
            "minimumHours": min_hours,
            "maximumHours": max_hours,
            "totalHours": total_hours
        },
        "machineHealthRanking": [
            {
                "machine_id": k, 
                "incidentCount": v, 
                "status": classify_machine_health(v)
            } for k, v in machine_counts.most_common()
        ],
        "acknowledgementAnalytics": {
            "acknowledgedCount": ack_count,
            "notAcknowledgedCount": not_ack_count,
            "acknowledgementRate": ack_percentage
        },
        "dashboardInsights": {
            "mostActiveDepartment": most_active_dept,
            "mostFrequentErrorCode": most_frequent_error,
            "machineWithHighestFailureCount": worst_machine,
            "mostReferencedManual": top_manual,
            "averageWorkOrdersPerDay": avg_orders_per_day,
            "averageWorkOrdersPerMachine": avg_orders_per_machine,
            "peakMaintenanceDay": peak_maintenance_day_obj
        },
        "recentActivityFeed": sanitized_feed
    }


# ----------------------------------------------------------------------
# ENDPOINTS
# ----------------------------------------------------------------------

@router.get("/analytics")
def get_analytics():
    """
    Production-grade analytics calculation API.
    Reads workorders.json reactively and returns a wrapped structure.
    """
    work_orders = load_raw_workorders()
    analytics_response = generate_analytics_payload(work_orders)
    
    return {
        "status": "success",
        "generated_at": datetime.now().isoformat(),
        "analytics": analytics_response
    }