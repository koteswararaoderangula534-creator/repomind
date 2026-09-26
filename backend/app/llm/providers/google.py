"""Google Gemini LLM provider implementation via standard REST API."""

import os
import json
import httpx
from typing import TypeVar, Type, Optional
from pydantic import BaseModel, ValidationError
from app.core.logging import get_logger
from app.llm.base import LLMProvider

logger = get_logger("llm.google")
T = TypeVar("T", bound=BaseModel)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class GoogleGeminiProvider(LLMProvider):
    """Google Gemini provider leveraging HTTP REST API with zero external SDK bloat."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
    ):
        self._api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = model or os.getenv("LLM_MODEL", "gemini-1.5-flash")
        self.timeout = timeout_seconds

    @property
    def name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1500,
    ) -> str:
        """Executes content generation via Gemini REST API."""
        if not self.is_configured():
            raise ValueError("Google Gemini API key is not configured in environment.")

        endpoint = f"{GEMINI_API_BASE}/{self.model}:generateContent?key={self._api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini API returned HTTP {resp.status_code}: {resp.text}")
                resp.raise_for_status()

            data = resp.json()
            try:
                candidate = data["candidates"][0]["content"]["parts"][0]["text"]
                return candidate.strip()
            except (KeyError, IndexError) as err:
                logger.error(f"Malformed Gemini response payload: {err}")
                raise ValueError("Received invalid candidate structure from Gemini API.")

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: Type[T],
        temperature: float = 0.2,
    ) -> T:
        """Generates and validates structured JSON conforming to a Pydantic schema with retry."""
        if not self.is_configured():
            raise ValueError("Google Gemini API key is not configured in environment.")

        endpoint = f"{GEMINI_API_BASE}/{self.model}:generateContent?key={self._api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json",
            },
        }

        # Attempt 1
        raw_text = ""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini API error ({resp.status_code}): {resp.text}")
                resp.raise_for_status()

            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Parse and validate JSON
        try:
            parsed_json = self._clean_and_parse_json(raw_text)
            return schema.model_validate(parsed_json)
        except (json.JSONDecodeError, ValidationError) as parse_err:
            logger.warning(f"First JSON validation attempt failed: {parse_err}. Retrying once with error feedback.")
            # Retry once with feedback
            retry_prompt = (
                f"{prompt}\n\n"
                f"CORRECTION NOTICE: Your previous output failed JSON validation with error:\n"
                f"{parse_err}\n"
                f"Output ONLY valid pure JSON conforming exactly to the required schema."
            )
            payload["contents"][0]["parts"][0]["text"] = retry_prompt

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                retry_resp = await client.post(endpoint, json=payload)
                retry_resp.raise_for_status()
                retry_data = retry_resp.json()
                retry_text = retry_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                retry_json = self._clean_and_parse_json(retry_text)
                return schema.model_validate(retry_json)

    async def health_check(self) -> bool:
        """Validates API key and model availability."""
        if not self.is_configured():
            return False
        try:
            endpoint = f"{GEMINI_API_BASE}/{self.model}:generateContent?key={self._api_key}"
            payload = {
                "contents": [{"parts": [{"text": "Health check. Respond with OK."}]}],
                "generationConfig": {"maxOutputTokens": 5},
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(endpoint, json=payload)
                return res.status_code == 200
        except Exception as err:
            logger.debug(f"Gemini health check failed: {err}")
            return False

    def _clean_and_parse_json(self, raw_text: str) -> dict:
        """Strips accidental markdown code fences and parses JSON safely."""
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
