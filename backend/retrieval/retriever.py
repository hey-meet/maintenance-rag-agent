import chromadb

CHROMA_PATH = "./chroma_store"
COLLECTION_NAME = "maintenance_manuals"


class Retriever:

    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=CHROMA_PATH
        )

        self.collection = self.client.get_collection(
            name=COLLECTION_NAME
        )

    def count_documents(self):
        return self.collection.count()


def main():

    retriever = Retriever()

    total_docs = retriever.count_documents()

    print(f"Connected to ChromaDB successfully.")
    print(f"Collection: {COLLECTION_NAME}")
    print(f"Total Documents: {total_docs}")


if __name__ == "__main__":
    main()