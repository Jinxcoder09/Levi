import os
import time
import uuid
import logging
import asyncio
import psutil
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.models import (
    ChatRequest, ChatResponse, ChatResponseChunk,
    CodeRequest, CompletionRequest, ModelInfoResponse
)
from backend.app.middleware import RateLimitMiddleware, LoggingMiddleware
from backend.app.llm.manager import llm_manager
from backend.app.utils import (
    estimate_tokens, format_sse_chunk,
    get_code_prompt, get_completion_prompt
)

# Setup logging configuration
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("backend.app.main")

# Metrics memory store
class SystemMetrics:
    def __init__(self):
        self.total_requests = 0
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        self.total_generation_time_sec = 0.0

    def add(self, prompt_tokens: int, completion_tokens: int, duration: float):
        self.total_requests += 1
        self.total_prompt_tokens += prompt_tokens
        self.total_completion_tokens += completion_tokens
        self.total_generation_time_sec += duration

    def get_metrics_report(self) -> Dict[str, Any]:
        avg_latency = (
            self.total_generation_time_sec / self.total_requests 
            if self.total_requests > 0 else 0.0
        )
        return {
            "total_requests": self.total_requests,
            "total_prompt_tokens": self.total_prompt_tokens,
            "total_completion_tokens": self.total_completion_tokens,
            "total_tokens": self.total_prompt_tokens + self.total_completion_tokens,
            "average_latency_seconds": round(avg_latency, 4),
            "total_generation_time_seconds": round(self.total_generation_time_sec, 2)
        }

metrics = SystemMetrics()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Model warm-up on startup (non-blocking for fast server boot)
    logger.info("Initializing LLM Manager and warming up model in the background...")
    asyncio.create_task(llm_manager.setup_provider())
    yield
    # Shutdown operations
    logger.info("Server shutting down.")

# Main app instantiation
app = FastAPI(
    title="AI Coding Assistant API",
    version="1.0.0",
    lifespan=lifespan
)

