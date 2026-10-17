from langgraph.prebuilt import create_react_agent
from llm.gemini import get_llm
from tools.rag_tool import create_rag_tool
from prompts.student_prompt import STUDENT_PROMPT


def create_student_agent(vectorstore):
    model = get_llm()
    rag_tool = create_rag_tool(vectorstore)

    agent = create_react_agent(
        model=model,
        tools=[rag_tool],
        prompt=STUDENT_PROMPT
    )

    return agent
