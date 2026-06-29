# import necessary libraries
from dotenv import load_dotenv
import os
import json
from llama_parse import LlamaParse
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .config import OUTPUT_FOLDER  # Import only OUTPUT_FOLDER from config

# Load environment variables from .env file
load_dotenv()

# STEP 1: Load the API KEY and Resolve Project Paths at Module Level
API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

CURRENT_FILE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(CURRENT_FILE_DIR)
SETTINGS_PATH = os.path.join(BACKEND_ROOT, "config", "settings.json")

if not API_KEY and __name__ == "__main__":
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

    # Establish operational baseline defaults
    chunk_size = 1000
    chunk_overlap = 200

    # Load dynamic ingestion metrics using the persistent module-level path mapping
    if os.path.exists(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
                settings_data = json.load(f)
                
            retrieval_cfg = settings_data.get("retrieval", {})
            configured_size = retrieval_cfg.get("chunk_size")
            configured_overlap = retrieval_cfg.get("chunk_overlap")

            # Validate parameters cleanly before pipeline implementation
            if isinstance(configured_size, (int, float)):
                chunk_size = int(configured_size)
            if isinstance(configured_overlap, (int, float)):
                chunk_overlap = int(configured_overlap)
                
            print(f"[CONFIGURATION ENGINE] Settings matrix loaded dynamically: chunk_size={chunk_size}, chunk_overlap={chunk_overlap}")
        except Exception:
            # Complete operational isolation block: silently drop to defaults on structural fault lines
            pass

    # Markdown specific separators to keep hierarchies together
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,        # Dynamically adjusted density tracking parameter
        chunk_overlap=chunk_overlap,  # Dynamically adjusted safe context margin boundary
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
def save_chunks_to_json(all_chunks, source_filename, output_file):
    print("Saving processed framework chunks to secure storage directory...")

    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    output_path = os.path.join(OUTPUT_FOLDER, output_file)

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


# NEW ENGINE FUNCTION: Multi-manual Ingestion Routing Strategy
def ingest_manual(pdf_path):
    """
    Ingests an individual manual dynamically. Deduplicates generation 
    by checking for pre-existing output chunks before hitting LlamaParse.
    """
    if not API_KEY:
        raise ValueError("LLAMA_CLOUD_API_KEY missing from environment configurations.")

    just_filename = os.path.basename(pdf_path)
    base_name, _ = os.path.splitext(just_filename)
    
    # Dynamically map the target output file standard
    output_file = f"{base_name}_chunks.json"
    output_path = os.path.join(OUTPUT_FOLDER, output_file)

    # Idempotency Guard: Prevent duplicate chunk extraction charges/runs
    if os.path.exists(output_path):
        print(f"\n[DEDUPLICATION] Found existing chunk framework for {just_filename} at: {output_path}")
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
            return {
                "success": True,
                "chunk_file": output_file,
                "total_chunks": existing_data.get("total_chunks", len(existing_data.get("chunks", [])))
            }
        except Exception as e:
            print(f"Warning: Existing file corrupt ({str(e)}). Forcing re-ingestion workflow.")
            os.remove(output_path)

    # Core execution pipeline
    pages_data = parse_pdf_with_llamaparse(pdf_path)
    all_page_data = extract_text_from_pages(pages_data)

    if not all_page_data:
        print(f"\nERROR: No text extracted from {just_filename}. Verify file state or API quotas.")
        return {
            "success": False,
            "chunk_file": output_file,
            "total_chunks": 0
        }

    all_chunks = split_text_into_chunks(all_page_data, pdf_path)
    save_chunks_to_json(all_chunks, pdf_path, output_file)

    return {
        "success": True,
        "chunk_file": output_file,
        "total_chunks": len(all_chunks)
    }


# Local Testing Execution Matrix
def main():
    # Import locally to avoid blocking production environments when variables are unset
    try:
        from .config import PDF_FILE_PATH
    except ImportError:
        print("Skipping local main() run: Configuration test constants missing.")
        return

    print("--- Running Local Mock Engine Test ---")
    if not os.path.exists(PDF_FILE_PATH):
        print(f"\nERROR: Could not find test PDF file at: {PDF_FILE_PATH}")
        exit()

    # For testing, we intentionally clear old file states to trace execution paths cleanly
    just_filename = os.path.basename(PDF_FILE_PATH)
    base_name, _ = os.path.splitext(just_filename)
    test_output_path = os.path.join(OUTPUT_FOLDER, f"{base_name}_chunks.json")
    if os.path.exists(test_output_path):
        os.remove(test_output_path)

    result = ingest_manual(PDF_FILE_PATH)
    print(f"\nEngine result payload: {json.dumps(result, indent=4)}")


if __name__ == "__main__":
    main()