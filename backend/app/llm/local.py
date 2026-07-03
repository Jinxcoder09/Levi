import os
import sys
import logging
import asyncio
from typing import AsyncIterator, List, Dict, Any, Optional
from backend.app.llm.base import BaseLLMProvider
from backend.app.config import settings

logger = logging.getLogger(__name__)

# Safe imports for environment portability
try:
    from llama_cpp import Llama
except ImportError:
    Llama = None
    logger.warning("llama-cpp-python is not installed. Local inference will be unavailable.")

class LocalLLMProvider(BaseLLMProvider):
    def __init__(self):
        self.llm = None
        self.initialized = False
        self.model_path = os.path.abspath(settings.LOCAL_MODEL_PATH)
        self.context_length = settings.DEFAULT_CONTEXT_LENGTH

    async def initialize(self) -> bool:
        if self.initialized:
            return True

        if Llama is None:
            logger.error("Cannot initialize LocalLLMProvider: llama-cpp-python not installed.")
            return False

        if not os.path.exists(self.model_path):
            logger.error(f"Local GGUF model file not found at: {self.model_path}")
            return False

        try:
            # Determine thread count (default to CPU cores minus 1, min 1)
            threads = max(1, (os.cpu_count() or 2) - 1)
            
            logger.info(f"Loading local model from {self.model_path} with {threads} threads and context {self.context_length}...")
            
            # Since loading the model blocks, run it in a separate thread to keep event loop active
            def load_model():
                return Llama(
                    model_path=self.model_path,
                    n_ctx=self.context_length,
                    n_threads=threads,
                    verbose=settings.DEBUG
                )
            
            self.llm = await asyncio.to_thread(load_model)
            self.initialized = True
            logger.info("Local model successfully loaded!")
            return True
        except Exception as e:
            logger.error(f"Failed to load local model: {e}", exc_info=True)
            self.initialized = False
            self.llm = None
            return False

    def _format_prompt(self, prompt: str, system_prompt: Optional[str] = None, messages: Optional[List[Dict[str, str]]] = None) -> str:
        # Build standard Qwen ChatML prompt format
        formatted = ""
        
        # Determine system prompt
        sys_p = system_prompt or "You are Qwen, a helpful, precise, and state-of-the-art AI programming assistant."
        
        # Check if messages already contain a system prompt
        has_system = any(m.get("role") == "system" for m in messages) if messages else False
        if not has_system:
            formatted += f"<|im_start|>system\n{sys_p}<|im_end|>\n"
            
        if messages:
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                formatted += f"<|im_start|>{role}\n{content}<|im_end|>\n"
        else:
            # If no chat history is provided, construct a simple message pair
            formatted += f"<|im_start|>user\n{prompt}<|im_end|>\n"
            
        formatted += "<|im_start|>assistant\n"
        return formatted

    async def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 0.9,
    ) -> Dict[str, Any]:
        if not await self.initialize():
            raise RuntimeError("Local LLM provider is not initialized.")

        formatted_prompt = self._format_prompt(prompt, system_prompt, messages)
        
        def run_inference():
            return self.llm(
                prompt=formatted_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop=["<|im_end|>", "<|im_start|>", "im_end", "im_start"],
            )

        response = await asyncio.to_thread(run_inference)
        
        content = response["choices"][0]["text"]
        prompt_tokens = response["usage"]["prompt_tokens"]
        completion_tokens = response["usage"]["completion_tokens"]
        
        return {
            "content": content,
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens
            }
        }

    async def generate_stream(
        self, 
        prompt: str,
        system_prompt: Optional[str] = None,
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 0.9,
    ) -> AsyncIterator[str]:
        if not await self.initialize():
            raise RuntimeError("Local LLM provider is not initialized.")

        formatted_prompt = self._format_prompt(prompt, system_prompt, messages)
        
        # Generator for streaming
        def run_stream():
            return self.llm(
                prompt=formatted_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop=["<|im_end|>", "<|im_start|>", "im_end", "im_start"],
                stream=True
            )
            
        stream = await asyncio.to_thread(run_stream)
        
        async def async_generator():
            for chunk in stream:
                text = chunk["choices"][0]["text"]
                if text:
                    yield text
                    # Yield CPU control to event loop
                    await asyncio.sleep(0)
                    
        return async_generator()

    def get_info(self) -> Dict[str, Any]:
        return {
            "provider_name": "local",
            "initialized": self.initialized,
            "model_path": self.model_path,
            "context_length": self.context_length,
            "device": "CPU"  # Llama.cpp runs on CPU in basic config, can use GPU via CUDA wrappers
        }
