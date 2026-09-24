"""Security guardrails, URL validation, and path traversal prevention."""

import os
import re
from pathlib import Path
from urllib.parse import urlparse
from app.core.config import settings

# Supported Git URL patterns: https://github.com/owner/repo(.git)? or local paths for development
GITHUB_URL_PATTERN = re.compile(
    r"^https://github\.com/(?P<owner>[a-zA-Z0-9_.-]+)/(?P<repo>[a-zA-Z0-9_.-]+?)(?:\.git)?/?$"
)


def validate_repository_source(source: str) -> dict[str, str]:
    """
    Validates a repository URL or local development directory.
    Returns parsed metadata {type, owner, repo, clean_url, branch}.
    Raises ValueError on invalid source.
    """
    cleaned = source.strip()
    if not cleaned:
        raise ValueError("Repository source cannot be empty.")

    # 1. Check if local directory exists (for development & offline testing)
    local_path = Path(cleaned)
    if local_path.is_dir() and local_path.exists():
        repo_name = local_path.name
        return {
            "type": "local",
            "owner": "local-dev",
            "repo": repo_name,
            "clean_url": str(local_path.resolve()),
            "default_branch": "main",
        }

    # 2. Match GitHub URL
    match = GITHUB_URL_PATTERN.match(cleaned)
    if match:
        owner = match.group("owner")
        repo = match.group("repo")
        clean_url = f"https://github.com/{owner}/{repo}"
        return {
            "type": "github",
            "owner": owner,
            "repo": repo,
            "clean_url": clean_url,
            "default_branch": "main",
        }

    raise ValueError(
        f"Invalid repository source '{cleaned}'. Please provide a valid GitHub repository URL "
        f"(e.g., https://github.com/owner/repository) or an existing local directory."
    )


def assert_safe_path(base_dir: Path | str, target_path: Path | str) -> Path:
    """
    Validates that target_path strictly resolves within base_dir.
    Guards against path traversal attacks (e.g., ../../../etc/passwd).
    Returns resolved safe Path.
    """
    base = Path(base_dir).resolve()
    target = (base / target_path).resolve() if not Path(target_path).is_absolute() else Path(target_path).resolve()

    try:
        target.relative_to(base)
    except ValueError:
        raise PermissionError(f"Path traversal detected: {target_path} is outside workspace {base_dir}")

    return target


def is_safe_source_file(file_path: Path) -> bool:
    """Returns True if the file should be included in static analysis."""
    # Skip hidden files
    if file_path.name.startswith(".") and file_path.name not in (".env.example", ".env.sample"):
        return False

    # Exclude common non-source and virtual environment folders
    ignored_dirs = {
        "node_modules",
        "venv",
        ".venv",
        "env",
        "__pycache__",
        ".git",
        ".github",
        ".idea",
        ".vscode",
        "dist",
        "build",
        "target",
        ".next",
        ".cache",
        ".pytest_cache",
    }
    if any(part in ignored_dirs for part in file_path.parts):
        return False

    # Exclude binary / image / media extensions
    ignored_extensions = {
        ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
        ".pdf", ".zip", ".tar", ".gz", ".7z", ".exe", ".dll", ".so", ".dylib",
        ".pyc", ".pyo", ".pyd", ".db", ".sqlite", ".sqlite3", ".bin", ".mp4", ".mp3"
    }
    if file_path.suffix.lower() in ignored_extensions:
        return False

    # Check file size limit
    try:
        if file_path.stat().st_size > settings.MAX_FILE_SIZE_BYTES:
            return False
    except OSError:
        return False

    return True
