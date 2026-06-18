import sys
import os

sys.path.append(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)
from api.telemetry import receive_alert


def test_valid_payload():

    payload = {
        "machine_id": "PUMP-01",
        "error_code": "E-404",
        "temp": 105
    }

    response = receive_alert(payload)

    assert response["status"] == "success"
    print("✓ Valid payload test passed")


def test_missing_machine_id():

    payload = {
        "error_code": "E-404",
        "temp": 105
    }

    response = receive_alert(payload)

    assert response["status"] == "error"
    print("✓ Missing machine_id test passed")


def test_missing_error_code():

    payload = {
        "machine_id": "PUMP-01",
        "temp": 105
    }

    response = receive_alert(payload)

    assert response["status"] == "error"
    print("✓ Missing error_code test passed")


def test_missing_temp():

    payload = {
        "machine_id": "PUMP-01",
        "error_code": "E-404"
    }

    response = receive_alert(payload)

    assert response["status"] == "error"
    print("✓ Missing temp test passed")


def test_invalid_temp():

    payload = {
        "machine_id": "PUMP-01",
        "error_code": "E-404",
        "temp": "HOT"
    }

    response = receive_alert(payload)

    assert response["status"] == "error"
    print("✓ Invalid temp test passed")


if __name__ == "__main__":

    test_valid_payload()
    test_missing_machine_id()
    test_missing_error_code()
    test_missing_temp()
    test_invalid_temp()

    print("\nAll telemetry validation tests passed.")