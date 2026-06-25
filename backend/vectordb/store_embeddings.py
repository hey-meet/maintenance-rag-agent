import chromadb
import os
from .embed import (
    load_chunks,
    generate_all_embeddings,
    model
)

CHROMA_PATH = "./chroma_store"
COLLECTION_NAME = "maintenance_manuals"

print("\nChroma absolute path:")
print(os.path.abspath(CHROMA_PATH))

def main():
    print("Loading chunks from dataset directory...")
    chunks = load_chunks()

    print("Generating dense embeddings...")
    embedding_results = generate_all_embeddings(chunks, model)

    print("Connecting to ChromaDB Persistent Engine...")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    try:
        client.delete_collection(COLLECTION_NAME)
        print("✓ Old stale vector collection purged.")
    except:
        print("No existing collection found. Initializing clean environment.")  
        
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}  # Forces optimal distance calculation
    )

    print("Executing Batch Insertion to ChromaDB...")

    # Aggregating arrays to push all vectors in a single database transaction
    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for item in embedding_results:
        ids.append(item["chunk_id"])
        embeddings.append(item["embedding"])
        documents.append(item["chunk_text"])
        metadatas.append({
            "page_number": int(item["page_number"]),
            "content_type": item["content_type"],
            "chunk_char_count": int(item["chunk_char_count"]),
            "source_file": item.get("source_file", "unknown")
        })

    # Single-shot transactional store push
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )

    print("\n✓ Database population completed successfully!")
    print("Collection Name:", collection.name)
    print("Total Production Records Indexed:", collection.count())

if __name__ == "__main__":
    main()