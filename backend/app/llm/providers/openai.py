"""OpenAI LLM provider implementation via standard REST API."""

import os
import json
import httpx
from typing import TypeVar, Type, Optional
from pydantic import BaseModel, ValidationError
from app.core.logging import get_logger
from app.llm.base import LLMProvider

logger = get_logger("llm.openai")
T = TypeVar("T", bound=BaseModel)

OPENAI_API_BASE = "https://api.openai.com/v1/chat/completions"


class OpenAIProvider(LLMProvider):
    """OpenAI compatible provider (supporting GPT-4o, GPT-4o-mini, etc.)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
    ):
        self._api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("LLM_MODEL", "gpt-4o-mini")
        self.timeout = timeout_seconds

    @property
    def name(self) -> str:
        return "openai"

    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.startswith("sk-"))

    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1500,
    ) -> str:
        if not self.is_configured():
            raise ValueError("OpenAI API key is not configured in environment.")

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(OPENAI_API_BASE, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: Type[T],
        temperature: float = 0.2,
    ) -> T:
        if not self.is_configured():
            raise ValueError("OpenAI API key is not configured in environment.")

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(OPENAI_API_BASE, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"].strip()

        parsed = json.loads(raw_text)
        return schema.model_validate(parsed)

    async def health_check(self) -> bool:
        if not self.is_configured():
            return False
        try:
            headers = {"Authorization": f"Bearer {self._api_key}"}
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get("https://api.openai.com/v1/models", headers=headers)
                return res.status_code == 200
        except Exception:
            return False
