"""Abstract base interface for LLM providers."""

from abc import ABC, abstractmethod
from typing import TypeVar, Type, Optional
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class LLMProvider(ABC):
    """Abstract interface defining required LLM capabilities for RepoMind."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier (e.g., 'gemini', 'openai', 'anthropic')."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the provider has valid API credentials configured."""
        pass

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1500,
    ) -> str:
        """Generates raw text response from the model."""
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: Type[T],
        temperature: float = 0.2,
    ) -> T:
        """Generates and validates structured output conforming to a Pydantic schema."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Validates live connectivity and API key validity."""
        pass
