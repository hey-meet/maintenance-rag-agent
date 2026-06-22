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

