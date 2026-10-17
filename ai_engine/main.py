from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="CampusAI Engine", version="0.1.0")


class ChatRequest(BaseModel):
    school_id: int
    user_id: int
    role: str  # student | teacher | principal | office | parent
    message: str


class ChatResponse(BaseModel):
    reply: str
    agent_used: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    # placeholder — real agent routing goes here
    return ChatResponse(
        reply=f"[{request.role.upper()} AGENT] Received: {request.message}",
        agent_used=f"{request.role}_agent"
    )
