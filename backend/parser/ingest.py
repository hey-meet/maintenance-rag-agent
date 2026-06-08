# import necessary libraries
from dotenv import load_dotenv
import os
import json
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import *

# Load environment variables from .env file
load_dotenv()

# =====================================================
# FIX:
# Removed incorrect indentation that was causing:
# IndentationError: unexpected indent
# =====================================================

# STEP 1: Load the API KEY from .env file

API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

if not API_KEY:
    print("Error: LLAMA_CLOUD_API_KEY not found in .env file.")
else:
    print("API Key loaded successfully.")


# STEP 2: Parse the PDF using LlamaParse

def parse_pdf_with_llamaparse(pdf_path):
    print(f"Reading PDF from {pdf_path}")
    print("This might take some time, please wait...")

    parser = LlamaParse(
        api_key=API_KEY,
        result_type="markdown",
        parsing_instruction=(
            "This is an industrial machinery maintenance manual. "
            "Please keep all tables intact in markdown format. "
            "Keep all numbered steps and warning sections. "
            "Extract the text and image content from the PDF and format it in markdown. "
            "Include headings, subheadings, and bullet points where appropriate."
        )
    )

    # Use LlamaParse for PDF files
    file_extractor = {
        ".pdf": parser
    }

    # Connect PDF file with LlamaParse
    reader = SimpleDirectoryReader(
        input_files=[pdf_path],
        file_extractor=file_extractor
    )

    pages = reader.load_data()

    print(f"PDF parsing completed. Extracted {len(pages)} pages.")

    return pages


# STEP 3: Extract text from parsed pages

def extract_text_from_pages(pages):

    print("Extracting text from pages...")

    all_page_data = []

    for i, page in enumerate(pages):

        page_text = page.text.strip()

        if not page_text:
            print(f"Warning: Page {i + 1} is empty.")
            continue

        page_number = page.metadata.get("page_number", i + 1)

        if page_text.count("|") >= 10:
            content_type = "table"
        else:
            content_type = "text"

        page_info = {
            "page_number": page_number,
            "content_type": content_type,
            "text": page_text,
            "page_metadata": page.metadata,
            "char_count": len(page_text)
        }

        all_page_data.append(page_info)

        print(
            f"Extracted text from page {page_number} | "
            f"chars: {len(page_text)} | "
            f"type: {content_type}"
        )

    print(
        f"Text extraction completed. "
        f"Extracted text from {len(all_page_data)} pages."
    )

    return all_page_data