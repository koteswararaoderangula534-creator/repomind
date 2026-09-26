"""Factory and registry for LLM providers."""

import os
from typing import Optional, Dict
from app.llm.base import LLMProvider
from app.llm.providers.google import GoogleGeminiProvider
from app.llm.providers.openai import OpenAIProvider
from app.llm.providers.anthropic import AnthropicProvider
from app.core.logging import get_logger

logger = get_logger("llm.provider")

_PROVIDERS: Dict[str, type[LLMProvider]] = {
    "gemini": GoogleGeminiProvider,
    "google": GoogleGeminiProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "claude": AnthropicProvider,
}

_instances: Dict[str, LLMProvider] = {}


def get_llm_provider(name: Optional[str] = None) -> LLMProvider:
    """Returns an instantiated LLM provider.
    
    If name is not specified, reads from LLM_PROVIDER env var (default: 'gemini').
    """
    provider_key = (name or os.getenv("LLM_PROVIDER", "gemini")).lower()
    
    # Normalize aliases
    if provider_key in ("google", "gemini"):
        canonical_key = "gemini"
    elif provider_key in ("anthropic", "claude"):
        canonical_key = "anthropic"
    elif provider_key == "openai":
        canonical_key = "openai"
    else:
        logger.warning(f"Unknown LLM provider '{provider_key}', defaulting to 'gemini'")
        canonical_key = "gemini"

    if canonical_key not in _instances:
        provider_cls = _PROVIDERS.get(canonical_key, GoogleGeminiProvider)
        _instances[canonical_key] = provider_cls()
        logger.info(f"Initialized LLM provider: {canonical_key} (configured={_instances[canonical_key].is_configured()})")

    return _instances[canonical_key]


def list_available_providers() -> list[dict]:
    """Returns list of all supported providers and their configuration status."""
    results = []
    for key, cls in [("gemini", GoogleGeminiProvider), ("openai", OpenAIProvider), ("anthropic", AnthropicProvider)]:
        instance = cls()
        results.append({
            "id": key,
            "configured": instance.is_configured(),
            "model": instance.model,
        })
    return results
