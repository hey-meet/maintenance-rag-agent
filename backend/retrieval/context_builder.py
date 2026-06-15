import json
import os

from sentence_transformers import SentenceTransformer
from query_gen import generate_query_from_alert
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage

load_dotenv()
from retrieval import Retriever

alert = {
    "machine_id": "PUMP-01",
    "error_code": "E-404",
    "temperature": 105,  # temperature in celsius
    "vibration": "high",
    "status": "critical",
    "error_description": "overheating thermal fault",
}


LLM_model = "mistral-small-2506"
TOP_K_RESULTS = 3


def load_llm():
    """
    Connect to Mistral AI via LangChain.
    Needs MISTRAL_API_KEY set in your .env file.
    """
    print(f"Connecting to Mistral AI (model: {LLM_model}) ...")

    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        print("  ERROR: MISTRAL_API_KEY not found in .env file.")
        print("  Add this line to .env :  MISTRAL_API_KEY=your_key_here")
        exit()

    llm = ChatMistralAI(
        model=LLM_model,
        api_key=api_key
    )

    print("  Connected!")
    return llm
