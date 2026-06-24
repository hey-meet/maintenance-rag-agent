# import necessary libraries
from dotenv import load_dotenv
import os
import json
from llama_parse import LlamaParse
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .config import *

# Load environment variables from .env file
load_dotenv()

# STEP 1: Load the API KEY from .env file
API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

if not API_KEY:
    print("Error: LLAMA_CLOUD_API_KEY not found in .env file.")
    exit()


# STEP 2: Parse the PDF using LlamaParse (Directly for accurate page extraction)
def parse_pdf_with_llamaparse(pdf_path):
    print(f"Reading PDF from {pdf_path}")
    print("Parsing via LlamaParse markdown-layout engine...")

    # Using user_prompt to comply with the latest unified SDK standard
    parser = LlamaParse(
        api_key=API_KEY,
        result_type="markdown",
        num_workers=4,  # Parallel workers for speed optimization
        user_prompt=(
            "This is an industrial machinery maintenance manual containing troubleshooting tables, schemas, and alarms. "
            "Maintain all tables intact in raw markdown layout. Do not split rows. "
            "Preserve all error codes, alarm numbers (e.g., ALARM 414, ALARM 700), diagnostic indicators (e.g., DGN 0200), "
            "and structural hierarchies strictly. Retain page numbers."
        )
    )

    # Directly extract JSON object containing exact individual page data streams
    json_results = parser.get_json_result(pdf_path)
    pages_data = json_results[0].get("pages", [])
    
    print(f"PDF parsing completed. Extracted {len(pages_data)} structured layout pages.")
    return pages_data


# STEP 3: Structural Page Mapping & Table Tagging (LlamaParse Schema Variant Fix)
def extract_text_from_pages(pages_data):
    print("Extracting structured text from page array...")
    all_page_data = []

    for i, page in enumerate(pages_data):
        # API Schema Variation Fix: Try fetching markdown first, fallback to raw text key
        page_text = page.get("markdown", "").strip()
        if not page_text:
            page_text = page.get("text", "").strip()
            
        page_number = page.get("page", i + 1)

        if not page_text:
            continue

        # Advanced structural detection for tables/schemas
        if page_text.count("|") >= 6 or "STATUS" in page_text or "LED" in page_text:
            content_type = "table_or_schema"
        else:
            content_type = "text"

        page_info = {
            "page_number": page_number,
            "content_type": content_type,
            "text": page_text,
            "char_count": len(page_text)
        }
        all_page_data.append(page_info)
        
    print(f"Text processing finalized. Structured {len(all_page_data)} production-ready layers.")
    return all_page_data


# STEP 4: Context-Aware Markdown Chunking
def split_text_into_chunks(all_page_data, source_filename):
    print("Splitting text into context-enriched industrial chunks...")

    # Markdown specific separators to keep hierarchies together
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,        # Optimal density for industrial chunk processing
        chunk_overlap=200,      # Safe context margin for error parameters
        separators=["\n### ", "\n## ", "\n# ", "\n\n", "\n", " "]
    )

    all_chunks = []
    chunk_number = 0
    just_filename = os.path.basename(source_filename)

    for page in all_page_data:
        raw_text = page["text"]
        page_num = page["page_number"]
        
        # Split text inside isolated individual page boundaries
        chunks_from_this_page = text_splitter.split_text(raw_text)
        
        for i, chunk_text in enumerate(chunks_from_this_page):
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue

            # INDUSTRIAL CONTEXT ENRICHMENT: Forces embedding model to mathematically retain location metadata
            meta_header = f"[Source: {just_filename} | Page: {page_num} | Mode: {page['content_type']}]\n"
            enriched_chunk_text = meta_header + chunk_text

            chunk_id = f"file_{just_filename}_page{page_num}_chunk{i}"
            chunk_info = {
                "chunk_id": chunk_id,
                "chunk_number": chunk_number,
                "source_file": just_filename,
                "page_number": page_num,
                "content_type": page["content_type"],
                "chunk_index_on_page": i,
                "total_chunks_on_page": len(chunks_from_this_page),
                "chunk_text": enriched_chunk_text,  # Embellished text data for vector embeddings
                "raw_text_segment": chunk_text,
                "chunk_char_count": len(enriched_chunk_text)
            }
            all_chunks.append(chunk_info)
            chunk_number += 1

    print(f"Splitting done. Created {len(all_chunks)} highly specialized operational fragments.")
    return all_chunks


# STEP 5: Save the chunks to a JSON file
def save_chunks_to_json(all_chunks, source_filename):
    print("Saving processed framework chunks to secure storage directory...")

    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    output_path = os.path.join(OUTPUT_FOLDER, OUTPUT_FILE)

    output_data = {
        "source_pdf": os.path.basename(source_filename),
        "total_chunks": len(all_chunks),
        "chunks": all_chunks
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Production chunks successfully dumped at: {output_path}")
    return output_path


def load_chunks_from_file(json_file_path):
    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["chunks"]


def main():
    if not os.path.exists(PDF_FILE_PATH):
        print(f"\nERROR: Could not find the PDF file at: {PDF_FILE_PATH}")
        exit()

    json_file_path = os.path.join(OUTPUT_FOLDER, OUTPUT_FILE)

    # Force re-ingestion workflow to drop corrupted zero data blocks
    if os.path.exists(json_file_path):
        os.remove(json_file_path)
        
    pages_data = parse_pdf_with_llamaparse(PDF_FILE_PATH)
    all_page_data = extract_text_from_pages(pages_data)

    if not all_page_data:
        print("\nERROR: No text extracted. Verify file state or API quotas.")
        exit()

    all_chunks = split_text_into_chunks(all_page_data, PDF_FILE_PATH)
    save_chunks_to_json(all_chunks, PDF_FILE_PATH)


if __name__ == "__main__":
    main()