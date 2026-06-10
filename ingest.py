import os
from src.utils.validator import check_environment, validate_rag_metadata

class SimpleDocumentParser:
    """
    Handles basic document parsing simulation and directly links 
    to the validation safety gate before embedding storage.
    """
    def __init__(self):
        # Step 1: Align API key verification on initialization
        self.api_key = check_environment()

    def parse_document(self, file_name: str) -> list:
        """
        Simulates parsing a complex manual into chunked dictionaries with metadata tags.
        """
        print(f"Parsing document: {file_name} using LLAMA_CLOUD configuration...")
        
        # Mocking structured chunks extracted from a document parser workflow
        parsed_chunks = [
            {"text": "Execute engine flush every 5000 hours.", "metadata": {"source": file_name, "page": 1}},
            {"text": "Replace primary pump valve if pressure drops.", "metadata": {"source": file_name, "page": 2}},
            {"text": "Appendix B: Hardware spec values.", "metadata": {"source": file_name}} # Missing page intentionally for safety test
        ]
        return parsed_chunks

    def run_ingestion_pipeline(self, file_path: str):
        """
        Executes ingestion and validates data integrity before passing to embeddings.
        """
        # 1. Parse documents
        chunks = self.parse_document(os.path.basename(file_path))
        
        # 2. Run verification (The integration point requested by your lead)
        audit_result = validate_rag_metadata(chunks)
        
        print("\n--- Ingestion Audit Verification Report ---")
        print(f"Total Chunks Parsed: {audit_result['total_checked']}")
        print(f"Passed Integrity Check: {audit_result['valid_count']}")
        
        if not audit_result["is_valid"]:
            print(f"WARNING: Pipeline captured {len(audit_result['failures'])} chunks missing critical metadata tags!")
            print(f"Failures detailed map: {audit_result['failures']}")
        else:
            print("SUCCESS: All chunks match the required data architecture rules.")
            
        return chunks

# Execution gate block for manual terminal testing
if __name__ == "__main__":
    # Temporarily setting the requested environment variable for testing verification
    os.environ["LLAMA_CLOUD_API_KEY"] = "mock_llama_cloud_key_12345"
    
    parser_runner = SimpleDocumentParser()
    parser_runner.run_ingestion_pipeline("manual_pump_instructions.pdf")