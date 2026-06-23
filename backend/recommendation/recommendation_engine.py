"""
Week 3 Recommendation Engine — Optimized Unified Production JSON Contract
"""

import time
import uuid
from .LLM_service import load_llm, call_llm
from .prompt_template import (
    build_recommendation_prompt,
    build_repair_steps_prompt,
    build_tools_and_parts_prompt
)

HEADINGS_FULL = [
    "Likely Cause",
    "Repair Steps",
    "Safety Precautions",
    "Tools Required",
    "Spare Parts Required"
]

HEADINGS_REPAIR_STEPS = [
    "Repair Steps",
]

HEADINGS_TOOLS_PARTS = [
    "Tools Required",
    "Spare Parts Required",
]

ARRAY_FIELDS = {
    "repair_steps",
    "tools_required",
    "spare_parts_required",
    "safety_precautions",
}

DEFAULT_TEXT = "Not specified in available manual data"
PROMPT_TYPE = "full"

def build_prompt(context, prompt_type):
    """call the correct template from prompt_template.py """

    if prompt_type == "repair_steps":
        return build_repair_steps_prompt(context)
    
    elif prompt_type == "tools_parts":
        return build_tools_and_parts_prompt(context)
    
    else:
        return build_recommendation_prompt(context)
    
def get_headings_for_type(prompt_type):
    """ Return the list of section headings we expect in the AI's answer
    for the given prompt type."""

    if prompt_type == "repair_steps":
        return HEADINGS_REPAIR_STEPS
    
    elif prompt_type == "tools_parts":
        return HEADINGS_TOOLS_PARTS
    
    else:
        return HEADINGS_FULL

def split_into_list(lines):
    clean_items = []
    for line in lines:
        item = line.strip()

        if not item:
            continue

        if item and item[0] in ["-", "•", "*", "–"]:
            item = item[1:].strip()

        if item and item[0].isdigit():
            parts = item.split(".", 1)
            if len(parts) == 2:
                item = parts[1].strip()

        if item:
            clean_items.append(item)

    return clean_items

def parse_sections(raw_text, prompt_type):
    expected_headings = get_headings_for_type(prompt_type)

    if prompt_type == "repair_steps":
        lines = []
        for line in raw_text.split("\n"):
            if "repair steps" in line.lower():
                continue
            lines.append(line)
        return {
            "repair_steps": split_into_list(lines)
        }
    
    section = {}
    current_key = None
    current_line = []

    for line in raw_text.split("\n"):
        clean_line = line.strip()
        matched_heading = None

        for heading in expected_headings:
            simplified = clean_line.lower()
            simplified = simplified.replace("*", "")
            simplified = simplified.replace(":", "")
            simplified = simplified.strip()

            if simplified and simplified[0].isdigit():
                simplified = simplified.split(".", 1)[-1].strip()

            if heading.lower() == simplified:
                matched_heading = heading
                break

        if matched_heading:
            if current_key and current_line:
                if current_key in ARRAY_FIELDS:
                    section[current_key] = split_into_list(current_line)
                else:
                    section[current_key] = "\n".join(current_line).strip()

            current_key = matched_heading.lower().replace(" ", "_")
            current_line = []
        else:
            if current_key:
                current_line.append(line)

    if current_key and current_line:
        if current_key in ARRAY_FIELDS:
            section[current_key] = split_into_list(current_line)
        else:
            section[current_key] = "\n".join(current_line).strip()

    if not section:
        section = {
            "likely_cause": raw_text.strip(),
            "repair_steps": [],
            "safety_precautions": [],
            "tools_required": [],
            "spare_parts_required": []
        }

    return section

