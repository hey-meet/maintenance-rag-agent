import pytest
from src.utils.validator import validate_rag_metadata

# Mock class to simulate LangChain/ChromaDB document objects
class MockDocument:
    def __init__(self, metadata):
        self.metadata = metadata

def test_successful_metadata_validation():
    # Simulate correct RAG output with source and page
    mock_docs = [
        MockDocument({"source": "machinery_manual_v2.pdf", "page": 14}),
        MockDocument({"source": "machinery_manual_v2.pdf", "page": 15})
    ]
    
    result = validate_rag_metadata(mock_docs)
    assert result["is_valid"] is True
    assert result["valid_count"] == 2

def test_failed_metadata_validation():
    # Simulate a failed RAG output missing a page reference
    broken_docs = [
        MockDocument({"source": "machinery_manual_v2.pdf", "page": 14}),
        MockDocument({"source": "pump_specs.pdf"})  # Missing page
    ]
    
    result = validate_rag_metadata(broken_docs)
    assert result["is_valid"] is False
    assert len(result["failures"]) == 1