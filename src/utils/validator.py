import os

def validate_rag_metadata(retrieved_docs) -> dict:
    """
    Validates that retrieved documents contain mandatory source and page references.
    Returns a status dictionary for audit trail compliance.
    """
    total_docs = len(retrieved_docs)
    valid_docs = 0
    missing_fields = []

    for idx, doc in enumerate(retrieved_docs):
        # Handle both LangChain Document objects and raw dictionaries
        metadata = getattr(doc, 'metadata', doc if isinstance(doc, dict) else {})
        
        has_source = 'source' in metadata and metadata['source']
        has_page = 'page' in metadata and metadata['page'] is not None
        
        if has_source and has_page:
            valid_docs += 1
        else:
            missing_fields.append({
                "index": idx,
                "has_source": has_source,
                "has_page": has_page
            })

    return {
        "is_valid": valid_docs == total_docs,
        "total_checked": total_docs,
        "valid_count": valid_docs,
        "failures": missing_fields
    }