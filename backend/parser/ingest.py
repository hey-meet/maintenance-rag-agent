# import necessary libraries
from dotenv import load_dotenv
import os
import re
import json
import hashlib
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
    print(f"[PARSE] Reading PDF: {pdf_path}")

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

    print(f"[PARSE] Extracted {len(pages_data)} pages.")
    return pages_data


# -----------------------------------------------------------------------------
# IMPROVEMENT: Dedicated text-cleaning helper.
# PDF-to-markdown extraction (even via LlamaParse) commonly leaves behind noise
# that hurts embedding quality: stray form-feed/control characters, repeated
# running headers/footers ("Page 3 of 120"), hyphenated line-break artifacts
# ("main-\ntenance" -> "maintenance"), and excessive blank lines that inflate
# chunk_char_count without adding signal. This is cleaned BEFORE chunking so
# every downstream chunk is denser in real technical content.
# NOTE: This does not touch alarm codes, DGN codes, tables, or numbers — the
# regexes are deliberately narrow so no technical information is ever removed.
# -----------------------------------------------------------------------------
_PAGE_FOOTER_PATTERN = re.compile(r"^\s*Page\s+\d+\s+of\s+\d+\s*$", re.IGNORECASE | re.MULTILINE)
_CONTROL_CHARS_PATTERN = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
_HYPHEN_LINEBREAK_PATTERN = re.compile(r"(\w)-\n(\w)")
_MULTI_BLANK_LINES_PATTERN = re.compile(r"\n{3,}")
_TRAILING_WHITESPACE_PATTERN = re.compile(r"[ \t]+\n")


def _clean_page_text(raw_text):
    """Strip PDF/OCR noise while preserving all technical content."""
    text = _CONTROL_CHARS_PATTERN.sub("", raw_text)
    text = _PAGE_FOOTER_PATTERN.sub("", text)
    text = _HYPHEN_LINEBREAK_PATTERN.sub(r"\1\2", text)  # rejoin hyphen-broken words
    text = _TRAILING_WHITESPACE_PATTERN.sub("\n", text)
    text = _MULTI_BLANK_LINES_PATTERN.sub("\n\n", text)
    return text.strip()


# -----------------------------------------------------------------------------
# IMPROVEMENT: Richer, more accurate section-type detection.
# The original logic only distinguished "table_or_schema" vs "text" using a
# crude pipe-character count. For industrial manuals, the RAG system benefits
# far more from knowing WHICH kind of maintenance content a page holds, since
# that drives chunk-boundary decisions (see split_text_into_chunks) and gives
# the retriever/agent a more useful content_type metadata signal.
# The field name "content_type" is preserved exactly (same JSON key), only the
# classification quality improves — so nothing downstream needs to change.
# -----------------------------------------------------------------------------
_ALARM_KEYWORDS = ("ALARM", "DGN ", "FAULT CODE", "ERROR CODE", "DIAGNOSTIC")
_TROUBLESHOOTING_KEYWORDS = ("CAUSE", "CORRECTIVE ACTION", "REMEDY", "SYMPTOM", "TROUBLESHOOT")
_PARAMETER_KEYWORDS = ("PARAMETER", "SETTING RANGE", "DEFAULT VALUE", "SETPOINT")


# -----------------------------------------------------------------------------
# IMPROVEMENT: Printed manual page-number detection.
#
# PROBLEM: LlamaParse gives us the PHYSICAL PDF page index. Manuals almost
# always contain front matter (cover, TOC, preface) before the body's own
# printed page numbering starts, so physical page N is frequently NOT the
# same number a technician sees printed on that page (e.g. PDF page 347 may
# be printed "357" inside the manual). Retrieval already finds the right
# chunk; only the page number shown to the user is wrong.
#
# APPROACH: Printed page numbers almost universally appear as a short,
# isolated header/footer line — just a number, optionally framed with light
# punctuation ("357", "- 357 -", "| 357"), a "Page 357" label, or a
# chapter-page style like "4-357". These candidate lines are only searched
# for in the first/last few non-empty lines of a page (the header/footer
# zone) and must be short, so we don't accidentally match numbers embedded
# in tables, alarm codes (e.g. "DGN 0200"), or body paragraphs.
#
# SAFETY / NO HARDCODED OFFSETS: We never assume a fixed offset like "+10".
# Detected candidates are also checked for sequential plausibility against
# the last confirmed printed page number (must increase, within a small
# window) so a stray digit elsewhere on the page can't be mistaken for a
# page number. If a page has no detectable printed number, we infer it by
# continuing the sequence from the last confirmed one (+1) once the body's
# printed numbering has been established; before that point (front matter),
# we safely fall back to the physical PDF page number. This generalizes
# across manuals with different front-matter lengths and numbering styles,
# with no manual/document-specific constants anywhere.
# -----------------------------------------------------------------------------
_LABELED_PAGE_NUM_PATTERN = re.compile(r"^(?:page|p\.?)\s*[:#]?\s*(\d{1,4})$", re.IGNORECASE)
_CHAPTER_PAGE_NUM_PATTERN = re.compile(r"^\d{1,3}-(\d{1,4})$")
_STANDALONE_PAGE_NUM_PATTERN = re.compile(r"^[\-\|\s]{0,3}(\d{1,4})[\-\|\s]{0,3}$")
_MAX_HEADER_FOOTER_LINE_LEN = 15  # printed page-number lines are always short
_MAX_SEQUENTIAL_JUMP = 5          # plausibility window vs. the last confirmed page


