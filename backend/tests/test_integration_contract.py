import unittest
import json
from backend.models.telemetry_schema import TelemetryAlert

class TestTelemetryIntegrationContract(unittest.TestCase):

    def setUp(self):
        # Simulating a raw JSON string payload exactly as it travels over the network API
        self.raw_network_json = """
        {
            "alert_id": "ALT-NET-2026",
            "machine_id": "ROBOT-ARM-01",
            "error_code": "err_vibration_exceeded",
            "severity": "critical",
            "metrics": {"g_force": 4.2, "axis": "Z"}
        }
        """

    def test_network_json_parsing_integration(self):
        """Verify that raw JSON strings from network requests parse cleanly into our schema."""
        data_dict = json.loads(self.raw_network_json)
        alert = TelemetryAlert(**data_dict)
        
        # Verify our validators correctly cleaned and formatted the data
        self.assertEqual(alert.alert_id, "ALT-NET-2026")
        self.assertEqual(alert.machine_id, "ROBOT-ARM-01")  # Cleaned string
        self.assertEqual(alert.severity, "CRITICAL")       # Forced to uppercase


    def test_batch_stream_parsing(self):
        """Verify the validation layer processes lists of alerts successfully."""
        batch_payloads = [
            {"alert_id": "B-1", "machine_id": "PUMP-01", "error_code": "ERR_1", "severity": "INFO", "metrics": {}},
            {"alert_id": "B-2", "machine_id": "PUMP-02", "error_code": "ERR_2", "severity": "WARNING", "metrics": {}},
            {"alert_id": "B-3", "machine_id": "PUMP-03", "error_code": "ERR_3", "severity": "CRITICAL", "metrics": {}}
        ]
        
        parsed_alerts = [TelemetryAlert(**item) for item in batch_payloads]
        self.assertEqual(len(parsed_alerts), 3)
        self.assertEqual(parsed_alerts[2].severity, "CRITICAL")