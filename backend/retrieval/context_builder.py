def build_context(query, retrieved_results, alert=None):

    context_blocks = []

    for index, result in enumerate(retrieved_results, start=1):

        block = {
            "chunk_number": index,
            "source_file": result.get("source_file", "unknown"),
            "page_number": result.get("page_number", "unknown"),
            "content_type": result.get("content_type", "text"),
            "text": result.get("chunk_text", "").strip()
        }

        context_blocks.append(block)

    context_text_parts = []

    for block in context_blocks:

        formatted_block = (
            f"[Source: {block['source_file']} | "
            f"Page: {block['page_number']} | "
            f"Type: {block['content_type']}]\n"
            f"{block['text']}"
        )

        context_text_parts.append(formatted_block)

    context_text = "\n\n-----\n\n".join(context_text_parts)

    sources_used = [
        f"{block['source_file']} - Page {block['page_number']}"
        for block in context_blocks
    ]

    context = {
        "query": query,
        "machine_id": alert.get("machine_id", "unknown") if alert else "unknown",
        "error_code": alert.get("error_code", "unknown") if alert else "unknown",
        "status": alert.get("status", "unknown") if alert else "unknown",
        "total_chunks": len(context_blocks),
        "sources_used": sources_used,
        "context_blocks": context_blocks,
        "context_text": context_text,
        "results": [
            {
                "page": result.get("page_number"),
                "source": result.get("source_file"),
                "content": result.get("chunk_text")
            }
            for result in retrieved_results
        ]
    }

    return context
