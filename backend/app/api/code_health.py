"""Code health and static analysis findings endpoints."""

from typing import Optional
from fastapi import APIRouter, Query
from app.core.store import repo_store
from app.models.common import success_response, error_response
from app.services.health_service import health_service

router = APIRouter(prefix="/repositories", tags=["Code Health"])


@router.get("/{repo_id}/findings")
def get_code_health_findings(
    repo_id: str,
    severity: Optional[str] = Query(None, description="Filter by severity: HIGH, MEDIUM, LOW"),
    category: Optional[str] = Query(None, description="Filter by category: Security, Code Smells, Architecture, etc."),
):
    """Retrieves all static code health findings for a repository."""
    session = repo_store.get_session(repo_id)

    findings = session.findings if session else health_service._get_baseline_findings([])

    # Apply filters
    if severity and severity.upper() != "ALL":
        findings = [f for f in findings if f.severity.upper() == severity.upper()]

    if category and category.upper() != "ALL":
        findings = [f for f in findings if f.category.lower() == category.lower()]

    return success_response([f.model_dump() for f in findings])
