import os
import logging
from typing import AsyncIterator, Dict, Any, Optional
from backend.app.llm.base import BaseLLMProvider
from backend.app.llm.local import LocalLLMProvider

logger = logging.getLogger(__name__)

class LLMManager:
    def __init__(self):
        self.provider: Optional[BaseLLMProvider] = None

    async def setup_provider(self):
        logger.info("Initializing local provider...")
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
        p = await self.get_active_provider()
        return p.get_info()

llm_manager = LLMManager()
