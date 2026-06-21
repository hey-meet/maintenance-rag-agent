"""
Week 3 LLM Service
"""
import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage

load_dotenv()

LLM_MODEL = "mistral-small-2506"

LLM_TEMPARATURE = 0.5

def load_llm():
    """Connects to Mistral AI and returns a ready-to-use connection object."""

    print("connecting LLM.....")

    api_key = os.getenv("MISTRAL_API_KEY")

    if not api_key:
        print("ERROR: MISTRAL_API_KEY not found in .env file")
        exit()

    llm= ChatMistralAI(
        model = LLM_MODEL,
        api_key= api_key,
        temperature= LLM_TEMPARATURE
    )

    print("connected..")

    return llm
