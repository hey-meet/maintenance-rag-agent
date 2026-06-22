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
