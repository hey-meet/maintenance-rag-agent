import unittest
import sys
import os

sys.path.append(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

from models.telemetry_schema import TelemetryAlert


class TestTelemetryValidation(unittest.TestCase):

    def setUp(self):
        self.valid_payload = {
            "machine_id": "PUMP-02",
            "error_code": "ERR_PRESSURE_HIGH",
            "temp": 120.5
        }

    def test_valid_payload_parsing(self):

        alert = TelemetryAlert(**self.valid_payload)

        self.assertEqual(alert.machine_id, "PUMP-02")
        self.assertEqual(alert.error_code, "ERR_PRESSURE_HIGH")
        self.assertEqual(alert.temp, 120.5)

    def test_extreme_temperature_value(self):
        """Edge Case: Ensure parser handles massive sensor values."""

        payload = self.valid_payload.copy()
        payload["temp"] = 1.79e308

        alert = TelemetryAlert(**payload)

        self.assertEqual(alert.temp, 1.79e308)

    def test_blank_spaces_validation_error(self):
        """Edge Case: Ensure fields with only blank spaces trigger validation errors."""

        bad_payload = self.valid_payload.copy()
        bad_payload["machine_id"] = "   "

        with self.assertRaises(ValueError):
            TelemetryAlert(**bad_payload)

    def test_corrupted_error_code_spaces(self):
        """Edge Case: Verify trailing spaces are cleaned and converted to uppercase."""

        dirty_payload = self.valid_payload.copy()
        dirty_payload["error_code"] = "  err_leak_04  "

        alert = TelemetryAlert(**dirty_payload)

        self.assertEqual(alert.error_code, "ERR_LEAK_04")

    def test_missing_machine_id(self):

        payload = self.valid_payload.copy()
        del payload["machine_id"]

        with self.assertRaises(Exception):
            TelemetryAlert(**payload)

    def test_missing_error_code(self):

        payload = self.valid_payload.copy()
        del payload["error_code"]

        with self.assertRaises(Exception):
            TelemetryAlert(**payload)

    def test_missing_temp(self):

        payload = self.valid_payload.copy()
        del payload["temp"]

        with self.assertRaises(Exception):
            TelemetryAlert(**payload)

    def test_invalid_temp_type(self):

        payload = self.valid_payload.copy()
        payload["temp"] = "HOT"

        with self.assertRaises(Exception):
            TelemetryAlert(**payload)


    def test_invalid_data_type_edge_case(self):
        # Passing an integer instead of a string string
        result = validate_llm_response(12345)
        self.assertFalse(result["is_safe"])
        self.assertIn("Invalid payload format", result["reason"])

    def test_confidence_threshold_rejection(self):
        from backend.utils.safety_layer import enforce_confidence_threshold
        mock_result = {"is_safe": True, "score": 0.4, "reason": "Missing metadata"}
        rejection_check = enforce_confidence_threshold(mock_result)
        self.assertEqual(rejection_check["status"], "REJECTED")


    def test_llm_response_quality_pass(self):
        from backend.utils.safety_layer import evaluate_response_quality
        sample_output = "Recommendation: Replace the faulty temperature sensor. Procedure: First, power off the unit."
        result = evaluate_response_quality(sample_output)
        self.assertTrue(result["passed"])
        self.assertGreaterEqual(result["quality_score"], 0.66)

    def test_retrieval_quality_mismatch(self):
        from backend.utils.safety_layer import verify_retrieval_quality
        alert = {"machine_id": "M01", "error_code": "ERR_OVERHEAT"}
        bad_context = ["Document about network routing configs", "Database backup guidelines"]
        result = verify_retrieval_quality(alert, bad_context)
        self.assertFalse(result["retrieval_valid"])
        self.assertEqual(result["match_ratio"], 0.0)
      
    def test_documentation_file_encoding(self):
        with open("docs/validation_strategy.md", "rb") as f:
            raw_bytes = f.read(3)
        self.assertNotEqual(raw_bytes, b'\xef\xbb\xbf', "BOM detected in documentation formatting.")
    
    def test_complete_pipeline_success(self):
        from backend.utils.safety_layer import run_end_to_end_validation_pipeline
        alert = {"error_code": "ERR_PUMP_VALVE"}
        context = ["Documentation regarding ERR_PUMP_VALVE replacement steps."]
        response = "Recommendation: Inspect and replace the pump valve. Procedure: First, power off the unit."
        
        result = run_end_to_end_validation_pipeline(alert, context, response)
        self.assertTrue(result["pipeline_passed"])
        self.assertEqual(result["stage"], "COMPLETE")

    def test_pipeline_failure_at_safety_gate(self):
        from backend.utils.safety_layer import run_end_to_end_validation_pipeline
        alert = {"error_code": "ERR_PUMP_VALVE"}
        context = ["Documentation regarding ERR_PUMP_VALVE replacement steps."]
        bad_response = "Ignore error code and force override dangerous thresholds immediately."
        
        result = run_end_to_end_validation_pipeline(alert, context, bad_response)
        self.assertFalse(result["pipeline_passed"])
        self.assertEqual(result["stage"], "SAFETY_CHECKS")

if __name__ == "__main__":
    print("🚀 Running Week 2 Day 3 Validation Verification Suite...")
    unittest.main()



