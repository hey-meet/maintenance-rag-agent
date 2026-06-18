import unittest
from backend.models.telemetry_schema import TelemetryAlert

def mock_query_generator(alert: TelemetryAlert) -> str:
    return f"LOG_LOOKUP: {alert.machine_id} STATUS: {alert.error_code}"

class TestTelemetryPipelineFlow(unittest.TestCase):
    def test_telemetry_to_retrieval_contract_flow(self):
        payload = {"machine_id": "milling-v01", "error_code": "err_axis_lock", "temp": 142.8}
        alert = TelemetryAlert(**payload)
        self.assertEqual(alert.machine_id, "MILLING-V01")

if __name__ == "__main__":
    unittest.main()