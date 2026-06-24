import chromadb
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_store")
COLLECTION_NAME = "maintenance_manuals"

print("\nRetriever path:")
print(CHROMA_PATH)

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

    def search(self, query, n_results=3):

        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]

        formatted_results = []

        for doc, metadata in zip(documents, metadatas):

            formatted_results.append({
                "chunk_text": doc,
                "page_number": metadata.get("page_number"),
                "content_type": metadata.get("content_type"),
                "source_file": metadata.get("source_file")
            })

        return formatted_results


def main():

    retriever = Retriever()

    total_docs = retriever.count_documents()

    print(f"Connected to ChromaDB successfully.")
    print(f"Collection: {COLLECTION_NAME}")
    print(f"Total Documents: {total_docs}")

    query = "motor overheating"

    results = retriever.search(query)

    print(f"\nQuery: {query}")

    for index, result in enumerate(results, start=1):

        print("\n" + "=" * 60)

        print(f"Result {index}")
        print(f"Page: {result['page_number']}")
        print(f"Type: {result['content_type']}")
        print(f"Source: {result['source_file']}")

        preview = result["chunk_text"][:300]
        print(f"Text: {preview}...")


if __name__ == "__main__":
    main()