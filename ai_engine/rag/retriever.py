def retrieve_context(vectorstore, query: str, k: int = 6):
    docs = vectorstore.similarity_search(query, k=k)

    serialized = "\n\n".join(
        f"Source: {doc.metadata.get('source', 'unknown')}\nContent: {doc.page_content}"
        for doc in docs
    )

    artifact = [
        {"source": doc.metadata.get("source", "unknown"), "content": doc.page_content}
        for doc in docs
    ]

    return serialized, artifact
