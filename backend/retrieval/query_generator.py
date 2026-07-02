def generate_query_from_alert(alert):
    """
    Generates an optimized, structured search query from alert data 
    designed for high-fidelity embedding retrieval.
    
    Why structured semantic queries improve retrieval:
    Embedding models capture rich context when metadata is cleanly mapped with 
    explicit attributes (labels). Providing both the raw alphanumeric token 
    and a readable phrase format ensures exact keyword indexing matches 
    simultaneously with descriptive semantic concepts found in documentation.
    
    Why certain fields are omitted/ignored:
    - Missing or empty fields are skipped to avoid inserting blank labels or 
      meaningless placeholder text (like None, N/A) which degrade vector focus.
    - Operational telemetry (like temperature readings) is explicitly excluded 
      from the final search string because technical manuals contain structural 
      repair steps rather than live sensory values; including it would inject 
      unnecessary noise and misalign embedding weights.
    """
    if not alert:
        return (
            "Retrieve maintenance manual sections describing:\n"
            "• Fault description\n• Symptoms\n• Possible causes\n"
            "• Inspection procedure\n• Troubleshooting\n• Repair procedure\n"
            "• Safety precautions\n• Required tools\n• Spare parts"
        )

    # Extract strings and strip whitespace
    machine_id = str(alert.get("machine_id", "")).strip()
    error_code = str(alert.get("error_code", "")).strip()
    severity = str(alert.get("severity", "")).strip()

    invalid_placeholders = {"", "none", "unknown", "n/a", "null"}
    query_parts = []

    # 1. Structured Metadata Block
    if machine_id and machine_id.lower() not in invalid_placeholders:
        query_parts.append(f"Machine: {machine_id}")

    if error_code and error_code.lower() not in invalid_placeholders:
        # Provide both the raw code token and the human-readable string 
        # to maximize both keyword matching and semantic density.
        readable_fault = error_code.replace("_", " ").title()
        query_parts.append(f"Error Code: {error_code}")
        query_parts.append(f"Fault Description: {readable_fault}")

    if severity and severity.lower() not in invalid_placeholders:
        # Title-case ensures consistent, clean structural presentation
        query_parts.append(f"Severity: {severity.title()}")

    # Add a clean line break separating metadata from instructions
    query_parts.append("")

    # 2. Hardened Retrieval Instruction Target Block
    # Strong imperative wording directly matching standard maintenance indexes.
    manual_targets = (
        "Retrieve maintenance manual sections describing:\n"
        "• Fault description\n"
        "• Symptoms\n"
        "• Possible causes\n"
        "• Inspection procedure\n"
        "• Troubleshooting\n"
        "• Repair procedure\n"
        "• Safety precautions\n"
        "• Required tools\n"
        "• Spare parts"
    )
    query_parts.append(manual_targets)

    # Return clean, single line-separated structured context block
    return "\n".join(query_parts)