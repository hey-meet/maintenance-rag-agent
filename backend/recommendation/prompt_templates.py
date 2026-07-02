"""
Week 3 Prompt Templates
"""

SYSTEM_ROLE = (
    "You are an industrial maintenance AI assistant. "
    "You analyze machine faults using only the provided maintenance "
    "manual references. "
    "You must never invent information. "
    "You must remain safety conscious. "
    "Your responses must strictly follow the required output format."
)

GROUNDING_RULE = (
    "Use ONLY the manual references provided below. "
    "Do not use outside knowledge. "
    "Do not guess missing information. "
    "If information is unavailable, write "
    "'Not specified in available manual data'."
)

# Helper: format the alert details into a readable block

def format_alert_block(context):
    """
    Takes the context dict (from context_builder.py) and returns
    a readable block describing the machine alert.
    """
    return (
        f"Alert ID    : {context.get('alert_id', 'unknown')}\n"
        f"Timestamp   : {context.get('timestamp', 'unknown')}\n"
        f"Machine ID  : {context.get('machine_id', 'unknown')}\n"
        f"Error Code  : {context.get('error_code', 'unknown')}\n"
        f"Temperature : {context.get('temperature', 'unknown')}\n"
        f"Severity    : {context.get('severity', 'unknown')}\n"
        f"Status      : {context.get('status', 'unknown')}"
    )

# Helper: format the "no manual data found" case

def format_reference_block(context):
    if not context.get("has_context", False):
        return (
            "No relevant manual references were retrieved "
            "for this machine alert."
        )
    return context.get("context_text", "")

def get_missing_text():
    return "Not specified in available manual data"

# TEMPLATE 1: Full Maintenance Recommendation

def build_recommendation_prompt(context):
    """
    Full structured recommendation prompt :
    likely cause, repair steps, safety notes, tools and parts

    input: context dict from context_builder.py
    output: a single prompt string ready to send to LLM
    """

    prompt = f"""{SYSTEM_ROLE}
{GROUNDING_RULE}

## Machine Alert
{format_alert_block(context)}

## Manual References
{format_reference_block(context)}

## Task

Using ONLY the manual references above, return your answer
using EXACTLY the following headings.

Likely Cause:
Repair Steps:
Safety Precautions:
Tools Required:
Spare Parts Required:

Rules:

- Do not create additional headings.
- Do not add introductions.
- Do not add conclusions.
- Repair Steps must use numbered steps.
- Safety Precautions must use bullet points.
- Tools Required must use bullet points.
- Spare Parts Required must use bullet points.
- Use ONLY information explicitly present in the retrieved manual references.
- Never use outside knowledge or common industrial practices.
- If the retrieved manual references do not explicitly contain a Safety Precautions section, return exactly:

Safety Precautions:
{get_missing_text()}

- Do NOT generate generic safety advice such as:
  - PPE
  - Lockout/Tagout (LOTO)
  - Disconnect power
  - Wear gloves
  - Safety glasses
  - Isolate electrical supply
  unless those instructions appear explicitly in the retrieved manual references.
- If any section is unavailable, write:
  {get_missing_text()}

Return ONLY these sections.
"""
    return prompt.strip()

# TEMPLATE 2: Repair procedure only

def build_repair_steps_prompt(context):
    """ Asking LLM for only Step by Step repair mechanism"""

    prompt = f"""{SYSTEM_ROLE}
{GROUNDING_RULE}

## Machine Alert
{format_alert_block(context)}

## Manual References
{format_reference_block(context)}

## Task

Return ONLY the repair procedure.

Rules:

- Use numbered steps.
- One action per step.
- Keep each step short.
- Do not add explanations.
- Do not add introductions.
- Do not add conclusions.
- If information is unavailable write:
  {get_missing_text()}

Return ONLY the repair steps.
"""
    return prompt.strip()

# TEMPLATE 3: Tools & Spare parts

def build_tools_and_parts_prompt(context):
    """Asking LLM to required Tools & Spare parts for maintenance"""

    prompt = f"""{SYSTEM_ROLE}
{GROUNDING_RULE}

## Machine Alert
{format_alert_block(context)}

## Manual References
{format_reference_block(context)}

## Task

Return EXACTLY these sections.

Tools Required:
Spare Parts Required:

Rules:

- Use bullet points.
- One item per line.
- Do not add explanations.
- Do not add additional sections.
- If unavailable write:
  {get_missing_text()}

Return ONLY these sections.
"""
    return prompt.strip()

def main():
    sample_context = {
        "alert_id"    : "ALT-2026-001",
        "timestamp"   : "2026-06-17 23:10:00",
        "machine_id"  : "PUMP-01",
        "error_code"  : "E-404",
        "temperature" : "102°C",
        "severity"    : "high",
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

    print("\n--- TEMPLATE 1: Full Recommendation Prompt ---\n")
    print(build_recommendation_prompt(sample_context))

    print("\n\n--- TEMPLATE 2: Repair Steps Only Prompt ---\n")
    print(build_repair_steps_prompt(sample_context))

    print("\n\n--- TEMPLATE 3: Tools & Parts Only Prompt ---\n")
    print(build_tools_and_parts_prompt(sample_context))

    print("\n" + "=" * 58)

if __name__ == "__main__":
    main()