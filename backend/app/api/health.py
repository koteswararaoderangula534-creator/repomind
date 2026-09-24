"""Health check and status API routes."""

import time
from fastapi import APIRouter
from app.core.config import settings
from app.models.common import success_response

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    """Returns the operational status of the RepoMind backend."""
    return success_response({
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": int(time.time()),
    })
