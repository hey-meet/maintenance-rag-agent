import unittest
from backend.models.telemetry_schema import TelemetryAlert

def mock_query_generator(alert: TelemetryAlert) -> str:
    """Simulates converting a validated alert into a ChromaDB retrieval query string."""
    return f"LOG_LOOKUP: {alert.machine_id} STATUS: {alert.error_code} MAX_TEMP: {alert.temp}"

class TestTelemetryPipelineFlow(unittest.TestCase):
    
    def test_telemetry_to_retrieval_contract_flow(self):
        """Verify telemetry data transitions properly into the retrieval pipeline."""
        payload = {
            "machine_id": "milling-v01",
            "error_code": "err_axis_lock",
            "temp": 142.8
        }
        
        # 1. Parse and validate data contract
        alert = TelemetryAlert(**payload)
        
        # 2. Assert data feeds successfully into the retrieval layer mock
        query_string = mock_query_generator(alert)
        self.assertEqual(alert.machine_id, "MILLING-V01")
        self.assertIn("ERR_AXIS_LOCK", query_string)

if __name__ == "__main__":
    unittest.main()