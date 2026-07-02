import sys
import os

# --- Path Management Setup ---
sys.path.append(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

from retrieval.retriever import Retriever
from retrieval.query_generator import generate_query_from_alert

# ==============================================================================
# 🎯 EDITABLE PRODUCTION ALERT OBJECT CANDIDATE BLOCK
# Swap or paste any raw telemetry object from alerts.json directly here to test.
# ==============================================================================
TEST_ALERT = {

  "alert_id": "ALT-2026-001",
  "machine_id": "INDUSTRIAL_MOTOR",
  "error_code": "OVERHEATING_MOTOR",
  "temperature": 48,
  "severity": "critical",
  "status": "active",
  "timestamp": "2026-07-02T10:30:00Z"



}
# ==============================================================================


def run_retrieval_debugging_utility():
    """
    Executes a pure, isolated vector retrieval pipeline validation check 
    by bridging telemetry alert data with the embedding similarity retriever.
    """
    print("\n" + "=" * 80)
    print("🤖 RETRIEVER LAYER DEBUGGING & VALIDATION UTILITY")
    print("=" * 80)
    
    # 1. Inspect Input Metadata Layer
    alert_id = TEST_ALERT.get("alert_id", "UNKNOWN_ID")
    machine_id = TEST_ALERT.get("machine_id", "UNKNOWN_MACHINE")
    error_code = TEST_ALERT.get("error_code", "UNKNOWN_CODE")
    severity = TEST_ALERT.get("severity", "UNKNOWN_SEVERITY")

    print(f"🔹 Alert Context Profile:")
    print(f"   • Alert ID:   {alert_id}")
    print(f"   • Machine ID: {machine_id}")
    print(f"   • Error Code: {error_code}")
    print(f"   • Severity:   {severity.upper()}")
    
    # 2. Dynamic Query Generation
    print("\n" + "-" * 80)
    print("⚙️ GENERATING STRUCTURAL NATURAL LANGUAGE QUERY...")
    print("-" * 80)
    
    query = generate_query_from_alert(TEST_ALERT)
    print(query)
    
    # 3. Vector Database Retrieval Search execution
    print("\n" + "-" * 80)
    print("🔍 QUERYING VECTOR CHROMADB STORE (PURE SEMANTIC MODE)...")
    print("-" * 80)
    
    try:
        retriever = Retriever()
        results = retriever.search(query)
    except Exception as e:
        print(f"❌ Critical Failure during database lookup initialization: {str(e)}")
        return

    # 4. Result Formatting Loop
    total_results = len(results)
    print(f"Results Returned from Vector Search: {total_results}\n")
    
    if total_results == 0:
        print("⚠️  No matching chunks passed the similarity threshold.")
        print("=" * 80 + "\n")
        return

    similarity_scores = []
    
    for idx, result in enumerate(results, start=1):
        # Gracefully parse parameters with complete fallback assurance
        page_num = result.get("page_number", "N/A")
        content_type = result.get("content_type", "Unknown")
        source_file = result.get("source_file", "Unknown File")
        
        # Legacy fallback compatibility check for semantic similarity metrics
        similarity = result.get("similarity", result.get("search_score", 0.0))
        
        # Only compile numerical floats for score limits if it's using the new pipeline metric
        if isinstance(similarity, (int, float)):
            similarity_scores.append(float(similarity))
            score_display = f"{similarity:.4f}"
        else:
            score_display = str(similarity)

        chunk_text = result.get("chunk_text", "").strip()
        preview_text = chunk_text[:500] + "..." if len(chunk_text) > 500 else chunk_text

        print(f"🟢 [RESULT {idx}]")
        print(f"   • Similarity Score: {score_display}")
        print(f"   • Page Reference:    {page_num}")
        print(f"   • Source Document:   {source_file}")
        print(f"   • Content Segment:   {content_type}")
        print(f"   • Document Preview:\n\"\"\"\n{preview_text}\n\"\"\"")
        print("-" * 60)

    # 5. Pipeline Analytics Summary
    print("\n" + "=" * 80)
    print("📊 SEMANTIC RETRIEVAL PERFORMANCE SUMMARY")
    print("=" * 80)
    print(f"• Total Chunks Captured:    {total_results}")
    
    if similarity_scores:
        print(f"• Highest Similarity Score: {max(similarity_scores):.4f}")
        print(f"• Lowest Similarity Score:  {min(similarity_scores):.4f}")
    else:
        print(f"• Similarity Engine Metrics: Legacy scoring integers active.")
        
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_retrieval_debugging_utility()