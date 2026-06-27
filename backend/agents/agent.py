from retrieval.query_generator import generate_query_from_alert
from retrieval.retriever import Retriever
from retrieval.context_builder import build_context
from utils.department_mapper import get_department
from recommendation.recommendation_engine import (
    generate_recommendation
)


class MaintenanceAgent:

    def __init__(self):

        self.retriever = Retriever()

    def process_alert(self, alert):

        # -----------------------------
        # STEP 1: Generate Query
        # -----------------------------
        query = generate_query_from_alert(alert)

        # -----------------------------
        # STEP 2: Retrieve Documents
        # -----------------------------
        retrieved_chunks = self.retriever.search(
            query=query,
            n_results=3
        )

        # -----------------------------
        # STEP 3: Build Context
        # -----------------------------
        context = build_context(
            alert,
            retrieved_chunks
        )

        # Preserve telemetry values
        context["temperature"] = alert.get("temperature")
        context["timestamp"] = alert.get("timestamp")
        context["department"] = get_department(alert)
        # -----------------------------
        # STEP 4: Generate Recommendation
        # -----------------------------
        recommendation = generate_recommendation(
            context
        )

        return recommendation


# Singleton Agent Instance
maintenance_agent = MaintenanceAgent()