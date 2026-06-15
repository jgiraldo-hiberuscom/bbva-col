from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import Settings, load_settings
from runtime import LocalAgentRuntime


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversationId: str | None = None


class ChatResponse(BaseModel):
    answer: str
    conversationId: str


settings = load_settings()
runtime = LocalAgentRuntime(settings)


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(
    title="Private Agent API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    conversation_id = payload.conversationId or __import__("uuid").uuid4().hex
    try:
        answer, conversation_id = await runtime.chat(
            message=payload.message,
            conversation_id=conversation_id,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"No fue posible completar la llamada al agente: {exc}",
        ) from exc

    return ChatResponse(answer=answer, conversationId=conversation_id)


def run() -> None:
    import uvicorn

    uvicorn.run(
        "server:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False,
        app_dir="src",
    )


if __name__ == "__main__":
    run()