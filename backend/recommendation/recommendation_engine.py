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



