"""Refactoring plan and diff viewer endpoints."""

from fastapi import APIRouter
from app.core.store import repo_store
from app.models.common import success_response
from app.models.refactor import RefactorRequest
from app.services.refactor_service import refactor_service
from app.services.diff_service import diff_service

router = APIRouter(prefix="/repositories", tags=["Refactor"])


@router.post("/{repo_id}/refactor")
def generate_refactor_plan(repo_id: str, payload: RefactorRequest):
    """Generates a safe step-by-step refactoring decomposition plan."""
    session = repo_store.get_session(repo_id)

    plan = refactor_service.generate_plan(
        finding_id=payload.finding_id,
        target_function=payload.target_function,
        file_path=payload.file,
    )

    # Generate and cache corresponding diff
    diff_data = diff_service.generate_diff(
        file_path=plan.file,
        original_code=plan.originalCode,
        refactored_code=plan.refactoredCode,
    )

    if session:
        session.refactor_plans[plan.id] = plan
        session.diffs[plan.id] = diff_data

    return success_response(plan.model_dump())


@router.get("/{repo_id}/diff/{refactor_id}")
def get_refactor_diff(repo_id: str, refactor_id: str):
    """Retrieves unified line-by-line diff data for a refactoring plan."""
    session = repo_store.get_session(repo_id)

    if session and refactor_id in session.diffs:
        return success_response(session.diffs[refactor_id].model_dump())

    # Fallback to default refactor diff
    plan = refactor_service.generate_plan()
    diff_data = diff_service.generate_diff(
        file_path=plan.file,
        original_code=plan.originalCode,
        refactored_code=plan.refactoredCode,
    )
    return success_response(diff_data.model_dump())
