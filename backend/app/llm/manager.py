import os
import logging
import asyncio
from typing import AsyncIterator, Dict, Any, Optional
from backend.app.config import settings
from backend.app.llm.base import BaseLLMProvider
from backend.app.llm.local import LocalLLMProvider

logger = logging.getLogger(__name__)

class LLMManager:
    def __init__(self):
        self.provider: Optional[BaseLLMProvider] = None
        self.is_downloading: bool = False

    async def ensure_model_downloaded(self) -> bool:
        """Downloads the GGUF model file if not exists."""
        model_path = os.path.abspath(settings.LOCAL_MODEL_PATH)
        if os.path.exists(model_path):
            logger.info(f"Model file already exists at: {model_path}")
            return True

        # Ensure directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        self.is_downloading = True
        logger.info(f"Downloading model {settings.LOCAL_MODEL_FILE} from repo {settings.LOCAL_MODEL_REPO}...")
        
        try:
            from huggingface_hub import hf_hub_download
            
            def download_job():
                return hf_hub_download(
                    repo_id=settings.LOCAL_MODEL_REPO,
                    filename=settings.LOCAL_MODEL_FILE,
                    local_dir=os.path.dirname(model_path),
                    local_dir_use_symlinks=False
                )
            
            # Download model in background thread to not block the main application loop
            await asyncio.to_thread(download_job)
            logger.info("Model download complete!")
            self.is_downloading = False
            return True
        except Exception as e:
            logger.error(f"Failed to download model automatically: {e}", exc_info=True)
            self.is_downloading = False
            return False

    async def setup_provider(self) -> BaseLLMProvider:
        """
        Initializes the local LLM provider strictly.
        """
        logger.info("Setting up local provider for SmolLM2...")
        await self.ensure_model_downloaded()
        
        local = LocalLLMProvider()
        # Initialize in background, do not raise exception on failure to support diagnostics
        await local.initialize()
        self.provider = local
        return local

    async def get_active_provider(self) -> BaseLLMProvider:
        """Returns the active provider. Lazily initializes if needed."""
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
        """Returns diagnostic and current provider stats."""
        p = await self.get_active_provider()
        info = p.get_info()
        info.update({
            "configured_mode": "local",
            "active_mode": "local",
            "is_downloading": self.is_downloading
        })
        return info

# Instantiate global singleton manager
llm_manager = LLMManager()
