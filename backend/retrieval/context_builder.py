from .retriever import Retriever
from .query_generator import generate_query_from_alert

MIN_CHUNK_LENGTH = 30


def build_context(alert, retrieved_chunks):
    """
    Transforms system retrieved document chunks into clean structured strings 
    for context window consumption in Mistral AI.
    """
    context_blocks = []
    seen_chunks = set()

    # ---------- Process Retrieved Chunks ----------
    for chunk in retrieved_chunks:
        text = chunk.get("chunk_text", "").strip()

        if len(text) < MIN_CHUNK_LENGTH:
            continue

        source_file = chunk.get("source_file", "unknown")
        page_number = chunk.get("page_number", "?")

        # Deduplication using strict file coordinates instead of mutating text streams
        dedup_key = (source_file, page_number, text[:50]) 

        if dedup_key in seen_chunks:
            continue

        seen_chunks.add(dedup_key)

        block = {
            "chunk_number": len(context_blocks) + 1,
            "relevance_rank": len(context_blocks) + 1,
            "source_file": source_file,
            "page_number": page_number,
            "content_type": chunk.get("content_type", "text"),
            "text": text
        }
        context_blocks.append(block)

    # ---------- Assemble Context Text ----------
    context_text_parts = []
    for block in context_blocks:
        reference = (
            f"--- Reference {block['relevance_rank']} "
            f"[Source: {block['source_file']} | "
            f"Page: {block['page_number']} | "
            f"Type: {block['content_type']}]\n"
            f"{block['text']}"
        )
        context_text_parts.append(reference)

    context_text = "\n\n-----\n\n".join(context_text_parts)

    # ---------- Sources ----------
    sources_used = [
        f"{block['source_file']} — Page {block['page_number']}"
        for block in context_blocks
    ]

    # ---------- Query Execution Parameters ----------
    query = generate_query_from_alert(alert)
    has_context = len(context_blocks) > 0
    context_summary = f"{alert.get('machine_id', 'Unknown Machine')} reported {alert.get('error_code', 'Unknown Error')}"

    # ---------- Final Structured Engine Context Object ----------
    context = {
        "alert_id": alert.get("alert_id", "unknown"),
        "timestamp": alert.get("timestamp", "unknown"),
        "machine_id": alert.get("machine_id", "unknown"),
        "error_code": alert.get("error_code", "unknown"),
        "severity": alert.get("severity", "unknown"),
        "status": alert.get("status", "unknown"),
        "query": query,
        "context_summary": context_summary,
        "has_context": has_context,
        "total_chunks": len(context_blocks),
        "sources_used": sources_used,
        "context_blocks": context_blocks,
        "context_text": context_text
    }

    return context