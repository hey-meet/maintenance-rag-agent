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

if __name__ == "__main__":
    unittest.main()