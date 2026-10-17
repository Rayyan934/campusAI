from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()


def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-3.8-flash",
        temperature=1,
        convert_system_message_to_human=True
    )
