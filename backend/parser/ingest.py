# import necessary libraries
from dotenv import load_dotenv
import os
import json
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import*

# Load environment variables from .env file
load_dotenv()

#STEP 1: Load the API KEY from .env file
API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")
if not API_KEY:
    print("Error: LLAMA_CLOUD_API_KEY not found in .env file.")
else:
    print("API Key loaded successfully.")   


# STEP 2: Parse the PDF using LlamaParse
    def parse_pdf_with_llamaparse(pdf_path):
        print(f"reading pdf from {pdf_path}")