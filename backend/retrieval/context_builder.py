def build_context(query, retrieved_results):

    context = {
        "query": query,
        "results": []
    }

    for result in retrieved_results:

        context["results"].append({
            "page": result.get("page_number"),
            "source": result.get("source_file"),
            "content": result.get("chunk_text")
        })

    return context


def main():

    sample_results = [
        {
            "chunk_text": "Motor overheating troubleshooting steps...",
            "page_number": 425,
            "content_type": "text",
            "source_file": "motor_manual.pdf"
        },
        {
            "chunk_text": "Check cooling fan operation...",
            "page_number": 414,
            "content_type": "table",
            "source_file": "motor_manual.pdf"
        }
    ]

    context = build_context(
        query="motor overheating",
        retrieved_results=sample_results
    )

    print(context)


if __name__ == "__main__":
    main()