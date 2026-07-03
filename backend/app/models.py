from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    stream: Optional[bool] = True

class CompletionRequest(BaseModel):
    prefix: str
    suffix: Optional[str] = ""
    language: Optional[str] = "python"
    max_tokens: Optional[int] = 128
    temperature: Optional[float] = 0.2
    stream: Optional[bool] = False

class ChatResponseChunk(BaseModel):
    content: str
    done: bool = False
    usage: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    id: str
    content: str
    usage: Dict[str, Any]
    model: str
