def generate_query_from_alert(alert):
    """
    Generates a natural-language retrieval query from alert data, optimized
    for semantic vector search across the ENTIRE manual database (not one
    specific machine/error record).

    -------------------------------------------------------------------
    WHY THIS QUERY SHAPE IMPROVES SEMANTIC RETRIEVAL
    -------------------------------------------------------------------
    Embedding models rank text by overall semantic similarity, not by
    labeled fields. A query built as a metadata block
    ("Machine: X\nError Code: Y\nSeverity: Z") pushes the embedding vector
    toward those identifier tokens, because they occupy prominent, repeated,
    label-anchored positions in the text. That biases retrieval toward
    whichever manual happens to contain a literal string match for the ID —
    which is lexical behavior, not semantic behavior — and actively hurts
    ranking when the correct manual describes the same failure using
    different wording or a different machine identifier.

    Instead, this version builds the query as a single natural-language
    maintenance-problem description — the kind of sentence an engineer
    would type into a manual's search bar — because that is what maintenance
    manuals themselves are written like (prose describing faults, symptoms,
    causes, and repair steps). Maximizing textual/structural similarity to
    the target documents is what maximizes cosine similarity in embedding
    space.

    -------------------------------------------------------------------
    HOW EACH FIELD IS TREATED
    -------------------------------------------------------------------
    - error_code: expanded into a readable phrase and woven into the
      sentence as the *subject* of the problem statement. This is the
      strongest semantic signal, since it maps most directly to a fault
      concept documented in manuals. The raw code is not stuffed in
      repeatedly or exact-matched against.
    - severity: added as a soft descriptive clause only. Never a standalone
      labeled field, so it can't dominate the vector.
    - machine_id: appended at the very end as one short optional context
      clause, clearly framed as reference-only context rather than a
      search anchor. This keeps it useful for a human/log reader without
      letting the embedding model treat it as the primary topic.
    - Missing/placeholder fields (None, "", "unknown", "n/a", "null") are
      skipped entirely to avoid diluting the embedding with meaningless
      tokens.

    Return type, function name, and signature are unchanged so this remains
    a drop-in replacement for retriever.py and the rest of the pipeline.
    """
    # Retrieval-intent block appended to every query so the embedding is
    # consistently pulled toward the structural sections manuals use to
    # document a fault, regardless of which specific alert triggered it.
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

    def is_valid(value):
        return bool(value) and value.lower() not in invalid_placeholders

    # Expand the error code into a human-readable maintenance concept.
    # This is the primary semantic anchor — it reads like a fault
    # description you'd find written in a manual, not a lookup key.
    readable_fault = None
    if is_valid(error_code):
        readable_fault = error_code.replace("_", " ").replace("-", " ").strip().lower()

    # 1. Build the core problem statement as a single natural sentence.
    #    This is what carries the embedding's semantic weight.
    if readable_fault:
        problem_statement = f"Industrial equipment fault related to {readable_fault}."
    else:
        problem_statement = "Industrial equipment fault requiring maintenance diagnosis."

    query_parts = [problem_statement]

    # 2. Severity folded in as a soft descriptive clause, not a labeled field.
    if is_valid(severity):
        query_parts.append(f"This issue is reported at {severity.lower()} severity level.")

    # 3. Retrieval-intent block — same structural targets as before.
    query_parts.append("")
    query_parts.append(manual_targets)

    # 4. Machine ID last, minimized to brief reference-only context so it
    #    cannot out-weigh the semantic fault description above it.
    if is_valid(machine_id):
        query_parts.append("")
        query_parts.append(f"(Reference context only — equipment identifier: {machine_id})")

    return "\n".join(query_parts)