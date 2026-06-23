"""
Week 3 Recommendation Engine
"""

from LLM_service import load_llm, call_llm
from prompt_templet import (
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

PROMPT_TYPE = "full"

def build_prompt(context, Prompt_type):
    """call the currect template from prompt_template.py """

    if Prompt_type == "repair_steps":
        return build_repair_steps_prompt(context)
    
    elif Prompt_type == "tools_parts":
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
            parts = item.split(".",1)
            if len(parts) == 2:
                item = parts[1].strip()

        if item:
            clean_items.append(item)

    return clean_items

def parse_sections(raw_text, prompt_type):

    expected_headings = get_headings_for_type(prompt_type)

    if prompt_type == "repair_steps":
        return {
            "repair_steps": split_into_list(raw_text.strip().split("\n"))
            }
    
    section={}
    current_key = None
    current_line = []

    for line in raw_text.split("\n"):
        clean_line = line.strip()

        matched_heading = None

        for heading in expected_headings:
            simplified = clean_line.lower()
            simplified = simplified.replace("*","")
            simplified = simplified.replace(":","")
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
        section["full_text"] = raw_text.strip()

    return section

def generate_recommendation(context, llm=None,prompt_type=PROMPT_TYPE):
    """ Run the full process here:
    1. fetch prompt from prompt_templetes as instruction
    2. send the prompt to llm
    3. splits asnwers into separate section
    4. add the context
    5. return in a clean formate
    """

    if llm is None :
        llm = load_llm()

    prompt = build_prompt(context, PROMPT_TYPE)

    raw_answer = call_llm(prompt, llm)

    section = parse_sections(raw_answer, prompt_type)

    source_references = context.get("sources_used", [])

    recommendation = {
        "alert_id"   : context.get("alert_id", "unknown"),
        "machine_id" : context.get("machine_id", "unknown"),
        "error_code" : context.get("error_code", "unknown"),
        "status"     : context.get("status", "unknown"),
        "prompt_type": prompt_type ,   # so the caller knows which type was used
 
        "likely_cause"         : section.get("likely_cause",         "Not applicable"),
        "repair_steps"         : section.get("repair_steps",         []),
        "safety_precautions"   : section.get("safety_precautions",   []),
        "spare_parts_required" : section.get("spare_parts_required", []),
        "tools_required"       : section.get("tools_required",       []),
 
        "source_references" : source_references,
        "has_manual_data"   : context.get("has_context", False),
 
        "raw_llm_response"  : raw_answer
    }
    return recommendation

def print_recommendation_report(recommendation):
    print("\n" + "=" * 60)
    print("  STRUCTURED MAINTENANCE RECOMMENDATION")
    print("=" * 60)
 
    print(f"\n  Alert ID   : {recommendation['alert_id']}")
    print(f"  Machine ID : {recommendation['machine_id']}")
    print(f"  Error Code : {recommendation['error_code']}")
    print(f"  Status     : {recommendation['status']}")

    if recommendation["likely_cause"] != "Not applicable":
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
 
    print(f"\n[ SOURCE REFERENCES ]")
    if recommendation["source_references"]:
        for ref in recommendation["source_references"]:
            print(f"  - {ref}")
    else:
        print("  No manual sources were used.")
 
    if recommendation["raw_llm_response"]:
        print(f"\n[ RAW LLM RESPONSE ]")
        for line in recommendation["raw_llm_response"].split("\n"):
            print(f"  {line}")
 
    print("\n" + "=" * 60)

def main():
    print("=" * 60)
    print("  recommendation_engine.py — Test All 3 Prompt Types")
    print("=" * 60)

    sample_context = {
        "alert_id"    : "ALT-2026-001",
        "timestamp"   : "2026-06-17 23:10:00",
        "machine_id"  : "PUMP-01",
        "error_code"  : "E-404",
        "status"      : "critical",
        "has_context" : True,
        "total_chunks": 1,
        "sources_used": ["A16B-1600-0520(CNC).pdf — Page 414"],
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

