SYSTEM_ROLE = (
    "You are an expert industrial maintenance assistant. "
    "You help technicians diagnose and repair machinery faults using "
    "official manual references. You are precise, safety-conscious, "
    "and you never invent information that is not present in the "
    "provided manual excerpts."
)

GROUNDING_RULE = (
    "Only use the information given in the manual references below. "
    "If the references do not contain enough information to answer "
    "confidently, clearly say so instead of guessing."
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
        f"Status      : {context.get('status', 'unknown')}"
    )

# Helper: format the "no manual data found" case

def format_reference_block(context):
    if not context.get("has_context", False):
        return "No relevant manual excerpts were found for this alert."
    return context.get("context_text", "")

# TEMPLATE 1: Full Maintenance Recommendation

def build_recommendation_prompt(context):

    '''
    Full structured recommendation prompt :
    likely cause, repair steps, safety notes,tools and parts

    input: context dict from context_builder.py
    output: a single prompt string ready to send to LLM
    '''

    prompt = f"""{SYSTEM_ROLE}
{GROUNDING_RULE}

## Machine Alert
{format_alert_block(context)}

## Manual References
{format_reference_block(context)}

## Task
Using ONLY the manual references above, provide a structured maintenance
recommendation with the following sections:

1. Likely Cause — a short explanation of what is likely causing this fault
2. Repair Steps — numbered, step-by-step repair instructions
3. Safety Precautions — any warnings or precautions mentioned in the manual
4. Tools Required — list of tools needed for the repair
5. Spare Parts Required — list of spare parts needed, if mentioned

If a section has no information in the manual references, write
"Not specified in available manual data" for that section.

"""
    return prompt.strip()

# TEMPLATE 2: Repair procedure only

def build_repair_steps_prompt(context):
    ''' Asking LLM for only Step by Step repair mechanism'''

    prompt = f"""{SYSTEM_ROLE}
{GROUNDING_RULE}

## Machine Alert
{format_alert_block(context)}

## Manual References
{format_reference_block(context)}

## Task
Based ONLY on the manual references above, list the step-by-step repair
procedure for this issue. Use a numbered list. Keep each step short and
clear, suitable for a technician to follow on the factory floor.
"""
    
    return prompt.strip()

# TEMPLATE 2: Tools & Spair parts

def build_tools_and_parts_prompt(context):
    '''Asking LLM to required Tools & Spair parts for maintenance'''

    prompt = f"""{SYSTEM_ROLE}
{GROUNDING_RULE}

## Machine Alert
{format_alert_block(context)}

## Manual References
{format_reference_block(context)}

## Task
1. Tools Required — every tool mentioned as needed for this repair
2. Spare Parts Required — every spare part or replacement component mentioned

If nothing is mentioned for a category, write "None mentioned in manual data".
Keep the answer as a simple bullet list — no extra explanation.
"""
    return prompt.strip()

def main():
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

    print("\n--- TEMPLATE 1: Full Recommendation Prompt ---\n")
    print(build_recommendation_prompt(sample_context))

    print("\n\n--- TEMPLATE 2: Repair Steps Only Prompt ---\n")
    print(build_repair_steps_prompt(sample_context))

    print("\n\n--- TEMPLATE 3: Tools & Parts Only Prompt ---\n")
    print(build_tools_and_parts_prompt(sample_context))

    print("\n" + "=" * 58)

if __name__ == "__main__":
    main()
