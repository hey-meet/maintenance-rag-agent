from retrieval import Retriever
from query_gen import generate_query_from_alert, SAMPLE_ALERTS

TOP_K_RESULTS = 3

def context_Build(alert,retrived_chunks):
    print()

    context_blocks = []
    for i,chunk in enumerate(retrived_chunks):
        block = {
            "chunk_number" : i+1,
            "source_file" : chunk.get("source_file","unknown"),
            "page_number" : chunk.get("page_number","?"),
            "content_type" : chunk.get("content_type","text"),
            "text"         : chunk.get("chunk_text","").strip()
        }
        context_blocks.append(block)

    context_text_parts = []

    for block in context_blocks:
        parts = (
            f"[Source: {block['source_file']} | "
            f"Page: {block['page_number']} | "
            f"Type: {block['content_type']}]\n"
            f"{block['text']}"
        )
        context_text_parts.append(parts)

    context_text = "\n\n.....\n\n".join(context_text_parts)
    sources_used = [
        f"{block['source_file']} — Page {block['page_number']}"
        for block in context_blocks
    ]
    
    # --- Assemble the final context dictionary ---

    context = {
        "machine_id"    : alert.get("machine_id",  "unknown"),
        "error_code"    : alert.get("error_code",  "unknown"),
        "status"        : alert.get("status",      "unknown"),
        "total_chunks"  : len(context_blocks),
        "sources_used"  : sources_used,       # list of "file — Page X" strings
        "context_blocks": context_blocks,     # full structured blocks with metadata
        "context_text"  : context_text        # assembled plain text, ready to pass forward
    }

    return context
