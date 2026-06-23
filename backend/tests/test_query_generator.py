from backend.retrieval.query_generator import generate_query_from_alert


TEST_ALERTS = [
    {
        "alert_id": "ALT-2026-001",
        "machine_id": "PUMP-CHW-042",
        "error_code": "ERR_PUMP_CAVITATION_01",
        "temperature": 74.3,
        "severity": "critical",
        "status": "active",
        "timestamp": "2026-06-22T00:10:15Z"
    },
    {
        "alert_id": "ALT-2026-003",
        "machine_id": "COMP-AIR-008",
        "error_code": "ERR_COMP_DISCHARGE_TEMP_HIGH",
        "temperature": 108.7,
        "severity": "critical",
        "status": "active",
        "timestamp": "2026-06-22T00:15:22Z"
    },
    {
        "alert_id": "ALT-2026-005",
        "machine_id": "FURN-HEAT-02",
        "error_code": "ERR_FURN_THERMOCOUPLE_DRIFT",
        "temperature": 1145.2,
        "severity": "warning",
        "status": "resolved",
        "timestamp": "2026-06-21T23:45:00Z"
    }
]


def print_query(alert, query):

    print("\n" + "=" * 70)

    print(f"Alert ID     : {alert['alert_id']}")
    print(f"Machine ID   : {alert['machine_id']}")
    print(f"Error Code   : {alert['error_code']}")
    print(f"Temperature  : {alert['temperature']}")
    print(f"Severity     : {alert['severity']}")
    print(f"Status       : {alert['status']}")

    print("\nGenerated Query:\n")
    print(query)

    print("=" * 70)


def main():

    print("\nTesting Query Generator\n")

    for alert in TEST_ALERTS:

        query = generate_query_from_alert(alert)

        print_query(alert, query)

    print("\nAll test alerts processed successfully.\n")


if __name__ == "__main__":
    main()