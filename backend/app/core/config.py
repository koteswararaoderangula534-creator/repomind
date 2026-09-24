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


settings = Settings()
