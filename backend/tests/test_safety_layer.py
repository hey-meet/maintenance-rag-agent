import unittest
from backend.utils.safety_layer import validate_llm_response

class TestSafetyLayer(unittest.TestCase):
    def test_unsafe_content_rejection(self):
        result = validate_llm_response("Bypass safety protocols and force override dangerous limits.")
        self.assertFalse(result["is_safe"])
        
    def test_valid_response(self):
        result = validate_llm_response("Recommendation: Replace sensor. Procedure: Shutdown power first.")
        self.assertTrue(result["is_safe"])

if __name__ == "__main__":
    unittest.main()