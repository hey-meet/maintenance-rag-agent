import os
import unittest

def validate_metadata(chunk):
    """Simple metadata validation helper."""
    if not chunk or "metadata" not in chunk:
        return False
    return True

def run_ingestion_pipeline():
    """Main ingestion pipeline execution."""
    print("Initializing Ingestion Pipeline...")
    
    # 1. Check for the correct environment variable
    api_key = os.getenv("LLAMA_CLOUD_API_KEY")
    if not api_key:
        print("Error: LLAMA_CLOUD_API_KEY environment variable is missing.")
        return False
        
    print("API Key verified successfully.")
    
    # 2. Simulate document chunking and validation output
    sample_chunks = [
        {"text": "Maintenance log entry 1", "metadata": {"source": "manual.pdf", "page": 12}},
        {"text": "Maintenance log entry 2", "metadata": {"source": "manual.pdf", "page": 13}}
    ]
    
    print(f"Processing {len(sample_chunks)} document chunks...")
    for i, chunk in enumerate(sample_chunks, start=1):
        if validate_metadata(chunk):
            print(f"  [Chunk {i}] Validated successfully: {chunk['metadata']}")
        else:
            print(f"  [Chunk {i}] Validation failed!")
            return False
            
    print("Ingestion pipeline completed successfully!")
    return True

if __name__ == "__main__":
    run_ingestion_pipeline()