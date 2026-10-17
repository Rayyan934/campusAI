from langchain.tools import tool
from rag.retriever import retrieve_context


def create_rag_tool(vectorstore):
    @tool(response_format="content_and_artifact")
    def rag_tool(query: str):
        """Retrieve relevant content from the school's textbooks to answer the query."""
        return retrieve_context(vectorstore, query)

    return rag_tool
