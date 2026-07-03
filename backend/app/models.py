from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message author (system, user, assistant)")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history including current prompt")
    temperature: Optional[float] = Field(None, description="Controls randomness (0.0 to 1.0)")
    max_tokens: Optional[int] = Field(None, description="Maximum number of tokens to generate")
    top_p: Optional[float] = Field(None, description="Nucleus sampling threshold")
    stream: Optional[bool] = Field(True, description="Whether to stream responses")

class CodeRequest(BaseModel):
    code: str = Field(..., description="The code snippet to process")
    language: Optional[str] = Field("python", description="Programming language of the code")
    context: Optional[str] = Field(None, description="Additional developer instructions or query context")
    temperature: Optional[float] = Field(None)
    max_tokens: Optional[int] = Field(None)
    stream: Optional[bool] = Field(True)

class CompletionRequest(BaseModel):
    prefix: str = Field(..., description="Code before the cursor position")
    suffix: Optional[str] = Field("", description="Code after the cursor position")
    language: Optional[str] = Field("python")
    max_tokens: Optional[int] = Field(128)
    temperature: Optional[float] = Field(0.2)
    stream: Optional[bool] = Field(False)

class ChatResponseChunk(BaseModel):
    content: str
    done: bool = False
    usage: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    id: str
    content: str
    usage: Dict[str, Any]
    model: str

class ModelInfoResponse(BaseModel):
    model_name: str
    inference_mode: str  # "local" or "huggingface"
    status: str          # "loaded", "error", "fallback"
    memory_usage_gb: float
    total_memory_gb: float
    local_model_exists: bool
    local_model_path: str
    device: str          # "cpu", "cuda", etc.
