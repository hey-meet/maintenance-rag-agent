import os

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

OUTPUT_FOLDER = os.path.join(
    BASE_DIR,
    "backend",
    "parser",
    "chunks"
)

