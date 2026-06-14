import chromadb

from embed import (
    load_chunks,
    generate_all_embeddings,
    model
)

CHROMA_PATH = "./chroma_store"
COLLECTION_NAME = "maintenance_manuals"


def main():
    print("Loading chunks...")

    chunks = load_chunks()

    print("Generating embeddings...")

    embedding_results = generate_all_embeddings(
        chunks,
        model
    )

    print("Connecting to ChromaDB...")

    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME
    )

    print("Storing embeddings in ChromaDB...")

    for item in embedding_results:

        metadata = {
            "page_number": item["page_number"],
            "content_type": item["content_type"],
            "chunk_char_count": item["chunk_char_count"]
        }

        if item.get("source_file"):
            metadata["source_file"] = item["source_file"]

        collection.add(
            ids=[item["chunk_id"]],
            embeddings=[item["embedding"]],
            documents=[item["chunk_text"]],
            metadatas=[metadata]
        )

    print("\nStorage completed successfully!")
    print("Collection Name:", collection.name)
    print("Total Records:", collection.count())


if __name__ == "__main__":
    main()