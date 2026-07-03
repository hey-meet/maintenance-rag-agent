import os
import json
import chromadb
from sentence_transformers import SentenceTransformer

# --- Explicit Decoupled Path Configurations Architecture ---
CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(CURRENT_FILE_DIR)

CHROMA_PATH = os.path.join(BACKEND_ROOT, "chroma_store")
SETTINGS_PATH = os.path.join(BACKEND_ROOT, "config", "settings.json")

COLLECTION_NAME = "maintenance_manuals"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


class Retriever:
    def __init__(self):
        # Initialize Persistent ChromaDB Client with decoupled path layout
        self.client = chromadb.PersistentClient(path=CHROMA_PATH)
        self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)
        self.model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        
        # --- Fault Tolerant Operational Configurations Engine Baseline ---
        self.settings = {
            "retrieval": {
                "top_k": 3,
                "similarity_score": 0.8
            }
        }
        self._load_platform_settings()

    def _load_platform_settings(self):
        """Loads cluster configuration profiles safely into working memory space exactly once."""
        try:
            if os.path.exists(SETTINGS_PATH):
                with open(SETTINGS_PATH, "r") as file:
                    loaded_data = json.load(file)
                    if "retrieval" in loaded_data:
                        # Safely balance runtime profiles with operational defaults
                        self.settings["retrieval"].update(loaded_data["retrieval"])
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Orchestrator baseline fallback triggered due to missing/corrupt configuration: {str(e)}")

    def count_documents(self):
        return self.collection.count()

    def search(self, query, machine_id=None, n_results=3):
        """
        Executes a machine-aware semantic vector retrieval strategy over the vector database.
        
        Flow:
        Query -> Sentence Embedding -> ChromaDB Metadata Filtered Top Candidate Retrieval ->
        Similarity Calculation -> Similarity Threshold Filtering -> 
        Sort by Similarity Descending -> Return Top K Results
        """
        retrieval_cfg = self.settings["retrieval"]
        
        # Safe Type Casting Safeguard for dynamic configuration settings
        try:
            effective_top_k = int(retrieval_cfg.get("top_k", n_results))
        except (TypeError, ValueError):
            effective_top_k = n_results or 3
        
        # Robust Dynamic Casting & Parameter Resolution Engine
        try:
            threshold_score = float(retrieval_cfg.get("similarity_score", 0.8))
        except (TypeError, ValueError):
            threshold_score = 0.8
            
        # Standardized generation of high-fidelity query vector embeddings
        query_vector = self.model.encode(query, normalize_embeddings=True).tolist()

        # Request documents, metadata, and raw distance matrices natively from ChromaDB
        query_includes = ["documents", "metadatas", "distances"]

        # Scalable Search Candidate Pool Matrix
        search_pool = max(10, effective_top_k)

        # Baseline query arguments dictionary structure
        query_kwargs = {
            "query_embeddings": [query_vector],
            "n_results": search_pool,
            "include": query_includes
        }

        # Dynamically inject the metadata filter ONLY if machine_id is explicitly passed
        if machine_id is not None:
            query_kwargs["where"] = {"machine_type": machine_id}

        # Query the collection safely without risking explicit None assignment errors across versions
        results = self.collection.query(**query_kwargs)

        # Gracefully exit on empty result payloads or uninitialized vector indexes
        if not results or not results.get("documents") or not results["documents"][0]:
            print("============================================================")
            print("RETRIEVAL SUMMARY")
            print(f"Machine Filter : {machine_id if machine_id else 'None'}")
            print("Returned Chunks: 0")
            print("Reason         : No matching manual content found.")
            print("============================================================")
            return []

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results.get("distances", [[]])[0]
        
        candidates = []

        # Iterate, evaluate, and dynamically transform distance to semantic similarity metrics
        for idx, (doc, metadata) in enumerate(zip(documents, metadatas)):
            # Complete defense-in-depth against corrupt or None metadata objects
            metadata = metadata or {}
            
            # Fall back safely to maximal distance if vectors are misaligned
            distance = distances[idx] if idx < len(distances) else 1.0
            
            # Convert Cosine Distance to a bounded semantic similarity score
            similarity = max(0.0, 1.0 - distance)
            
            # Safely compile chunk context items with structural fallbacks for page numbers
            page_val = metadata.get("page_number", 0)
            try:
                page_number = int(page_val) if page_val is not None else 0
            except (ValueError, TypeError):
                page_number = 0

            if similarity < threshold_score:
                continue

            item = {
                "chunk_text": doc,
                "page_number": page_number,
                "content_type": metadata.get("content_type"),
                "source_file": metadata.get("source_file"),
                "similarity": similarity
            }
            candidates.append(item)

        # Rank entirely based on physical similarity metric (highest match first)
        candidates.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Build down to slice window constraints matching target pipeline parameters
        final_pool = []
        for x in candidates[:effective_top_k]:
            final_pool.append({
                "chunk_text": x["chunk_text"],
                "page_number": x["page_number"],
                "content_type": x["content_type"],
                "source_file": x["source_file"],
                "similarity": x["similarity"]
            })

        # Production summary reporting block
        if final_pool:
            unique_sources = list(set(chunk["source_file"] for chunk in final_pool if chunk.get("source_file")))
            source_manual_str = ", ".join(unique_sources) if unique_sources else "unknown"
            
            print("============================================================")
            print("RETRIEVAL SUMMARY")
            print(f"Machine Filter : {machine_id if machine_id else 'None'}")
            print(f"Candidate Pool : {len(documents)}")
            print(f"Returned Chunks: {len(final_pool)}")
            print(f"Source Manual  : {source_manual_str}")
            print("============================================================")
        else:
            print("============================================================")
            print("RETRIEVAL SUMMARY")
            print(f"Machine Filter : {machine_id if machine_id else 'None'}")
            print("Returned Chunks: 0")
            print("Reason         : No matching manual content found.")
            print("============================================================")
            
        return final_pool