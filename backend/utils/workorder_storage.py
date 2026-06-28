import json
from pathlib import Path
from datetime import datetime
import uuid


BASE_DIR = Path(__file__).resolve().parents[2]

WORKORDER_FILE = (
    BASE_DIR /
    "data" /
    "workorders" /
    "workorders.json"
)

print("\n========== WORKORDER STORAGE ==========")
print("BASE_DIR:", BASE_DIR)
print("WORKORDER_FILE:", WORKORDER_FILE)
print("FILE EXISTS:", WORKORDER_FILE.exists())
print("=======================================\n")


def load_workorders():
    """
    Load all persisted work orders.
    """

    if not WORKORDER_FILE.exists():
        WORKORDER_FILE.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        with open(
            WORKORDER_FILE,
            "w",
            encoding="utf-8"
        ) as file:
            json.dump([], file, indent=4)

        return []

    try:
        with open(
            WORKORDER_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)
            print(f"Loaded {len(data)} work orders")
            return (
                data
                if isinstance(data, list)
                else []
            )

    except Exception:
        return []

def save_workorders(workorders):

    WORKORDER_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        WORKORDER_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            workorders,
            file,
            indent=4,
            ensure_ascii=False
        )

    print(f"\nSaved {len(workorders)} work orders")

    with open(
        WORKORDER_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        print("\n========== FILE CONTENT AFTER SAVE ==========")
        print(file.read())
        print("=============================================\n")
def append_workorder(result):
    """
    Persist newly generated AI work order.
    """
    print("\n========== APPEND WORKORDER ==========")
    print("append_workorder() called")
    print("Result Keys:")
    print(result.keys())

    draft = result.get(
        "work_order_draft",
        {}
    )
    print("\nWork Order Draft:")
    print(draft)
    print("\nTarget JSON:")
    print(WORKORDER_FILE)
    if not draft:
        return

    workorders = load_workorders()

    work_order_id = (
        draft.get("work_order_id")
        or f"WO-{uuid.uuid4().hex[:8].upper()}"
    )

    for order in workorders:

        if (
            order.get("work_order_id")
            == work_order_id
        ):
            return

    timestamp = datetime.now().isoformat()

    workorders.insert(
        0,
        {
            "work_order_id": work_order_id,

            "machine_id": draft.get(
                "machine_id",
                "Asset Not Identified"
            ),

            "error_code": draft.get(
                "error_code",
                result.get(
                    "error_code",
                    "Unknown"
                )
            ),

            "priority": draft.get(
                "priority",
                "medium"
            ),

            "status": draft.get(
                "status",
                "OPEN"
            ),

            "assigned_department": result.get(
                "agent_memory_view",
                {}
            ).get(
                "department",
                "Maintenance Team"
            ),

            "estimated_time": draft.get(
                "estimated_time",
                "Unknown"
            ),

            "recommended_steps": draft.get(
                "recommended_steps",
                []
            ),

            "required_tools": draft.get(
                "required_tools",
                []
            ),

            "required_parts": draft.get(
                "required_parts",
                []
            ),

            "manual_reference": draft.get(
                "manual_reference",
                {}
            ),

            "created_at": timestamp,

            "updated_at": timestamp,

            "acknowledged": False,

            "acknowledged_at": None
        }
    )

    save_workorders(workorders)


def update_workorder(
    work_order_id,
    updates
):
    """
    Update existing work order.
    """

    workorders = load_workorders()

    updated = False

    for order in workorders:

        if (
            order.get("work_order_id")
            == work_order_id
        ):

            order.update(updates)

            order["updated_at"] = (
                datetime.now().isoformat()
            )

            updated = True

            break

    if updated:
        save_workorders(workorders)

    return updated

def complete_workorder(work_order_id):
    """
    Mark work order as completed and persist the change.
    """

    workorders = load_workorders()

    for order in workorders:

        if order.get("work_order_id") == work_order_id:

            order["status"] = "completed"
            order["completed"] = True
            order["completed_at"] = datetime.now().isoformat()
            order["updated_at"] = datetime.now().isoformat()

            save_workorders(workorders)

            return order

    return None    

def acknowledge_workorder(work_order_id):
    """
    Acknowledge a work order (OPEN or PENDING_REVIEW → ACKNOWLEDGED).
    Records acknowledgement timestamp and persists the change.
    """

    workorders = load_workorders()

    for order in workorders:

        if order.get("work_order_id") == work_order_id:
            continue
            
        if order.get("status") not in ["OPEN", "PENDING_REVIEW"]:
            return None

        order["status"] = "ACKNOWLEDGED"
        order["acknowledged"] = True
        order["acknowledged_at"] = datetime.now().isoformat()
        order["updated_at"] = datetime.now().isoformat()

        save_workorders(workorders)

        return order

    return None
