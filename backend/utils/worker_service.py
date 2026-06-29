import json
from pathlib import Path

# ------------------------------------------------------------------
# Worker Dataset Path
# ------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

WORKERS_FILE = (
    BASE_DIR /
    "data" /
    "workers" /
    "worker.json"
)


# ------------------------------------------------------------------
# Load Workers
# ------------------------------------------------------------------

def load_workers():
    """
    Load all workers from worker.json
    """

    if not WORKERS_FILE.exists():
        return []

    try:
        with open(WORKERS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)

    except Exception:
        return []


# ------------------------------------------------------------------
# Filter Workers by Department
# ------------------------------------------------------------------

def filter_workers_by_department(department: str):
    """
    Returns all available workers
    belonging to the given department.
    """

    workers = load_workers()

    if not department:
        return []

    department = department.strip().lower()

    filtered_workers = [
        worker
        for worker in workers
        if worker.get(
            "department",
            ""
        ).strip().lower() == department
    ]

    return filtered_workers


# ------------------------------------------------------------------
# Get Worker Emails
# ------------------------------------------------------------------

def get_worker_emails(department: str):
    """
    Returns email addresses of workers
    from the selected department.
    """

    workers = filter_workers_by_department(department)

    return [
        worker.get("email")
        for worker in workers
        if worker.get("email")
    ]