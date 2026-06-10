import json
import os
from sentence_transformers import SentenceTransformer

CHUNKS_JSON_FILE = "chunks/motor_manual_chunks.json" # Provide the path of the .json file
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

model = SentenceTransformer(EMBEDDING_MODEL_NAME)
if not model:
    print(f"Error: Could not load embedding model: {EMBEDDING_MODEL_NAME}")
    exit()

# Load chunks from JSON file

def load_chunks():
    print("Loading chunks from JSON file...")

    if not os.path.exists(CHUNKS_JSON_FILE):
        print(f"Error: Could not find chunks JSON file at: {CHUNKS_JSON_FILE}")
        exit()

    with open(CHUNKS_JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data["chunks"]
    print(f"  Found {len(chunks)} chunks.")

    return chunks

# Generate embeddings for a single chunk of text

def generate_embeddings(text, model):
    embeddings_array = model.encode(text)

    embeddings_list = embeddings_array.tolist()

    return embeddings_list

# Generate embeddings for all chunks

def generate_all_embeddings(chunks, model):
    
    print("Generating embeddings for all chunks...")
    results = []

    for i,chunk in enumerate(chunks):

        chunk_text = chunk["chunk_text"]

        # print(f"  Processing chunk {i+1}/{len(chunks)}..."
        #     f"| page {chunk['page_number']}  "
        #     f"| {chunk['chunk_char_count']} chars ...",
        # end=" ")
        embedding = generate_embeddings(chunk_text, model)
        
        result={
            "chunk_id"     : chunk.get("chunk_id",     f"chunk_{i}"),
            "page_number": chunk["page_number"],
            "chunk_char_count": chunk["chunk_char_count"],
            "source_file"  : chunk.get("source_file",  "unknown"),
            "chunk_text": chunk_text,
            "content_type": chunk["content_type"],
            "embedding": embedding}
        
        results.append(result)
        #print(f"Done.(embedding size: {len(embedding)})")

    print(f"\n  All {len(results)} embeddings generated!")  
    return results
    

def main():

    chunks = load_chunks()
    print(f"Loaded {len(chunks)} chunks from JSON file.")

    embeddings_results = generate_all_embeddings(chunks, model)

    # print("Embedding for chunk 0:", embeddings_results[0]["embedding"])
    
if __name__ == "__main__":
    main()