def _find_printed_page_candidate(page_text):
    """Scans header/footer zones of a page for a plausible printed page number."""
    lines = [ln.strip() for ln in page_text.split("\n") if ln.strip()]
    if not lines:
        return None

    # Printed page numbers live in headers or footers, never mid-body —
    # so only the first/last few non-empty lines are inspected.
    zone_lines = lines[:3] + lines[-3:]

    for line in zone_lines:
        if len(line) > _MAX_HEADER_FOOTER_LINE_LEN:
            continue  # too long to plausibly be just a page number
        for pattern in (_LABELED_PAGE_NUM_PATTERN, _CHAPTER_PAGE_NUM_PATTERN, _STANDALONE_PAGE_NUM_PATTERN):
            match = pattern.match(line)
            if match:
                try:
                    candidate = int(match.group(1))
                except ValueError:
                    continue
                if 1 <= candidate <= 9999:
                    return candidate
    return None


def _resolve_printed_page_number(page_text, physical_page_number, last_confirmed_printed_page):
    """
    Returns (printed_page_number, updated_last_confirmed_printed_page).
    Falls back to the physical PDF page number until real printed numbering
    is confirmed at least once in the document.
    """
    candidate = _find_printed_page_candidate(page_text)

    if candidate is not None and last_confirmed_printed_page is not None:
        # Reject implausible jumps/repeats (e.g. a stray digit misread as a
        # page number) rather than trusting every regex hit blindly.
        if not (last_confirmed_printed_page < candidate <= last_confirmed_printed_page + _MAX_SEQUENTIAL_JUMP):
            candidate = None

    if candidate is not None:
        return candidate, candidate

    if last_confirmed_printed_page is not None:
        # No number detected on this page, but numbering is already
        # established — continue the sequence rather than losing it.
        inferred = last_confirmed_printed_page + 1
        return inferred, inferred

    # Front matter / no printed numbering seen yet: use the physical page.
    return physical_page_number, None


def _classify_page(page_text):
    upper_text = page_text.upper()
    pipe_count = page_text.count("|")

    is_table_like = pipe_count >= 6 or "STATUS" in upper_text or "LED" in upper_text

    if any(kw in upper_text for kw in _ALARM_KEYWORDS):
        return "alarm_section"
    if any(kw in upper_text for kw in _TROUBLESHOOTING_KEYWORDS):
        return "troubleshooting_section"
    if any(kw in upper_text for kw in _PARAMETER_KEYWORDS):
        return "parameter_section"
    if is_table_like:
        return "table_or_schema"
    return "text"