def generate_recommendation(context, llm=None, prompt_type=PROMPT_TYPE):
    """ Run the full process here:
    1. fetch prompt from prompt_templates as instruction
    2. send the prompt to llm
    3. splits answers into separate section
    4. add the context
    5. return in a clean format
    """
    start_time = time.time()

    if llm is None:
        llm = load_llm()

    prompt = build_prompt(context, prompt_type)

    raw_answer = call_llm(prompt, llm)

    processing_time = round(time.time() - start_time, 2)

    # Check for service error connection fallback strings before continuing to parse
    if (
        "Unable to generate recommendation" in raw_answer
        or "LLM Error" in raw_answer
    ):
        section = {
            "likely_cause": DEFAULT_TEXT,
            "repair_steps": [],
            "safety_precautions": [],
            "tools_required": [],
            "spare_parts_required": []
        }
    else:
        section = parse_sections(raw_answer, prompt_type)

    source_references = context.get("sources_used", [])

    if context.get("has_context"):
        recommendation_status = "success"
    else:
        recommendation_status = "limited_data"

    # Dynamic extraction of inventory details directly from incoming context metadata
    inventory_matches = context.get("inventory_matches", [])
    inventory_available = bool(inventory_matches)

    # Core context data capture with reliable defaults
    severity_raw = str(context.get("severity", "unknown")).strip()
    status_raw = str(context.get("status", "unknown")).strip()
    machine_id = context.get("machine_id", "unknown")
    error_code = context.get("error_code", "unknown")
    alert_id = context.get("alert_id", "unknown")
    
    # Safely unpack extracted sections or apply default specifications
    likely_cause = section.get("likely_cause", DEFAULT_TEXT)
    repair_steps = section.get("repair_steps", [])
    safety_precautions = section.get("safety_precautions", [])
    tools_required = section.get("tools_required", [])
    spare_parts_required = section.get("spare_parts_required", [])

    # Optimization 1: Clean and smart UI Summary Formatting
    if likely_cause == DEFAULT_TEXT:
        ui_summary = f"Alert {error_code} detected on {machine_id}. Manual data is limited."
    else:
        ui_summary = f"Detected {error_code} on {machine_id}. Likely cause: {likely_cause[:90]}"

    # Optimization 2: Conditional Work Order Status tracking
    wo_status = "OPEN" if repair_steps else "PENDING_REVIEW"

    # Optimization 3: Clean context-driven department targeting
    department = context.get("department", "Maintenance Team")

    # Optimization 4: Traceable and secure unique Work Order Identification
    work_order_id = f"WO-{alert_id}" if alert_id != "unknown" else f"WO-{str(uuid.uuid4())[:6].upper()}"

    # Dynamic priority derivation logic
    display_priority = "high" if severity_raw.lower() in ["critical", "high"] else "medium"
    estimated_time_str = "2.5 Hours" if severity_raw.lower() == "critical" else "1.2 Hours"

    # Assemble primary source structure for cross-referencing manual references
    source_obj = {"source": "N/A", "page": "N/A", "section": "N/A"}
    if source_references:
        source_str = source_references[0]
        if " — Page " in source_str:
            parts = source_str.split(" — Page ")
            source_obj["source"] = parts[0]
            source_obj["page"] = parts[1]
            source_obj["section"] = "Prescriptive Analysis Attachment"

    # Dynamic creation of contract inventory strings for downstream routers
    if inventory_matches:
        inv_match_item = inventory_matches[0]
        inv_status_str = f"AVAILABLE ({inv_match_item.get('stock', 0)} units available)"
    else:
        inv_status_str = "BALANCED - OPERATIONAL THRESHOLD"

    # Construct the final comprehensive output contract mapping
    recommendation = {
        # Transport-friendly top-level tracking parameters
        "accepted": True,
        "state": "thinking" if recommendation_status == "limited_data" else "attention",
        "message": f"Alert {alert_id} successfully transmitted to Prescriptive Core.",
        "response_version": "2026.3.1",

        # Existing top-level field invariants
        "recommendation_id": str(uuid.uuid4())[:8],
        "alert_id": alert_id,
        "machine_id": machine_id,
        "error_code": error_code,
        "severity": severity_raw,
        "temperature": context.get("temperature", "unknown"),
        "timestamp": context.get("timestamp", "unknown"),
        "status": status_raw,
        "prompt_type": prompt_type,
        "recommendation_status": recommendation_status,
        "likely_cause": likely_cause,
        "repair_steps": repair_steps,
        "safety_precautions": safety_precautions,
        "spare_parts_required": spare_parts_required,
        "tools_required": tools_required,
        "inventory_matches": inventory_matches,
        "inventory_available": inventory_available,
        "source_references": source_references,
        "has_manual_data": context.get("has_context", False),
        "total_chunks": context.get("total_chunks", 0),
        "processing_time": processing_time,
        "raw_llm_response": raw_answer,

        # Nested Object: AI Assistant Page / UX Summary
        "ui_summary": ui_summary,
        "next_action": "Review Deployment Order" if repair_steps else "Run Vector Sync",
        "display_priority": display_priority,

        # Nested Object: /agent/work-order Draft Schema Pipeline
        "work_order_draft": {
            "work_order_id": work_order_id,
            "machine_id": machine_id,
            "error_code": error_code,
            "priority": display_priority,
            "status": wo_status,
            "title": f"Prescriptive Remediation for {machine_id} [{error_code}]",
            "recommended_steps": repair_steps if repair_steps else ["Initiate core parameter inspection sweep."],
            "required_tools": tools_required if tools_required else ["Standard Field Diagnostics Kit"],
            "required_parts": spare_parts_required if spare_parts_required else ["Universal System Structural Compound"],
            "manual_reference": source_obj,
            "estimated_time": estimated_time_str
        },

        # Nested Object: /reports (ai_recommendations section card)
        "report_card": {
            "title": f"Reduce down-time footprint on {machine_id}",
            "severity": severity_raw.upper(),
            "business_impact": f"Prevents sudden lifecycle failure risks saving estimated asset replacement bounds.",
            "action": f"Execute validation step loops on identified tracking: {likely_cause[:60]}",
            "benefit": "Preserves core manufacturing quality metrics compliant with high-level plant targets."
        },

        # Nested Object: /dashboard summary widget metadata
        "dashboard_summary": {
            "active_alert_state": status_raw,
            "manual_coverage": "100.0%" if context.get("has_context") else "0.0%",
            "inventory_state": "OPTIMAL" if inventory_available else "THRESHOLD_RISK",
            "recommendation_state": recommendation_status.upper(),
            "short_text": f"Machine {machine_id} triggered state delta code {error_code}."
        },

        # Nested Object: /agent/memory Dynamic Real View
        "agent_memory_view": {
            "severity": severity_raw.upper(),
            "department": department,
            "estimated_time": estimated_time_str,
            "recommended_steps": repair_steps if repair_steps else ["Verify system instrumentation paths."],
            "required_tools": tools_required if tools_required else ["Standard Field Toolset"],
            "required_parts": spare_parts_required if spare_parts_required else ["Universal Gasket Seal Kit"],
            "inventory_status": inv_status_str,
            "work_order": "PENDING_ALLOCATION"
        }
    }
    return recommendation

