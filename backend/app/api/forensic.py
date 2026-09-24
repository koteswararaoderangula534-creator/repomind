"""
Forensic Repository and Database Relationship Analysis Endpoints.
"""

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.core.store import repo_store
from app.models.common import success_response, error_response
from app.services.forensic_service import forensic_service

router = APIRouter(prefix="/repositories", tags=["Forensic Analysis"])


class ForensicTriggerRequest(BaseModel):
    """Optional payload to trigger or re-run forensic analysis with external parameters."""
    supabase_url: Optional[str] = Field(None, description="External Supabase project URL to validate")


@router.get("/{repo_id}/forensic")
def get_forensic_report(repo_id: str):
    """
    Retrieves the complete deep forensic analysis report for an analyzed repository.
    Includes database detection, discrete read/write operations, data-flows,
    integrity anti-patterns, concurrency timelines, and root-cause trees.
    """
    session = repo_store.get_session(repo_id)
    if not session and not repo_store.get_current_id():
        from app.main import populate_demo_repository
        populate_demo_repository()
        session = repo_store.get_session(repo_id)

    if not session:
        return error_response(
            code="NOT_FOUND",
            message=f"Repository '{repo_id}' not found in active session store.",
        )

    if session.forensic_report:
        return success_response(session.forensic_report.model_dump())

    # Generate on-demand if not already generated
    try:
        report = forensic_service.analyze_workspace(
            workspace_path=session.workspace_path,
            relative_files=list(session.workspace_path.rglob("*")) if session.workspace_path.exists() else [],
            ast_data_by_file=session.ast_data,
            repo_name=session.overview.name,
            repo_id=session.overview.id,
        )
        session.forensic_report = report
        return success_response(report.model_dump())
    except Exception as e:
        return error_response(
            code="FORENSIC_ANALYSIS_ERROR",
            message=f"Failed to generate forensic report: {str(e)}",
        )


@router.post("/{repo_id}/forensic")
def trigger_forensic_analysis(repo_id: str, payload: Optional[ForensicTriggerRequest] = None):
    """
    Triggers or re-evaluates single-shot forensic analysis on a repository,
    optionally verifying against a user-supplied Supabase URL.
    """
    session = repo_store.get_session(repo_id)
    if not session and not repo_store.get_current_id():
        from app.main import populate_demo_repository
        populate_demo_repository()
        session = repo_store.get_session(repo_id)

    if not session:
        return error_response(
            code="NOT_FOUND",
            message=f"Repository '{repo_id}' not found in active session store.",
        )

    supabase_url = payload.supabase_url if payload else None

    try:
        report = forensic_service.analyze_workspace(
            workspace_path=session.workspace_path,
            relative_files=list(session.workspace_path.rglob("*")) if session.workspace_path.exists() else [],
            ast_data_by_file=session.ast_data,
            supabase_url=supabase_url,
            repo_name=session.overview.name,
            repo_id=session.overview.id,
        )
        session.forensic_report = report
        return success_response(report.model_dump())
    except Exception as e:
        return error_response(
            code="FORENSIC_ANALYSIS_ERROR",
            message=f"Failed to execute forensic analysis: {str(e)}",
        )