# STEP 3: Structural Page Mapping & Table Tagging (LlamaParse Schema Variant Fix)
def extract_text_from_pages(pages_data):
    print("[EXTRACT] Structuring page text...")
    all_page_data = []

    # IMPROVEMENT: tracks the last confirmed printed page number across the
    # document so numbering can be inferred sequentially once established,
    # and so isolated false-positive digits can be rejected (see
    # _resolve_printed_page_number). Reset per document/run — never persisted
    # or hardcoded.
    last_confirmed_printed_page = None

    for i, page in enumerate(pages_data):
        # API Schema Variation Fix: Try fetching markdown first, fallback to raw text key
        page_text = page.get("markdown", "").strip()
        if not page_text:
            page_text = page.get("text", "").strip()

        # This is the PHYSICAL PDF page index, exactly as before — kept
        # unchanged so chunk_id generation and any PDF-viewer integration
        # that expects a physical page reference continue to work.
        physical_page_number = page.get("page", i + 1)

        if not page_text:
            continue

        # IMPROVEMENT: clean noise before classification/chunking (see _clean_page_text)
        page_text = _clean_page_text(page_text)
        if not page_text:
            continue

        # IMPROVEMENT: multi-category classification instead of binary table/text
        content_type = _classify_page(page_text)

        # IMPROVEMENT: resolve the manual's own PRINTED page number whenever
        # detectable, falling back to the physical page number for front
        # matter or undetectable pages (see helper docstring above).
        printed_page_number, last_confirmed_printed_page = _resolve_printed_page_number(
            page_text, physical_page_number, last_confirmed_printed_page
        )

        page_info = {
            # "page_number" now holds the PRINTED manual page number — this
            # is what the UI/citations should show. Existing consumers that
            # just read page_number keep working unchanged; they now simply
            # receive the correct value.
            "page_number": printed_page_number,
            # NEW, additive field: the original physical PDF page, retained
            # for traceability/debugging and for chunk_id generation below.
            "pdf_page_number": physical_page_number,
            "content_type": content_type,
            "text": page_text,
            "char_count": len(page_text)
        }
        all_page_data.append(page_info)

    print(f"[EXTRACT] {len(all_page_data)} pages ready for chunking.")
    return all_page_data


# -----------------------------------------------------------------------------
# IMPROVEMENT: Detect markdown table blocks so they can be protected from being
# split mid-row by the recursive splitter. A "table block" here is any
# contiguous run of lines that look like markdown table rows (start/contain
# a '|'). If a table block is small enough to reasonably fit as a single
# chunk (<= 2x configured chunk_size), it is kept completely intact — this is
# the single highest-value fix for troubleshooting/alarm tables, since a
# broken row separates an alarm code from its own cause/corrective action.
# Oversized tables still fall back to the recursive splitter so we never
# silently produce a chunk of unbounded size.
# -----------------------------------------------------------------------------
def _extract_protected_blocks(text, max_intact_size):
    """
    Splits `text` into a list of (segment_text, is_protected_table) tuples.
    Protected table segments are left completely untouched by the recursive
    splitter downstream so rows/alarm-cause-action groupings stay together.
    """
    lines = text.split("\n")
    segments = []
    buffer = []
    in_table = False

    def flush_buffer(is_table):
        if buffer:
            segment_text = "\n".join(buffer).strip()
            if segment_text:
                segments.append((segment_text, is_table))
            buffer.clear()

    for line in lines:
        looks_like_table_row = "|" in line
        if looks_like_table_row and not in_table:
            flush_buffer(is_table=False)
            in_table = True
        elif not looks_like_table_row and in_table:
            flush_buffer(is_table=True)
            in_table = False
        buffer.append(line)
    flush_buffer(is_table=in_table)

    # Demote any "protected" table segment that's too large to stay intact
    # so it still gets safely split rather than producing a giant chunk.
    final_segments = []
    for segment_text, is_table in segments:
        if is_table and len(segment_text) > max_intact_size:
            final_segments.append((segment_text, False))
        else:
            final_segments.append((segment_text, is_table))

    return final_segments


