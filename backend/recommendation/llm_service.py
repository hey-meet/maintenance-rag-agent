"""
Week 3 LLM Service
"""
import os
import traceback
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage

load_dotenv()

# Constants
LLM_MODEL = "mistral-small-2506"
LLM_TEMPERATURE = 0.3
MAX_RESPONSE_LENGTH = 10000

def load_llm():
    """Connects to Mistral AI and returns a ready-to-use connection object."""

    print("Connecting to Mistral AI...")

    api_key = os.getenv("MISTRAL_API_KEY")

    if not api_key:
        raise ValueError(
            "MISTRAL_API_KEY not found in environment variables."
        )

    llm = ChatMistralAI(
        model=LLM_MODEL,
        api_key=api_key,
        temperature=LLM_TEMPERATURE,
        max_retries=2
    )

    print("LLM connection established.")

    return llm

def call_llm(prompt, llm):
    """
    Send prompt to the LLM and return plain text output.
    """
    try:
        message = HumanMessage(content=prompt)

        response = llm.invoke([message])

        answer_text = response.content

        if not answer_text:
            return "No response generated."

        if isinstance(answer_text, list):
            answer_text = " ".join(
                str(item) for item in answer_text
            )

        answer_text = str(answer_text).strip()

        return answer_text[:MAX_RESPONSE_LENGTH]

    except Exception as e:
        print(f"LLM Error: {e}")
        traceback.print_exc()

        return """
Likely Cause:
Not specified in available manual data

Repair Steps:
Not specified in available manual data

Safety Precautions:
Not specified in available manual data

Tools Required:
Not specified in available manual data

Spare Parts Required:
Not specified in available manual data
"""

def test_connection():
    """Validates the health and responsiveness of the LLM connection."""
    llm = load_llm()
    response = call_llm(
        "What is preventive maintenance?",
        llm
    )
    print(response)

def main():
    print("=" * 50)

    llm = load_llm()
    
    test_prompt = "in one sentence, what is preventive maintenance?"

    print(f"\nSending test prompt: \"{test_prompt}\"")

    answer = call_llm(test_prompt, llm)

    print(f"\nLLM response:\n  {answer}")
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()