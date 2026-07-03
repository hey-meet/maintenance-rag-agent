import chromadb
import os
# Import the updated function from your refactored embed.py module
from .embed import generate_embeddings

CHROMA_PATH = "./chroma_store"
COLLECTION_NAME = "maintenance_manuals"

# Centralized machine-aware mapping registry
MANUAL_MACHINE_MAP = {
    "A16B-1600-0520(CNC).pdf": "CNC-CONTROL-MOTOR",
    "O&M_manual_56-449T_frames(Indestrial Motor).pdf": "INDUSTRIAL-MOTOR",
    "A5E52711437A_AA(Indestrial Motor).pdf": "INDUSTRIAL-MOTOR",
    "V200-500 M-2000-S(Hydrolic).pdf": "HYDRAULIC-PUMP"
}

print("\nChroma absolute path:")
print(os.path.abspath(CHROMA_PATH))


# REFACTORED CORE ENGINE FUNCTION: Persistent Multi-Manual Storage Pipeline
def store_embeddings(embedding_results):
    """
    Validates and processes an embedding results payload into ChromaDB.
    Guards against duplicates by looking up existing 'source_file' metadata.
    """
    # 1. Edge-case Validation Matrix
    if not embedding_results or not embedding_results.get("embeddings"):
        print("Warning: Received an empty embedding vector payload.")
        return {
            "embedded": False,
            "source_file": embedding_results.get("source_file", "unknown"),
            "total_vectors": 0
        }

    raw_embeddings_list = embedding_results["embeddings"]
    source_file = embedding_results.get("source_file", "unknown")
    just_filename = os.path.basename(source_file)

    # Resolve the machine type using the uploaded PDF filename
    resolved_machine_type = MANUAL_MACHINE_MAP.get(
        just_filename,
        "UNKNOWN"
    )

    # 2. Connect to the Persistent Engine
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    # Intentionally removed client.delete_collection() to keep system append-only
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}  # Forces optimal distance calculation
    )

    # 3. Duplicate Vector Validation Check
    print(f"Checking collection registry for existing entries matching: {just_filename}")
    existing_records = collection.get(
        where={"source_file": just_filename},
        limit=1  # We only need a single match hit to confirm presence
    )

    if existing_records and existing_records.get("ids"):
        print(f"[DEDUPLICATION] Operational vectors for '{just_filename}' already index-mapped. Skipping insertion.")
        return {
            "embedded": False,
            "source_file": just_filename,
            "total_vectors": collection.count() # Returns the existing collection's context size
        }

    # 4. Transmit Batch Processing Arrays
    print(f"Executing Batch Insertion to ChromaDB for: {just_filename}...")
    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for item in raw_embeddings_list:
        ids.append(item["chunk_id"])
        embeddings.append(item["embedding"])
        documents.append(item["chunk_text"])
        metadatas.append({
            "page_number": int(item["page_number"]),
            "content_type": item["content_type"],
            "chunk_char_count": int(item["chunk_char_count"]),
            "source_file": just_filename,  # Normalized uniform file identifier
            "machine_type": resolved_machine_type
        })

    # Single-shot transactional store push
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )

    # Concise production summary reporting block
    print("============================================================")
    print("STORED MANUAL")
    print(f"File          : {just_filename}")
    print(f"Machine Type  : {resolved_machine_type}")
    print(f"Added Chunks  : {len(ids)}")
    print(f"Total Chunks  : {collection.count()}")
    print("============================================================")

    return {
        "embedded": True,
        "source_file": just_filename,
        "total_vectors": len(ids)
    }


# Local Testing Execution Matrix
def main():
    test_chunk_path = "backend/parser/chunks/motor_manual_chunks.json"
    
    print("--- Running Local Mock Database System Test ---")
    if not os.path.exists(test_chunk_path):
        print(f"Skipping local main() run: Mock chunk metadata source file missing.")
        return

    try:
        # Generate the dynamic vector payloads from our dependencies
        print("Synthesizing test embeddings...")
        mock_embedding_payload = generate_embeddings(test_chunk_path)
        
        # Test Run 1: Should ingest if fresh, or block elegantly if matching metadata exists
        result = store_embeddings(mock_embedding_payload)
        print(f"\nEngine result payload: {result}")
        
    except Exception as e:
        print(f"Local test execution failed with exception: {e}")


if __name__ == "__main__":
    main()