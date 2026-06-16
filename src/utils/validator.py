import os

def check_environment() -> str:
    """
    Ensures the correct environment variable requested by the team lead is present.
    """
    api_key = os.getenv("LLAMA_CLOUD_API_KEY")
    if not api_key:
        raise ValueError("Critical Error: LLAMA_CLOUD_API_KEY environment variable is missing.")
    return api_key

def validate_rag_metadata(retrieved_docs) -> dict:
    """
    Validates that retrieved chunks contain mandatory source and page references
    to integrate cleanly with the ingestion workflow.
    """
    total_docs = len(retrieved_docs)
    valid_docs = 0
    failures = []

    for idx, doc in enumerate(retrieved_docs):
        # Gracefully handle both object models (like LangChain) and raw dictionaries
        metadata = getattr(doc, 'metadata', doc if isinstance(doc, dict) else {})
        
        has_source = 'source' in metadata and metadata['source']
        has_page = 'page' in metadata and metadata['page'] is not None
        
        if has_source and has_page:
            valid_docs += 1
        else:
            failures.append({
                "index": idx,
                "has_source": has_source,
                "has_page": has_page
            })

    return {
        "is_valid": valid_docs == total_docs,
        "total_checked": total_docs,
        "valid_count": valid_docs,
        "failures": failures
    }