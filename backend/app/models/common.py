"""Common response models and standardized envelope."""

from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIError(BaseModel):
    """Standardized API Error payload."""
    code: str
    message: str
    details: Optional[dict[str, Any]] = None


class APIResponse(BaseModel, Generic[T]):
    """Standardized API envelope returned by all RepoMind endpoints."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[APIError] = None


def success_response(data: Any) -> dict:
    """Helper to return a success payload dict."""
    return {"success": True, "data": data, "error": None}


def error_response(code: str, message: str, details: Optional[dict[str, Any]] = None) -> dict:
    """Helper to return an error payload dict."""
    return {
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        }
    }
