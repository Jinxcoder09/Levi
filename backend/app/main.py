import os
import time
import uuid
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict, Any

from fastapi import FastAPI, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.models import (
    ChatRequest, ChatResponse, CompletionRequest
)
from backend.app.middleware import LoggingMiddleware
from backend.app.llm.manager import llm_manager
from backend.app.utils import (
    estimate_tokens, format_sse_chunk, get_completion_prompt
)

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("backend.app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Warming up model in background...")
    asyncio.create_task(llm_manager.setup_provider())
    yield
    logger.info("Shutting down.")


app = FastAPI(title="Levi AI Coder", version="1.0.0", lifespan=lifespan)
api = APIRouter(prefix="/api")

app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_stream(
    prompt: str, system_prompt: str = None, messages: list = None,
    temperature: float = 0.7, max_tokens: int = 512,
) -> AsyncGenerator[str, None]:
    start = time.time()
    generated = ""
    prompt_tokens = estimate_tokens(prompt)
    if messages:
        for m in messages:
            prompt_tokens += estimate_tokens(m.get("content", ""))

    try:
        stream = await llm_manager.generate_stream(
            prompt=prompt, system_prompt=system_prompt,
            messages=messages, temperature=temperature, max_tokens=max_tokens,
        )
        async for chunk in stream:
            generated += chunk
            yield format_sse_chunk(content=chunk)
        duration = time.time() - start
        completion_tokens = estimate_tokens(generated)
        yield format_sse_chunk(content="", done=True, usage={
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "duration_ms": int(duration * 1000),
            "tokens_per_second": round(completion_tokens / duration, 2) if duration > 0 else 0,
        })
    except Exception as e:
        logger.error(f"Stream error: {e}")
        yield format_sse_chunk(content=f"\n[Error: {e}]", done=True)


async def run_standard(
    prompt: str, system_prompt: str = None, messages: list = None,
    temperature: float = 0.7, max_tokens: int = 512,
) -> ChatResponse:
    start = time.time()
    try:
        result = await llm_manager.generate(
            prompt=prompt, system_prompt=system_prompt,
            messages=messages, temperature=temperature, max_tokens=max_tokens,
        )
        duration = time.time() - start
        usage = result.get("usage", {})
        return ChatResponse(
            id=str(uuid.uuid4()),
            content=result["content"],
            usage={
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "completion_tokens": usage.get("completion_tokens", 0),
                "total_tokens": usage.get("total_tokens", 0),
                "duration_ms": int(duration * 1000),
            },
            model="Qwen2.5-Coder-0.5B-Q4_K_M",
        )
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@api.post("/chat")
async def chat(request: ChatRequest):
    msgs = [m.model_dump() for m in request.messages]
    system_prompt = None
    user_msgs = []
    for m in msgs:
        if m["role"] == "system":
            system_prompt = m["content"]
        else:
            user_msgs.append(m)
    last_prompt = user_msgs[-1]["content"] if user_msgs else ""

    if request.stream:
        return StreamingResponse(
            run_stream(
                prompt=last_prompt, system_prompt=system_prompt,
                messages=msgs,
                temperature=request.temperature or settings.DEFAULT_TEMPERATURE,
                max_tokens=request.max_tokens or settings.DEFAULT_MAX_TOKENS,
            ),
            media_type="text/event-stream",
        )
    return await run_standard(
        prompt=last_prompt, system_prompt=system_prompt, messages=msgs,
        temperature=request.temperature or settings.DEFAULT_TEMPERATURE,
        max_tokens=request.max_tokens or settings.DEFAULT_MAX_TOKENS,
    )


@api.post("/complete")
async def complete(request: CompletionRequest):
    prompt = get_completion_prompt(request.prefix, request.suffix, request.language or "python")
    if request.stream:
        return StreamingResponse(
            run_stream(prompt=prompt, temperature=request.temperature or 0.2,
                       max_tokens=request.max_tokens or 128),
            media_type="text/event-stream",
        )
    return await run_standard(prompt=prompt, temperature=request.temperature or 0.2,
                              max_tokens=request.max_tokens or 128)


@api.get("/health")
async def health():
    initialized = llm_manager.provider is not None and llm_manager.provider.initialized
    return {
        "status": "ok",
        "model_loaded": initialized,
    }


app.include_router(api)

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
    logger.info(f"Serving frontend from {frontend_dir}")
else:
    logger.warning("No frontend dist found. API-only mode.")
