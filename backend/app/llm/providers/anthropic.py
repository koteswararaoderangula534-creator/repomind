"""Anthropic Claude LLM provider implementation via standard REST API."""

import os
import json
import re
import httpx
from typing import TypeVar, Type, Optional
from pydantic import BaseModel, ValidationError
from app.core.logging import get_logger
from app.llm.base import LLMProvider

logger = get_logger("llm.anthropic")
T = TypeVar("T", bound=BaseModel)

ANTHROPIC_API_BASE = "https://api.anthropic.com/v1/messages"


class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider (supporting Claude 3.5 Sonnet, Claude 3 Haiku, etc.)."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
    ):
        self._api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model or os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")
        self.timeout = timeout_seconds

    @property
    def name(self) -> str:
        return "anthropic"

    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.startswith("sk-ant-"))

    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1500,
    ) -> str:
        if not self.is_configured():
            raise ValueError("Anthropic API key is not configured in environment.")

        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(ANTHROPIC_API_BASE, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            contents = data.get("content", [])
            for block in contents:
                if block.get("type") == "text":
                    return block.get("text", "").strip()
            return ""

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: Type[T],
        temperature: float = 0.2,
    ) -> T:
        if not self.is_configured():
            raise ValueError("Anthropic API key is not configured in environment.")

        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        json_instruction = (
            f"\n\nCRITICAL: Respond ONLY with a valid JSON object strictly matching this schema:\n"
            f"{schema_json}\n"
            f"Do not include any commentary, notes, markdown formatting, or explanations outside the JSON object."
        )

        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model,
            "system": system_prompt + json_instruction,
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": 2048,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(ANTHROPIC_API_BASE, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = ""
            for block in data.get("content", []):
                if block.get("type") == "text":
                    raw_text = block.get("text", "").strip()
                    break

        # Extract JSON from potential code block
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
        if match:
            clean_json = match.group(1)
        else:
            clean_json = raw_text.strip()

        parsed = json.loads(clean_json)
        return schema.model_validate(parsed)

    async def health_check(self) -> bool:
        if not self.is_configured():
            return False
        try:
            # Perform a minimal generation test
            res = await self.generate("ping", "respond with pong", max_tokens=10)
            return len(res) > 0
        except Exception:
            return False
