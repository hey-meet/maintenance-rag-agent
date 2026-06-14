import json
import os

from sentence_transformers import SentenceTransformer
from query_gen import generate_query_from_alert

from retrieval import Retriever

alert = {
    "machine_id": "PUMP-01",
    "error_code": "E-404",
    "temperature": 105,  # temperature in celsius
    "vibration": "high",
    "status": "critical",
    "error_description": "overheating thermal fault",
}


LLM_model = "google/flan-t5-base"
TOP_K_RESULTS = 3


def load_llm():
    print("loading LLM model.....")

    from transformers import pipeline

    llm = pipeline(
        "text2text-generation",
        model=LLM_model,
        max_new_tokens=300,
    )

    print("llm ready!..")
    return llm


