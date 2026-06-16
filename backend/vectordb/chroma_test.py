import chromadb

client = chromadb.PersistentClient(path="./chroma_store")

collection = client.get_or_create_collection(
    name="maintenance_manuals"
)

print("ChromaDB setup successful")
print("Collection:", collection.name)