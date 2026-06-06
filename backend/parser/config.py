# The PDF file we want to process 
PDF_FILE_PATH = "data/manuals/A16B-1600-0520(CNC).pdf"
 
# Chunk size = how many characters each chunk should have (max)
CHUNK_SIZE = 1000
 
# Chunk overlap = how many characters the next chunk should share with the previous one
CHUNK_OVERLAP = 200
 
# Where to save the output JSON file
OUTPUT_FOLDER = "chunks"
OUTPUT_FILE = "motor_manual_chunks.json"
