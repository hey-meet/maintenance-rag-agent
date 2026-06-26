import json
import os
from sentence_transformers import SentenceTransformer

# System-wide static variables
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

print(f"Initializing Embedding Transformer: {EMBEDDING_MODEL_NAME}")
model = SentenceTransformer(EMBEDDING_MODEL_NAME)

if not model:
    print(f"Error: Could not load embedding model: {EMBEDDING_MODEL_NAME}")
    exit()


# REFACTORED CORE ENGINE FUNCTION: Dynamic Multi-Manual Processing Pipeline
def generate_embeddings(chunk_file_path):
    """
    Loads dynamically targeted chunk files, matches the source metadata,
    generates normalized vectors, and returns a sanitized payload.
    """
    # Duplicate-Safe Validation Guard
    if not os.path.exists(chunk_file_path):
        raise FileNotFoundError(f"Target chunk collection missing at: {chunk_file_path}")

    print(f"Loading text fragments from targeted directory: {chunk_file_path}")
    with open(chunk_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data.get("chunks", [])
    source_pdf = data.get("source_pdf", "unknown")
    top_level_source = os.path.basename(source_pdf)

    if not chunks:
        print(f"Warning: Ingestion payload for {top_level_source} is completely empty.")
        return {
            "source_file": source_pdf,
            "total_embeddings": 0,
            "embeddings": []
        }

    # Ensure metadata integrity across individual chunks
    for chunk in chunks:
        if not chunk.get("source_file") or chunk.get("source_file") == "unknown":
            chunk["source_file"] = top_level_source

    print(f"Executing batch vector encoding sequences across {len(chunks)} fragments...")

    # Fetching the structural text containing context enrichment headers
    texts = [chunk["chunk_text"] for chunk in chunks]

    # Generating dense representation vector spaces
    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True  # Cosine similarity matching scaling factor fix!
    )

    results = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        
        # PRODUCTION SERIALIZATION FIX: Convert numpy NDArray to generic native Python float lists
        # Keeps database schemas pristine, preventing typing exceptions in downstream stores
        clean_embedding_vector = embedding.tolist()

        result = {
            "chunk_id": chunk.get("chunk_id", f"chunk_{i}"),
            "page_number": int(chunk["page_number"]),
            "chunk_char_count": int(chunk.get("chunk_char_count", len(chunk["chunk_text"]))),
            "source_file": chunk.get("source_file", "unknown"),
            "chunk_text": chunk["chunk_text"],
            "raw_text_segment": chunk.get("raw_text_segment", chunk["chunk_text"]),
            "content_type": chunk["content_type"],
            "embedding": clean_embedding_vector  # Safely nested native typed array
        }
        results.append(result)

    print(f"✓ All {len(results)} vector space mapping nodes completed successfully for {top_level_source}!")
    
    return {
        "source_file": source_pdf,
        "total_embeddings": len(results),
        "embeddings": results
    }


# Local Testing Execution Matrix
def main():
    # Hardcoded fallback testing layout strictly inside local scope
    test_chunk_path = "backend/parser/chunks/motor_manual_chunks.json"
    
    print("--- Running Local Mock Embedding Test ---")
    
    # Check for presence before initiating mock validation sequence
    if not os.path.exists(test_chunk_path):
        print(f"Skipping local main() run: Test file not found at: {test_chunk_path}")
        return

    try:
        payload = generate_embeddings(test_chunk_path)
        print(f"\nEmbedding run successful!")
        print(f"Source Document Target: {payload['source_file']}")
        print(f"Generated Vector Nodes: {payload['total_embeddings']}")
        if payload["embeddings"]:
            print(f"Vector Dimensionality Check: {len(payload['embeddings'][0]['embedding'])} dimensions")
    except Exception as e:
        print(f"Local test execution failed with exception: {e}")


if __name__ == "__main__":
    main()