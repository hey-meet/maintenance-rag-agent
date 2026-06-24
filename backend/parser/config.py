import os

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

PDF_FILE_PATH = os.path.join(
    BASE_DIR,
    "data",
    "manuals",
    "A16B-1600-0520(CNC).pdf"
)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

OUTPUT_FOLDER = os.path.join(
    BASE_DIR,
    "backend",
    "parser",
    "chunks"
)

OUTPUT_FILE = "motor_manual_chunks.json"