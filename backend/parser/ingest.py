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
    exit()


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

 # STEP 4: Split text into chunks using RecursiveCharacterTextSplitter

def split_text_into_chunks(all_page_data): 

        print("splitting text into chunks...") 
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap= CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", "",".",","]
        )

        all_chunks = []
        chunk_number = 0 
        for page in all_page_data:
            chunks_from_this_page = text_splitter.split_text(page["text"])
            for i,chunk_text in enumerate(chunks_from_this_page):
                  chunk_text = chunk_text.strip()
                  if not chunk_text:
                      continue
                  
                  chunk_id = f"page{page['page_number']}_chunk{i}"

                  chunk_info = {
                    "chunk_id": chunk_id,
                    "chunk_number": chunk_number,
                    "page_number": page["page_number"],
                    "content_type": page["content_type"],
                    "chunk_index_on_page": i,          
                    "total_chunks_on_page": len(chunks_from_this_page),
                    "chunk_text": chunk_text,
                    "chunk_char_count": len(chunk_text)
                }
                  all_chunks.append(chunk_info)
                  chunk_number += 1

        print(f"Text splitting completed. Created {len(all_chunks)} chunks from {len(all_page_data)} pages.")

        return all_chunks
    
# STEP 5: Save the chunks to a JSON file

def save_chunks_to_json(all_chunks, source_pdf_name):
        print("Saving chunks to JSON file...")
        
        if not os.path.exists(OUTPUT_FOLDER):
            os.makedirs(OUTPUT_FOLDER)
            print(f"Created output folder at: {OUTPUT_FOLDER}/")

        output_path = os.path.join(OUTPUT_FOLDER, OUTPUT_FILE)

        output_data = {
                "source_pdf": source_pdf_name,
                "total_chunks": len(all_chunks),
                "chunk_size_used": CHUNK_SIZE,
                "chunk_overlap": CHUNK_OVERLAP,
                "chunks": all_chunks
                    } 
        
    # Write it to the file
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"Chunks saved to {output_path} successfully.")
        print(f"output chunks saved {len(all_chunks)}")

       
        return output_path
    
# load chunks from exixting JSON file if exists.
    
def load_chunks_from_file(json_file_path):
        print(f"Found existing JSON file at {json_file_path}. Loading chunks from file...")
        with open(json_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        chunks = data["chunks"]
        print(f"Loaded {len(chunks)} chunks from existing JSON file.")
        return chunks
    
def main():

    if not os.path.exists(PDF_FILE_PATH):
        print(f"\nERROR: Could not find the PDF file at: {PDF_FILE_PATH}")
        exit()

    json_file_path = os.path.join(OUTPUT_FOLDER, OUTPUT_FILE)
 
    if os.path.exists(json_file_path):
        print(f"\nJSON file already exists for this PDF!")
        chunks = load_chunks_from_file(json_file_path)
 
    else:

        pages= parse_pdf_with_llamaparse(PDF_FILE_PATH)

        all_page_data = extract_text_from_pages(pages)

 # Make sure we actually got some text

        if not all_page_data:
            print("\nERROR: No text was extracted from the PDF. Is the file empty?")
            exit()
    
        all_chunks = split_text_into_chunks(all_page_data)


        output_file = save_chunks_to_json(all_chunks,PDF_FILE_PATH)

    
      
if __name__ == "__main__":
    main()
    
