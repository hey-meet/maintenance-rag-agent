from .retriever import Retriever
from .query_generator import generate_query_from_alert

MIN_CHUNK_LENGTH = 30


def build_context(alert, retrieved_chunks):

    context_blocks = []
    seen_chunks = set()

    # ---------- Process Retrieved Chunks ----------
    for chunk in retrieved_chunks:

        text = chunk.get("chunk_text", "").strip()

        if len(text) < MIN_CHUNK_LENGTH:
            continue

        source_file = chunk.get("source_file", "unknown")
        page_number = chunk.get("page_number", "?")

        dedup_key = (source_file, page_number, text)

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

    # ---------- Query ----------
    query = generate_query_from_alert(alert)

    has_context = len(context_blocks) > 0

    # ---------- Context Summary ----------
    context_summary = (
        f"{alert.get('machine_id', 'Unknown Machine')} "
        f"reported {alert.get('error_code', 'Unknown Error')}"
    )

    # ---------- Final Context ----------
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


def print_context(context):

    print("\n" + "=" * 65)
    print("ASSEMBLED RETRIEVAL CONTEXT")
    print("=" * 65)

    print(f"\nAlert ID     : {context['alert_id']}")
    print(f"Machine ID   : {context['machine_id']}")
    print(f"Error Code   : {context['error_code']}")
    print(f"Severity     : {context['severity']}")
    print(f"Status       : {context['status']}")

    print(f"\nQuery:\n")
    print(context["query"])

    print(f"\nSources Referenced:")

    for source in context["sources_used"]:
        print(f"  - {source}")

    print("\nContext Blocks:\n")

    for block in context["context_blocks"]:

        print(f"[Chunk {block['chunk_number']}]")

        print(
            f"Source : {block['source_file']} | "
            f"Page : {block['page_number']} | "
            f"Type : {block['content_type']}"
        )

        preview = block["text"][:300]

        print(f"\n{preview} ...\n")

    print("=" * 65)


def main():

    TEST_ALERT = {
        "alert_id": "ALT-2026-003",
        "machine_id": "COMP-AIR-008",
        "error_code": "ERR_COMP_DISCHARGE_TEMP_HIGH",
        "temperature": 108.7,
        "severity": "critical",
        "status": "active",
        "timestamp": "2026-06-22T00:15:22Z"
    }

    query = generate_query_from_alert(TEST_ALERT)

    print("\nGenerated Query:\n")
    print(query)

    retriever = Retriever()

    retrieved_chunks = retriever.search(
        query,
        n_results=3
    )

    context = build_context(
        TEST_ALERT,
        retrieved_chunks
    )

    print_context(context)

    print("\nPipeline Complete.\n")


if __name__ == "__main__":
    main()