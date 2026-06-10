import os
from dotenv import load_dotenv

# Load environment configurations securely
load_dotenv()

LLAMA_PARSE_API_KEY = os.getenv("LLAMA_PARSE_API_KEY")

def initialize_parser():
    if not LLAMA_PARSE_API_KEY:
        print("Warning: LLAMA_PARSE_API_KEY is missing from environment variables.")
        return None
    print("LlamaParse pipeline successfully initialized for manual ingestion.")
    return True

if __name__ == "__main__":
    initialize_parser()