# STEP 4: Context-Aware Markdown Chunking
def split_text_into_chunks(all_page_data, source_filename):
    print("[CHUNK] Splitting pages into semantic chunks...")

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
        except Exception:
            # Complete operational isolation block: silently drop to defaults on structural fault lines
            pass

    print(f"[CHUNK] Using chunk_size={chunk_size}, chunk_overlap={chunk_overlap}")

    # IMPROVEMENT: Added separators tuned for industrial manuals so the
    # recursive splitter prefers breaking BETWEEN maintenance concepts
    # (alarm entries, numbered procedure steps, cause/action labels) rather
    # than in the middle of one. Original separators are kept at the end of
    # the list as the final fallback, unchanged in behavior for plain text.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,        # Dynamically adjusted density tracking parameter
        chunk_overlap=chunk_overlap,  # Dynamically adjusted safe context margin boundary
        separators=[
            "\n### ", "\n## ", "\n# ",   # markdown headings (unchanged)
            "\nALARM ", "\nDGN ",         # NEW: break between distinct alarm/DGN entries
            "\nCAUSE:", "\nCORRECTIVE ACTION:", "\nREMEDY:",  # NEW: keep step labels as boundaries, not mid-sentence
            "\n\n", "\n", " "             # original fallbacks (unchanged)
        ]
    )

    # Table blocks are protected up to 2x the configured chunk_size before
    # falling back to the normal splitter, so intact tables aren't forced
    # into unreasonably large single chunks.
    max_intact_table_size = chunk_size * 2

    all_chunks = []
    chunk_number = 0
    just_filename = os.path.basename(source_filename)
    seen_exact_hashes = set()  # IMPROVEMENT: exact-duplicate detection (see below)

    for page in all_page_data:
        raw_text = page["text"]
        # printed_page_num is what gets shown to users / stored as
        # "page_number" (now the manual's own printed number whenever
        # detected). pdf_page_num is the physical PDF page, used for
        # chunk_id exactly as page_number was used before this change —
        # so chunk_id generation and its uniqueness guarantee are IDENTICAL
        # to the previous behavior (physical pages are always unique and
        # strictly increasing per document, so no collisions are introduced).
        printed_page_num = page["page_number"]
        pdf_page_num = page["pdf_page_number"]

        # IMPROVEMENT: protect intact table/troubleshooting blocks from being
        # split mid-row; everything else still goes through the recursive
        # splitter exactly as before.
        protected_segments = _extract_protected_blocks(raw_text, max_intact_table_size)

        chunks_from_this_page = []
        for segment_text, is_protected in protected_segments:
            if is_protected:
                chunks_from_this_page.append(segment_text)
            else:
                chunks_from_this_page.extend(text_splitter.split_text(segment_text))

        for i, chunk_text in enumerate(chunks_from_this_page):
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue

            # IMPROVEMENT: exact-duplicate guard. Only drops chunks whose raw
            # text segment is a byte-for-byte repeat (e.g., repeated header
            # boilerplate appearing on many pages). Any unique content —
            # even a single differing character — is always kept.
            dedup_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
            if dedup_hash in seen_exact_hashes:
                continue
            seen_exact_hashes.add(dedup_hash)

            # INDUSTRIAL CONTEXT ENRICHMENT: Forces embedding model to mathematically retain location metadata
            # IMPROVEMENT: the embedded "Page:" reference now shows the
            # PRINTED manual page number, since that's what a technician
            # would actually cross-reference against the physical manual.
            meta_header = f"[Source: {just_filename} | Page: {printed_page_num} | Mode: {page['content_type']}]\n"
            enriched_chunk_text = meta_header + chunk_text

            # chunk_id generation UNCHANGED: still built from the physical
            # PDF page number exactly as before, so IDs remain stable and
            # collision-free for ChromaDB and any existing references to
            # this ID format.
            chunk_id = f"file_{just_filename}_page{pdf_page_num}_chunk{i}"
            chunk_info = {
                "chunk_id": chunk_id,
                "chunk_number": chunk_number,
                "source_file": just_filename,
                "page_number": printed_page_num,      # now the printed manual page number
                "pdf_page_number": pdf_page_num,      # NEW, additive: original physical PDF page
                "content_type": page["content_type"],
                "chunk_index_on_page": i,
                "total_chunks_on_page": len(chunks_from_this_page),
                "chunk_text": enriched_chunk_text,  # Embellished text data for vector embeddings
                "raw_text_segment": chunk_text,
                "chunk_char_count": len(enriched_chunk_text)
            }
            all_chunks.append(chunk_info)
            chunk_number += 1

    print(f"[CHUNK] Created {len(all_chunks)} chunks.")
    return all_chunks


# STEP 5: Save the chunks to a JSON file
def save_chunks_to_json(all_chunks, source_filename, output_file):
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

    print(f"[SAVE] {len(all_chunks)} chunks written to: {output_path}")
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
        print(f"[DEDUP] Existing chunk file found for {just_filename}, skipping re-ingestion.")
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
            return {
                "success": True,
                "chunk_file": output_file,
                "total_chunks": existing_data.get("total_chunks", len(existing_data.get("chunks", [])))
            }
        except Exception as e:
            print(f"[DEDUP] Existing file corrupt ({str(e)}). Forcing re-ingestion.")
            os.remove(output_path)

    # Core execution pipeline
    pages_data = parse_pdf_with_llamaparse(pdf_path)
    all_page_data = extract_text_from_pages(pages_data)

    if not all_page_data:
        print(f"[ERROR] No text extracted from {just_filename}. Verify file state or API quotas.")
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