def print_recommendation_report(recommendation):
    print("\n" + "=" * 60)
    print("   STRUCTURED MAINTENANCE RECOMMENDATION — CONTRACT VIEW")
    print("=" * 60)
 
    print(f"\n  Recommendation ID : {recommendation['recommendation_id']}")
    print(f"  Alert ID          : {recommendation['alert_id']}")
    print(f"  Machine ID        : {recommendation['machine_id']}")
    print(f"  Error Code        : {recommendation['error_code']}")
    print(f"  Severity          : {recommendation['severity']}")
    print(f"  Response Version  : {recommendation['response_version']}")
    print(f"  Processing Time   : {recommendation['processing_time']}s")
    print(f"  Contract State    : {recommendation['state']}")

    if recommendation["likely_cause"] != DEFAULT_TEXT:
        print(f"\n[ LIKELY CAUSE ]")
        print(f"  {recommendation['likely_cause']}")

    if recommendation["repair_steps"]:
        print(f"\n[ REPAIR STEPS ]")
        for i, step in enumerate(recommendation["repair_steps"], start=1):
            print(f"  {i}. {step}")
 
    if recommendation["safety_precautions"]:
        print(f"\n[ SAFETY PRECAUTIONS ]")
        for note in recommendation["safety_precautions"]:
            print(f"  - {note}")
 
    if recommendation["tools_required"]:
        print(f"\n[ TOOLS REQUIRED ]")
        for tool in recommendation["tools_required"]:
            print(f"  - {tool}")
 
    if recommendation["spare_parts_required"]:
        print(f"\n[ SPARE PARTS REQUIRED ]")
        for part in recommendation["spare_parts_required"]:
            print(f"  - {part}")

    print(f"\n[ NESTED CONTRACT OBJECTS VERIFICATION ]")
    print(f"  -> UI Summary View           : {recommendation['ui_summary']}")
    print(f"  -> Draft Work Order ID       : {recommendation['work_order_draft']['work_order_id']}")
    print(f"  -> Draft Work Order Status   : {recommendation['work_order_draft']['status']}")
    print(f"  -> Agent View Department     : {recommendation['agent_memory_view']['department']}")
 
    print("\n" + "=" * 60)

def main():
    print("=" * 60)
    print("  recommendation_engine.py — Test All 3 Prompt Types")
    print("=" * 60)

    sample_context = {
        "alert_id": "ALT-2026-001",
        "timestamp": "2026-06-17 23:10:00",
        "machine_id": "PUMP-01",
        "error_code": "E-404",
        "severity": "High",
        "temperature": "102°C",
        "status": "critical",
        "has_context": True,
        "total_chunks": 1,
        "department": "Hydraulics Division Stack",
        "sources_used": ["A16B-1600-0520(CNC).pdf — Page 414"],
        "inventory_matches": [{"part_number": "TS-220", "stock": 5}],
        "context_text": (
            "--- Reference 1 (Source: A16B-1600-0520(CNC).pdf, Page: 414, "
            "Type: text) ---\n"
            "If the pump temperature exceeds 100°C, shut down the unit "
            "immediately. Inspect the coolant lines for blockages. "
            "Replace the thermal sensor (Part #TS-220) if the reading is "
            "inconsistent with the physical temperature. Required tools: "
            "torque wrench, multimeter."
        )
    }
    
    llm = load_llm()

    for prompt_type in ["full", "repair_steps", "tools_parts"]:
        print(f"\n\nTesting prompt_type = '{prompt_type}' ...")
        recommendation = generate_recommendation(sample_context, llm, prompt_type)
        print_recommendation_report(recommendation)

if __name__ == "__main__":
    main()