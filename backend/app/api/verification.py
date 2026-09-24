"""Verification and automated safety test validation endpoints."""

from fastapi import APIRouter
from app.core.store import repo_store
from app.models.common import success_response
from app.models.verification import VerifyRequest
from app.services.verification_service import verification_service

router = APIRouter(prefix="/repositories", tags=["Verification"])


@router.post("/{repo_id}/verify")
def verify_refactor(repo_id: str, payload: VerifyRequest):
    """
    Executes automated test validation and comparative analysis
    to ensure refactoring introduces zero regressions.
    """
    session = repo_store.get_session(repo_id)

    result = verification_service.verify_refactoring(
        refactor_id=payload.refactor_id or "REF-ORDER-01",
        test_filter=payload.test_filter,
    )

    if session:
        session.verification_results[payload.refactor_id or "REF-ORDER-01"] = result

    return success_response(result.model_dump())
