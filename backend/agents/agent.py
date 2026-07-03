from retrieval.query_generator import generate_query_from_alert
from retrieval.retriever import Retriever
from retrieval.context_builder import build_context
from utils.department_mapper import get_department
from recommendation.recommendation_engine import (
    generate_recommendation
)
import json


class MaintenanceAgent:

    def __init__(self):
        self.retriever = Retriever()

    def process_alert(self, alert):

        print("\n" + "=" * 80)
        print("STEP 0 : RAW ALERT RECEIVED")
        print("=" * 80)
        print(json.dumps(alert, indent=2))

        # -----------------------------
        # STEP 1: Generate Query
        # -----------------------------
        query = generate_query_from_alert(alert)

        print("\n" + "=" * 80)
        print("STEP 1 : GENERATED QUERY")
        print("=" * 80)
        print(query)

        # -----------------------------
        # STEP 2: Retrieve Documents
        # -----------------------------
        retrieved_chunks = self.retriever.search(
            query=query,
            n_results=3
        )

        print("\n" + "=" * 80)
        print("STEP 2 : RETRIEVED CHUNKS")
        print("=" * 80)
        print(f"Total Chunks : {len(retrieved_chunks)}")

        for i, chunk in enumerate(retrieved_chunks, start=1):
            print(f"\nChunk {i}")
            print(f"Source      : {chunk.get('source_file')}")
            print(f"Page        : {chunk.get('page_number')}")
            print(f"Similarity  : {chunk.get('similarity')}")
            print(f"Preview     : {chunk.get('chunk_text','')[:250]}")

        # -----------------------------
        # STEP 3: Build Context
        # -----------------------------
        context = build_context(
            alert,
            retrieved_chunks
        )

        print("\n" + "=" * 80)
        print("STEP 3 : CONTEXT AFTER BUILD_CONTEXT")
        print("=" * 80)
        print(json.dumps(context, indent=2, default=str))

        # -----------------------------
        # Preserve Original Telemetry Values
        # -----------------------------
        context["alert_id"] = alert.get("alert_id", context.get("alert_id"))
        context["machine_id"] = alert.get("machine_id", context.get("machine_id"))
        context["error_code"] = alert.get("error_code", context.get("error_code"))
        context["severity"] = alert.get("severity", context.get("severity"))
        context["temperature"] = alert.get("temperature", context.get("temperature"))
        context["timestamp"] = alert.get("timestamp", context.get("timestamp"))
        context["status"] = alert.get("status", context.get("status"))
        context["department"] = get_department(alert)

        print("\n" + "=" * 80)
        print("STEP 4 : CONTEXT AFTER TELEMETRY MERGE")
        print("=" * 80)

        important_fields = [
            "alert_id",
            "machine_id",
            "component",
            "issue",
            "error_code",
            "severity",
            "temperature",
            "timestamp",
            "status",
            "department"
        ]

        for field in important_fields:
            print(f"{field:15} : {context.get(field)}")

        print("\nComplete Context")
        print(json.dumps(context, indent=2, default=str))

        # -----------------------------
        # STEP 4: Generate Recommendation
        # -----------------------------
        recommendation = generate_recommendation(context)

        print("\n" + "=" * 80)
        print("STEP 5 : FINAL RECOMMENDATION")
        print("=" * 80)
        print(json.dumps(recommendation, indent=2, default=str))

        print("\nImportant Recommendation Fields")

        fields = [
            "work_order_id",
            "alert_id",
            "machine_id",
            "component",
            "error_code",
            "assigned_department",
            "status"
        ]

        for field in fields:
            print(f"{field:22} : {recommendation.get(field)}")

        print("=" * 80 + "\n")

        return recommendation


# Singleton Agent Instance
maintenance_agent = MaintenanceAgent()