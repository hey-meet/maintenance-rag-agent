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

