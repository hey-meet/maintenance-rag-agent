import unittest
from datetime import datetime
# Updated import to match the new team project layout
from backend.models.telemetry_schema import TelemetryAlert

class TestTelemetryValidation(unittest.TestCase):

    def setUp(self):
        self.valid_payload = {
            "alert_id": "ALT-1234",
            "machine_id": "PUMP-02",
            "error_code": "ERR_PRESSURE_HIGH",
            "severity": "WARNING",
            "metrics": {"psi": 120.5}
        }

    def test_valid_payload_parsing(self):
        alert = TelemetryAlert(**self.valid_payload)
        self.assertEqual(alert.alert_id, "ALT-1234")
        self.assertEqual(alert.severity, "WARNING")

    def test_invalid_severity_raises_error(self):
        bad_payload = self.valid_payload.copy()
        bad_payload["severity"] = "INVALID_STATUS"
        with self.assertRaises(ValueError):
            TelemetryAlert(**bad_payload)


    def test_empty_metrics_dictionary(self):
        """Edge Case: Ensure the validator handles empty metrics dictionary gracefully."""
        payload = self.valid_payload.copy()
        payload["metrics"] = {}
        alert = TelemetryAlert(**payload)
        self.assertEqual(alert.metrics, {})

    def test_extreme_sensor_values(self):
        """Edge Case: Ensure parser handles massive float values from malfunctioning sensors."""
        payload = self.valid_payload.copy()
        payload["metrics"] = {"temperature": 1.79e308, "vibration_index": -99999.99}
        alert = TelemetryAlert(**payload)
        self.assertEqual(alert.metrics["temperature"], 1.79e308)

    def test_blank_spaces_validation_error(self):
        """Edge Case: Ensure fields with only blank spaces trigger validation errors."""
        bad_payload = self.valid_payload.copy()
        bad_payload["machine_id"] = "   "
        with self.assertRaises(ValueError):
            TelemetryAlert(**bad_payload)

    def test_corrupted_error_code_spaces(self):
        """Edge Case: Verify that trailing spaces in error codes are stripped perfectly."""
        dirty_payload = self.valid_payload.copy()
        dirty_payload["error_code"] = "  err_leak_04  "
        alert = TelemetryAlert(**dirty_payload)
        self.assertEqual(alert.error_code, "ERR_LEAK_04")
    

if __name__ == "__main__":
    import unittest
    print("🚀 Running Week 2 Day 3 Validation Verification Suite...")
    unittest.main()