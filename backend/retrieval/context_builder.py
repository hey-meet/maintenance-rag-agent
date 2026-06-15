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

# STEP 2: define Context_builder

def context_build (llm, alert, matched_chuncks):
    print()
    
    context_parts = []
    for i,chunk in enumerate(matched_chuncks):
        context_parts.append( 
            f"[Manual excerpt {i+1} — Page {chunk['page_number']}]\n{chunk['chunk_text']}")
        
    context = "\n\n".join(context_parts)

    # ------------ Build Prompt-----------------

    prompt = f""" ou are a maintenance assistant for industrial machinery.
 
A machine has sent the following alert:
- Machine ID  : {alert.get('machine_id', 'Unknown')}
- Error Code  : {alert.get('error_code', 'Unknown')}
- Temperature : {alert.get('temp', 'Unknown')} °C
- Vibration   : {alert.get('vibration', 'Unknown')}
- Status      : {alert.get('status', 'Unknown')}
 
Based on the following excerpts from the maintenance manual:
 
{context}
 
Provide a short step-by-step maintenance recommendation to fix this issue."""

    response = llm.invoke([HumanMessage(content=prompt)])

    recommendation = response.content
    print(f"{recommendation.strip()}")

    return recommendation       
