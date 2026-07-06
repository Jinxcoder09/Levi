import os
import logging
import asyncio
from typing import AsyncIterator, List, Dict, Any, Optional
from backend.app.llm.base import BaseLLMProvider
from backend.app.config import settings

logger = logging.getLogger(__name__)

try:
    from llama_cpp import Llama
except ImportError:
    Llama = None

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
            logger.error("llama-cpp-python not installed.")
            return False
        if not os.path.exists(self.model_path):
            logger.error(f"Model not found: {self.model_path}")
            return False

        try:
            threads = max(1, os.cpu_count() or 2)
            logger.info(
                f"Loading model: {self.model_path} | "
                f"ctx={self.context_length} threads={threads} "
                f"mmap=true mlock=false n_batch=512"
            )

            def load_model():
                return Llama(
                    model_path=self.model_path,
                    n_ctx=self.context_length,
                    n_threads=threads,
                    n_batch=512,
                    n_gpu_layers=0,
                    use_mmap=True,
                    use_mlock=False,
                    verbose=False,
                )

            self.llm = await asyncio.to_thread(load_model)
            self.initialized = True

            model_size_mb = os.path.getsize(self.model_path) / (1024 * 1024)
            logger.info(f"Model loaded ({model_size_mb:.0f}MB on disk, "
                        f"memory-mapped: ~{model_size_mb * 0.1:.0f}MB RSS per active page)")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.initialized = False
            self.llm = None
            return False

    def _format_prompt(self, prompt: str, system_prompt: Optional[str] = None,
                       messages: Optional[List[Dict[str, str]]] = None) -> str:
        formatted = ""
        sys_p = system_prompt or "You are a helpful AI coding assistant."
        has_system = any(m.get("role") == "system" for m in messages) if messages else False
        if not has_system:
            formatted += f"<|im_start|>system\n{sys_p}<|im_end|>\n"
        if messages:
            for msg in messages:
                formatted += f"<|im_start|>{msg['role']}\n{msg['content']}<|im_end|>\n"
        else:
            formatted += f"<|im_start|>user\n{prompt}<|im_end|>\n"
        formatted += "<|im_start|>assistant\n"
        return formatted

    async def generate(self, prompt: str, system_prompt: Optional[str] = None,
                       messages: Optional[List[Dict[str, str]]] = None,
                       temperature: float = 0.7, max_tokens: int = 512,
                       top_p: float = 0.9) -> Dict[str, Any]:
        if not await self.initialize():
            raise RuntimeError("Local LLM not initialized.")
        formatted = self._format_prompt(prompt, system_prompt, messages)

        def run():
            return self.llm(prompt=formatted, max_tokens=max_tokens,
                            temperature=temperature, top_p=top_p,
                            stop=["<|im_end|>", "<|im_start|>"])

        response = await asyncio.to_thread(run)
        return {
            "content": response["choices"][0]["text"],
            "usage": {
                "prompt_tokens": response["usage"]["prompt_tokens"],
                "completion_tokens": response["usage"]["completion_tokens"],
                "total_tokens": response["usage"]["prompt_tokens"] + response["usage"]["completion_tokens"]
            }
        }

    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None,
                              messages: Optional[List[Dict[str, str]]] = None,
                              temperature: float = 0.7, max_tokens: int = 512,
                              top_p: float = 0.9) -> AsyncIterator[str]:
        if not await self.initialize():
            raise RuntimeError("Local LLM not initialized.")
        formatted = self._format_prompt(prompt, system_prompt, messages)

        def run_stream():
            return self.llm(prompt=formatted, max_tokens=max_tokens,
                            temperature=temperature, top_p=top_p,
                            stop=["<|im_end|>", "<|im_start|>"], stream=True)

        stream = await asyncio.to_thread(run_stream)

        async def async_gen():
            for chunk in stream:
                text = chunk["choices"][0]["text"]
                if text:
                    yield text
                    await asyncio.sleep(0)

        return async_gen()

    def get_info(self) -> Dict[str, Any]:
        return {
            "provider": "local",
            "initialized": self.initialized,
            "model_path": self.model_path,
            "context_length": self.context_length,
        }