# Add Middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, limit=settings.RATE_LIMIT_PER_MINUTE)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stream Generator Helper
async def run_stream_generator(
    prompt: str,
    system_prompt: str = None,
    messages: list = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> AsyncGenerator[str, None]:
    start_time = time.time()
    generated_content = ""
    prompt_tokens = estimate_tokens(prompt)
    if messages:
        for m in messages:
            prompt_tokens += estimate_tokens(m.get("content", ""))

    try:
        stream = await llm_manager.generate_stream(
            prompt=prompt,
            system_prompt=system_prompt,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        async for chunk in stream:
            generated_content += chunk
            # Format SSE yield
            yield format_sse_chunk(content=chunk, done=False)
            
        duration = time.time() - start_time
        completion_tokens = estimate_tokens(generated_content)
        metrics.add(prompt_tokens, completion_tokens, duration)
        
        # Send final chunk with usage metrics
        usage_data = {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "duration_ms": int(duration * 1000),
            "tokens_per_second": round(completion_tokens / duration, 2) if duration > 0 else 0
        }
        yield format_sse_chunk(content="", done=True, usage=usage_data)
        
    except Exception as e:
        logger.error(f"Error in running streaming generator: {e}")
        yield format_sse_chunk(content=f"\n[Generation Error: {e}]", done=True)

# Standard Non-Stream Helper
async def run_standard_generation(
    prompt: str,
    system_prompt: str = None,
    messages: list = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> ChatResponse:
    start_time = time.time()
    try:
        response_data = await llm_manager.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        duration = time.time() - start_time
        usage = response_data.get("usage", {})
        
        prompt_tokens = usage.get("prompt_tokens", estimate_tokens(prompt))
        completion_tokens = usage.get("completion_tokens", estimate_tokens(response_data["content"]))
        metrics.add(prompt_tokens, completion_tokens, duration)
        
        # Build enriched usage dict
        metrics_dict = {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "duration_ms": int(duration * 1000),
            "tokens_per_second": round(completion_tokens / duration, 2) if duration > 0 else 0
        }
        
        status_info = await llm_manager.get_status_info()
        
        return ChatResponse(
            id=str(uuid.uuid4()),
            content=response_data["content"],
            usage=metrics_dict,
            model=status_info.get("model_id", status_info.get("model_path", "qwen-0.5b"))
        )
    except Exception as e:
        logger.error(f"Error in standard generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# API ENDPOINTS
@app.post("/chat")
async def chat(request: ChatRequest):
    messages_list = [m.model_dump() for m in request.messages]
    
    # Extract system prompt if present in payload
    system_prompt = None
    user_messages = []
    for msg in messages_list:
        if msg["role"] == "system":
            system_prompt = msg["content"]
        else:
            user_messages.append(msg)
            
    # The last user message is the primary prompt
    last_prompt = user_messages[-1]["content"] if user_messages else ""

    if request.stream:
        return StreamingResponse(
            run_stream_generator(
                prompt=last_prompt,
                system_prompt=system_prompt,
                messages=messages_list,
                temperature=request.temperature or settings.DEFAULT_TEMPERATURE,
                max_tokens=request.max_tokens or settings.DEFAULT_MAX_TOKENS
            ),
            media_type="text/event-stream"
        )
    else:
        return await run_standard_generation(
            prompt=last_prompt,
            system_prompt=system_prompt,
            messages=messages_list,
            temperature=request.temperature or settings.DEFAULT_TEMPERATURE,
            max_tokens=request.max_tokens or settings.DEFAULT_MAX_TOKENS
        )

@app.post("/complete")
async def complete(request: CompletionRequest):
    prompt = get_completion_prompt(request.prefix, request.suffix, request.language or "python")
    
    # We want low temperature for completion tasks
    temp = request.temperature or 0.2
    max_t = request.max_tokens or 128
    
    if request.stream:
        return StreamingResponse(
            run_stream_generator(prompt=prompt, temperature=temp, max_tokens=max_t),
            media_type="text/event-stream"
        )
    else:
        return await run_standard_generation(prompt=prompt, temperature=temp, max_tokens=max_t)

# Helper decorator for modular code API endpoints
def make_code_endpoint(action: str):
    async def endpoint(request: CodeRequest):
        prompt = get_code_prompt(action, request.code, request.language or "python", request.context)
        temp = request.temperature or settings.DEFAULT_TEMPERATURE
        max_t = request.max_tokens or settings.DEFAULT_MAX_TOKENS
        
        if request.stream:
            return StreamingResponse(
                run_stream_generator(prompt=prompt, temperature=temp, max_tokens=max_t),
                media_type="text/event-stream"
            )
        else:
            return await run_standard_generation(prompt=prompt, temperature=temp, max_tokens=max_t)
    return endpoint

# Register code utility endpoints
app.post("/explain")(make_code_endpoint("explain"))
app.post("/debug")(make_code_endpoint("debug"))
app.post("/refactor")(make_code_endpoint("refactor"))
app.post("/generate-tests")(make_code_endpoint("generate-tests"))
app.post("/summarize")(make_code_endpoint("summarize"))

@app.get("/health")
async def health():
    # Health check responds instantly for cloud pingers
    status_info = await llm_manager.get_status_info()
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "active_mode": status_info.get("active_mode"),
        "local_model_loaded": status_info.get("initialized", False),
        "is_downloading": status_info.get("is_downloading", False)
    }

@app.get("/metrics")
async def get_metrics():
    # Enriches metrics with current server state
    report = metrics.get_metrics_report()
    status_info = await llm_manager.get_status_info()
    ram_stats = psutil.virtual_memory()
    report.update({
        "active_mode": "local",
        "system_ram_gb": round(ram_stats.total / (1024 ** 3), 2),
        "device": status_info.get("device", "CPU")
    })
    return report

@app.get("/model-info", response_model=ModelInfoResponse)
async def get_model_info():
    status_info = await llm_manager.get_status_info()
    
    # Calculate memory stats
    ram_stats = psutil.virtual_memory()
    total_gb = ram_stats.total / (1024 ** 3)
    used_gb = ram_stats.used / (1024 ** 3)
    
    local_exists = os.path.exists(settings.LOCAL_MODEL_PATH)
    
    return ModelInfoResponse(
        model_name=os.path.basename(settings.LOCAL_MODEL_PATH),
        inference_mode="local",
        status="loaded" if status_info.get("initialized") else "loading",
        memory_usage_gb=round(used_gb, 2),
        total_memory_gb=round(total_gb, 2),
        local_model_exists=local_exists,
        local_model_path=settings.LOCAL_MODEL_PATH,
        device=status_info.get("device", "CPU")
    )

# Serve Frontend static assets if available (production mode)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
    logger.info(f"Frontend dist found. Serving frontend from {frontend_dir}")
else:
    logger.warning(f"Frontend dist not found at {frontend_dir}. Running API-only server mode.")
