from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Dict, Any, Optional

class BaseLLMProvider(ABC):
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the LLM provider. Returns True if successful."""
        pass

    @abstractmethod
    async def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 0.9,
    ) -> Dict[str, Any]:
        """
        Execute non-streaming completion.
        Returns a dict with format: { "content": str, "usage": dict }
        """
        pass

    @abstractmethod
    async def generate_stream(
        self, 
        prompt: str,
        system_prompt: Optional[str] = None,
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 0.9,
    ) -> AsyncIterator[str]:
        """
        Execute streaming completion.
        Yields text chunks.
        """
        pass

    @abstractmethod
    def get_info(self) -> Dict[str, Any]:
        """Return diagnostic and config information for the provider."""
        pass
