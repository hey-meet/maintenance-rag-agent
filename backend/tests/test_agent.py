import sys
import os

# Resolving workspace parent tree directory structures
current_file_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(current_file_dir, ".."))
sys.path.append(backend_root)

# Standard Absolute Import from your core structural framework
try:
    from agents.agent import maintenance_agent
except ModuleNotFoundError:
    try:
        workspace_root = os.path.abspath(os.path.join(backend_root, ".."))
        sys.path.append(workspace_root)
        from backend.agents.agent import maintenance_agent
    except ModuleNotFoundError as err:
        print(f"CRITICAL ERROR: Framework breakdown. Details: {err}")
        sys.exit(1)


# --- REAL INDUSTRIAL ALARM ALERT DATA ---
# This matches perfectly with the 'ALARM 414' sections inside page 353 of the manual
TEST_ALERT = {
    "alert_id": "ALT-2026-X400",
    "machine_id": "CNC-MILL-X_AXIS",
    "error_code": "400",  # Evaluates to "ALARM 414 troubleshooting repair procedures"
    "temperature": 48.5,
    "severity": "high",
    "status": "active",
    "timestamp": "2026-06-24T11:45:00Z"
}

print("=" * 60)
print("RUNNING PRODUCTION RAG AGENT INFERENCE")
print("=" * 60)

# Triggering the genuine automated end-to-end pipeline
# (Alert -> Query Gen -> Chroma DB Lookup -> Context Build -> Mistral AI Large)
result = maintenance_agent.process_alert(TEST_ALERT)

print("\n" + "=" * 60)
print("FINAL PRESCRIPTIVE RECOMMENDATION REPORT OUTPUT")
print("=" * 60)

# Full dictionary payload format validation for dashboard metrics ingestion
print(result)

print("\nLikely Cause:")
print(result.get("likely_cause", "No cause identified"))

print("\nRepair Steps:")
repair_steps = result.get("repair_steps", [])
if isinstance(repair_steps, list):
    for step in repair_steps:
        print("-", step)
else:
    print(repair_steps)

print("\nSources Referenced:")
source_references = result.get("source_references", [])
if isinstance(source_references, list):
    for source in source_references:
        print("-", source)
else:
    print(source_references)

print("\nInventory Ingestion Available:")
print(result.get("inventory_available", False))
print("=" * 60 + "\n")