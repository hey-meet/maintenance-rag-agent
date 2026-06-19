from retrieval import Retriever
from query_gen import generate_query_from_alert, SAMPLE_ALERTS

TOP_K_RESULTS = 3
MIN_CHUNK_LENGTH= 30

def context_Build(alert,retrived_chunks):
    print()

    context_blocks = []
    seen_chunks=set()
    
    for i,chunk in enumerate(retrived_chunks):

        text= chunk.get("chunk_text", "")

        if len(text)<MIN_CHUNK_LENGTH:
            continue

        source_file = chunk.get("source_file", "unknown")
        page_number = chunk.get("page_number", "?")

        dedup_key = (source_file,page_number,text)
        if dedup_key in seen_chunks:
            continue
        seen_chunks.add(dedup_key)
        
        block = {
            "chunk_number"   : len(context_blocks) + 1,  
            "relevance_rank" : len(context_blocks) + 1,
            "source_file"    : source_file,
            "page_number"    : page_number,
            "content_type"   : chunk.get("content_type", "text"),
            "text"           : text
        }
        context_blocks.append(block)

    context_text_parts = []

    for block in context_blocks:
        parts = (
            f"--- Reference {block['relevance_rank']} "
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

    has_context = len(context_blocks) > 0
    
    # --- Assemble the final context dictionary ---

    context = {
        "alert_id"      : alert.get("alert_id",   "unknown"),
        "timestamp"     : alert.get("timestamp",  "unknown"),
        "machine_id"    : alert.get("machine_id",  "unknown"),
        "error_code"    : alert.get("error_code",  "unknown"),
        "status"        : alert.get("status",      "unknown"),
        "has_context"   : has_context,
        "total_chunks"  : len(context_blocks),
        "sources_used"  : sources_used,       # list of "file — Page X" strings
        "context_blocks": context_blocks,     # full structured blocks with metadata
        "context_text"  : context_text        # assembled plain text, ready to pass forward
    }

    return context


def print_context(context):

    print("\n" + "=" * 58)
    print("  ASSEMBLED RETRIEVAL CONTEXT")
    print("=" * 58)

    print(f"\n  Sources referenced:")
    for source in context["sources_used"]:
        print(f"    - {source}")
 
    print(f"\n  Context blocks:\n")
    for block in context["context_blocks"]:
        print(f"  [ Chunk {block['chunk_number']} ]")
        print(f"  Source : {block['source_file']}  |  "
              f"Page : {block['page_number']}  |  "
              f"Type : {block['content_type']}")
        # Show first 300 characters of each chunk as a preview
        preview = block["text"][:300]
        print(f"  Text   : \n{preview} ...")
        print()
 
    print("=" * 58)
 
def main():
    alert = SAMPLE_ALERTS[0]

    query = generate_query_from_alert(alert)
    print(f"    Query: \"{query}\"")

    retriever = Retriever()
    retrieved_chunks = retriever.search(query, n_results=TOP_K_RESULTS)

    context = context_Build(alert, retrieved_chunks)
    print_context(context)

    print("\n  Pipeline complete!")

    print("=" * 58)


if __name__ == "__main__":
    main()



