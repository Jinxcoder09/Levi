import os
import logging
import asyncio
from typing import AsyncIterator, Dict, Any, Optional
from backend.app.llm.base import BaseLLMProvider
from backend.app.llm.local import LocalLLMProvider
from backend.app.config import settings

logger = logging.getLogger(__name__)

MODEL_REPO = "bartowski/SmolLM2-360M-Instruct-GGUF"
MODEL_FILE = "SmolLM2-360M-Instruct-Q4_K_M.gguf"


class LLMManager:
    def __init__(self):
        self.provider: Optional[BaseLLMProvider] = None

    async def ensure_model_downloaded(self) -> bool:
        model_path = os.path.abspath(settings.LOCAL_MODEL_PATH)
        if os.path.exists(model_path):
            logger.info(f"Model found at {model_path}")
            return True

        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        logger.info(f"Downloading {MODEL_FILE} (~180MB) from {MODEL_REPO}...")
        try:
            from huggingface_hub import hf_hub_download

            def download():
                return hf_hub_download(
                    repo_id=MODEL_REPO, filename=MODEL_FILE,
                    local_dir=os.path.dirname(model_path),
                    local_dir_use_symlinks=False,
                )

            await asyncio.to_thread(download)
            logger.info("Model download complete!")
            return True
        except Exception as e:
            logger.error(f"Model download failed: {e}")
            return False

    async def setup_provider(self):
        logger.info("Initializing local provider...")
        await self.ensure_model_downloaded()
        local = LocalLLMProvider()
        await local.initialize()
        self.provider = local
        return local

    async def get_active_provider(self) -> BaseLLMProvider:
        if not self.provider:
            await self.setup_provider()
        return self.provider

    async def generate(self, *args, **kwargs) -> Dict[str, Any]:
        p = await self.get_active_provider()
        return await p.generate(*args, **kwargs)

    async def generate_stream(self, *args, **kwargs) -> AsyncIterator[str]:
        p = await self.get_active_provider()
        return await p.generate_stream(*args, **kwargs)

    async def get_status_info(self) -> Dict[str, Any]:
        if self.provider:
            return self.provider.get_info()
        return {
            "provider": "none",
            "initialized": False,
            "model_path": os.path.abspath(settings.LOCAL_MODEL_PATH),
            "context_length": settings.DEFAULT_CONTEXT_LENGTH,
        }


llm_manager = LLMManager()
