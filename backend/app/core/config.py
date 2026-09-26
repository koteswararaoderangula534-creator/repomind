import os
from pathlib import Path
from pydantic import BaseModel


class Settings:
    """RepoMind Backend Configuration Settings."""

    APP_NAME: str = "RepoMind Backend API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1")

    # API Configuration
    API_PREFIX: str = "/api"

    # CORS Allowed Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]

    # Workspace & Safety
    MAX_REPO_SIZE_MB: int = 50
    WORKSPACE_DIR: Path = Path(os.getenv("REPOMIND_WORKSPACE_DIR", Path.home() / ".repomind_workspaces"))
    WORKSPACE_TTL_SECONDS: int = 3600  # 1 hour workspace cache

    # Analysis Guardrails
    MAX_FILES_TO_ANALYZE: int = 2000
    MAX_FILE_SIZE_BYTES: int = 1_000_000  # 1 MB max per individual source file
    SUPPORTED_LANGUAGES: list[str] = ["Python", "JavaScript", "TypeScript", "Go", "JSON", "HTML", "CSS"]

    # Grounded LLM Intelligence Layer Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.0-flash")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.2"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
    LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "15.0"))
    LLM_CACHE_TTL_SECONDS: int = int(os.getenv("LLM_CACHE_TTL_SECONDS", "300"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")


settings = Settings()
