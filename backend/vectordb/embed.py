import json
import os
from sentence_transformers import SentenceTransformer

CHUNKS_JSON_FILE = "backend/parser/chunks/motor_manual_chunks.json"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

model = SentenceTransformer(EMBEDDING_MODEL_NAME)

if not model:
    print(f"Error: Could not load embedding model: {EMBEDDING_MODEL_NAME}")
    exit()


def load_chunks():
    print("Loading chunks from JSON file...")

    if not os.path.exists(CHUNKS_JSON_FILE):
        print(f"Error: Could not find chunks JSON file at: {CHUNKS_JSON_FILE}")
        exit()

    with open(CHUNKS_JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data["chunks"]

    # Preserve source PDF metadata for all chunks
    source_pdf = data.get("source_pdf", "unknown")

    for chunk in chunks:
        chunk["source_file"] = source_pdf

    print(f"  Found {len(chunks)} chunks.")

    return chunks


def generate_all_embeddings(chunks, model):

    print("Generating embeddings for all chunks...")

    results = []

    texts = [chunk["chunk_text"] for chunk in chunks]

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True
    )

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):

        result = {
            "chunk_id": chunk.get("chunk_id", f"chunk_{i}"),
            "page_number": chunk["page_number"],
            "chunk_char_count": chunk["chunk_char_count"],
            "source_file": chunk.get("source_file", "unknown"),
            "chunk_text": chunk["chunk_text"],
            "content_type": chunk["content_type"],
            "embedding": embedding
        }

        results.append(result)

    print(f"\nAll {len(results)} embeddings generated!")

    return results


def main():

    chunks = load_chunks()

    print(f"Loaded {len(chunks)} chunks from JSON file.")

    embedding_results = generate_all_embeddings(
        chunks,
        model
    )

    print(f"Generated embeddings for {len(embedding_results)} chunks.")


if __name__ == "__main__":
    main()