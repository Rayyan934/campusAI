from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from rag.vectorstore_manager import get_vectorstore
from agents.student_agent import create_student_agent

load_dotenv()

app = FastAPI(title="CampusAI Engine", version="0.2.0")

# cache agents per school so we don't reload vectorstore on every request
_agent_cache: dict = {}


def get_agent(school_id: int, role: str):
    key = f"{school_id}:{role}"
    if key not in _agent_cache:
        if role == "student":
            vectorstore = get_vectorstore(school_id)
            if vectorstore is None:
                return None
            _agent_cache[key] = create_student_agent(vectorstore)
        else:
            return None
    return _agent_cache[key]


class ChatRequest(BaseModel):
    school_id: int
    user_id: int
    role: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    agent_used: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    agent = get_agent(request.school_id, request.role)

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail=f"No agent or documents found for school_id={request.school_id}, role={request.role}"
        )

    result = agent.invoke({
        "messages": [{"role": "user", "content": request.message}]
    })

    reply = result["messages"][-1].content

    if isinstance(reply, list):
        reply = " ".join(p.get("text", "") for p in reply if p.get("type") == "text")

    return ChatResponse(reply=reply, agent_used=f"{request.role}_agent")
