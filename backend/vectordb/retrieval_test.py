import chromadb

CHROMA_PATH = "./chroma_store"
COLLECTION_NAME = "maintenance_manuals"


def main():

    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )

    collection = client.get_collection(
        name=COLLECTION_NAME
    )

    queries = [
        "motor overheating",
        "hydraulic pressure issue",
        "power supply fault",
        "alarm troubleshooting"
    ]

    for query in queries:

        print("\n" + "=" * 80)
        print("QUERY:", query)
        print("=" * 80)

        results = collection.query(
            query_texts=[query],
            n_results=3
        )

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]

        for i, (doc, metadata) in enumerate(
            zip(documents, metadatas),
            start=1
        ):

            print(f"\nResult {i}")
            print(f"Page: {metadata.get('page_number')}")
            print(f"Type: {metadata.get('content_type')}")

            preview = doc[:300].replace("\n", " ")
            print(f"Text: {preview}...")


if __name__ == "__main__":
    main()