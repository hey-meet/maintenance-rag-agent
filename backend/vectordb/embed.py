import json
import os
from sentence_transformers import SentenceTransformer

# Aligned path layouts with your directory specifications
CHUNKS_JSON_FILE = "backend/parser/chunks/motor_manual_chunks.json"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

print(f"Initializing Embedding Transformer: {EMBEDDING_MODEL_NAME}")
model = SentenceTransformer(EMBEDDING_MODEL_NAME)

if not model:
    print(f"Error: Could not load embedding model: {EMBEDDING_MODEL_NAME}")
    exit()


def load_chunks():
    print("Loading text fragments from chunk directory storage...")

    if not os.path.exists(CHUNKS_JSON_FILE):
        print(f"Error: Could not find chunks JSON file at: {CHUNKS_JSON_FILE}")
        exit()

    with open(CHUNKS_JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data["chunks"]
    top_level_source = os.path.basename(data.get("source_pdf", "unknown"))

    for chunk in chunks:
        if not chunk.get("source_file") or chunk.get("source_file") == "unknown":
            chunk["source_file"] = top_level_source

    print(f" ✓ Successfully loaded {len(chunks)} operational chunks.")
    return chunks


def generate_all_embeddings(chunks, model):
    print(f"Executing batch vector encoding sequences across {len(chunks)} fragments...")

    # Fetching the structural text that contains our context enrichment headers
    texts = [chunk["chunk_text"] for chunk in chunks]

    # Generating dense representations vector spaces
    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True  # Cosine similarity matching scaling factor fix!
    )

    results = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        
        # PRODUCTION SERIALIZATION FIX: Convert numpy NDArray to generic native python floats list
        # This keeps database schemas pristine preventing typing exceptions in ChromaDB
        clean_embedding_vector = embedding.tolist()

        result = {
            "chunk_id": chunk.get("chunk_id", f"chunk_{i}"),
            "page_number": int(chunk["page_number"]),
            "chunk_char_count": int(chunk["chunk_char_count"]),
            "source_file": chunk.get("source_file", "unknown"),
            "chunk_text": chunk["chunk_text"],
            "raw_text_segment": chunk.get("raw_text_segment", chunk["chunk_text"]),
            "content_type": chunk["content_type"],
            "embedding": clean_embedding_vector  # Safely nested typed array
        }
        results.append(result)

    print(f"✓ All {len(results)} vector space mapping nodes completed successfully!")
    return results


def main():
    chunks = load_chunks()
    
    if not chunks:
        print("Error: Ingestion payload is empty. Complete parsing stages first.")
        return

    embedding_results = generate_all_embeddings(chunks, model)

    # Next setup pipeline automatically passes this array payload directly down to 
    # the target database insertion scripts.
    return embedding_results


if __name__ == "__main__":
    main()