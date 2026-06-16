import sys
import os

sys.path.append(
    os.path.dirname(
        os.path.dirname(__file__)
    )
)

from retrieval.retriever import Retriever
from retrieval.query_generator import generate_query_from_alert


def test_retrieval():

    retriever = Retriever()

    queries = [
        "motor overheating",
        "power supply fault",
        "alarm troubleshooting"
    ]

    for query in queries:

        print("\n" + "=" * 80)
        print("QUERY:", query)

        results = retriever.search(query)

        print(f"Results Found: {len(results)}")

        for i, result in enumerate(results, start=1):

            print(f"\nResult {i}")
            print(f"Page: {result['page_number']}")
            print(f"Type: {result['content_type']}")
            print(f"Source: {result['source_file']}")

            preview = result["chunk_text"][:200]
            print(f"Text: {preview}...")


def test_telemetry_query():

    retriever = Retriever()

    alert = {
        "machine_id": "PUMP-01",
        "error_code": "E-404",
        "temperature": 105
    }

    query = generate_query_from_alert(alert)

    print("\n" + "=" * 80)
    print("GENERATED QUERY:")
    print(query)

    results = retriever.search(query)

    print(f"\nResults Found: {len(results)}")

    for i, result in enumerate(results, start=1):

        print(f"\nResult {i}")
        print(f"Page: {result['page_number']}")
        print(f"Type: {result['content_type']}")


if __name__ == "__main__":
    test_retrieval()
    test_telemetry_query()