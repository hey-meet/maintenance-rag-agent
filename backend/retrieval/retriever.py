import os
import json
import difflib
import chromadb
from sentence_transformers import SentenceTransformer

# --- Explicit Decoupled Path Configurations Architecture ---
CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(CURRENT_FILE_DIR)

CHROMA_PATH = os.path.join(BACKEND_ROOT, "chroma_store")
SETTINGS_PATH = os.path.join(BACKEND_ROOT, "config", "settings.json")

COLLECTION_NAME = "maintenance_manuals"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# IMPROVEMENT: near-duplicate suppression threshold for chunk_text comparison.
# Two chunks whose text similarity ratio (difflib) meets/exceeds this are
# treated as "nearly identical" and only the higher-ranked one is kept, so
# the final result set favors diverse, non-redundant context.
_NEAR_DUPLICATE_RATIO = 0.92


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
        Executes a GLOBAL semantic vector retrieval strategy over the entire
        vector database.

        Flow:
        Query -> Sentence Embedding -> ChromaDB Top-Candidate Retrieval
        (full collection, no pre-filtering) -> Similarity Calculation ->
        Graceful Threshold Handling -> Near-Duplicate Suppression ->
        Sort by Similarity Descending -> Return Top K Results

        NOTE ON `machine_id`: kept in the signature for backward
        compatibility with existing callers, but it is no longer used to
        restrict the search space. Restricting candidates by a metadata
        filter before similarity search assumes we already know which
        manual holds the answer — which defeats the purpose of semantic
        search and can hide the correct manual if the filter is wrong.
        The collection is always searched in full; the correct manual
        naturally ranks highest because it is the most semantically
        similar to the query.
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

        # IMPROVEMENT: pull a much larger candidate pool than before. With no
        # metadata pre-filtering, the reranking/diversity step below needs
        # enough raw candidates to both satisfy the similarity threshold and
        # skip near-duplicates without starving the final result set.
        search_pool = max(20, effective_top_k * 5)

        # IMPROVEMENT: `where` filter removed entirely. Every query now
        # searches the full collection — no machine_type/machine_id scoping
        # is ever applied before similarity search.
        query_kwargs = {
            "query_embeddings": [query_vector],
            "n_results": search_pool,
            "include": query_includes
        }

        results = self.collection.query(**query_kwargs)

        # Gracefully exit on empty result payloads or uninitialized vector indexes
        if not results or not results.get("documents") or not results["documents"][0]:
            print(f"[RETRIEVAL] 0 chunks returned — collection empty or no candidates found.")
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

            # Convert Cosine Distance to a bounded semantic similarity score.
            # IMPROVEMENT: unchanged math — similarity is never inflated or
            # otherwise manipulated, it stays a mathematically correct
            # 1 - cosine_distance value clipped at 0.
            similarity = max(0.0, 1.0 - distance)

            # Safely compile chunk context items with structural fallbacks for page numbers
            page_val = metadata.get("page_number", 0)
            try:
                page_number = int(page_val) if page_val is not None else 0
            except (ValueError, TypeError):
                page_number = 0

            candidates.append({
                "chunk_text": doc,
                "page_number": page_number,
                "content_type": metadata.get("content_type"),
                "source_file": metadata.get("source_file"),
                "similarity": similarity
            })

        # Rank entirely based on physical similarity metric (highest match first)
        candidates.sort(key=lambda x: x["similarity"], reverse=True)

        # IMPROVEMENT: near-duplicate suppression. Walk candidates in
        # similarity order and only keep a candidate if its chunk_text isn't
        # a near-duplicate of one already accepted. This favors diversity
        # among the returned chunks without touching the similarity math
        # itself, and naturally also removes exact duplicates (ratio == 1.0).
        def is_near_duplicate(candidate_text, accepted):
            for kept in accepted:
                ratio = difflib.SequenceMatcher(None, candidate_text, kept["chunk_text"]).ratio()
                if ratio >= _NEAR_DUPLICATE_RATIO:
                    return True
            return False

        deduped_candidates = []
        for candidate in candidates:
            if not is_near_duplicate(candidate["chunk_text"], deduped_candidates):
                deduped_candidates.append(candidate)

        # IMPROVEMENT: graceful threshold handling. Prefer chunks meeting the
        # configured similarity_score, but never hard-fail to an empty
        # result just because too few candidates cleared the bar — fall
        # back to the next-highest-ranked deduped candidates instead so the
        # caller always gets the most relevant context available.
        above_threshold = [c for c in deduped_candidates if c["similarity"] >= threshold_score]

        if len(above_threshold) >= effective_top_k:
            final_pool = above_threshold[:effective_top_k]
        else:
            # Top up with the next best deduped candidates (regardless of
            # threshold) without introducing duplicates already selected.
            final_pool = list(above_threshold)
            for candidate in deduped_candidates:
                if len(final_pool) >= effective_top_k:
                    break
                if candidate not in final_pool:
                    final_pool.append(candidate)

        # Concise production summary reporting block
        if final_pool:
            unique_sources = sorted(set(c["source_file"] for c in final_pool if c.get("source_file")))
            print(f"[RETRIEVAL] {len(final_pool)} chunks returned from {len(unique_sources)} source(s): {', '.join(unique_sources)}")
        else:
            print("[RETRIEVAL] 0 chunks returned — no matching manual content found.")

        return final_pool