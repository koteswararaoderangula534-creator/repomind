"""Impact analysis and blast radius calculation endpoints."""

from pathlib import Path
from fastapi import APIRouter
from app.core.store import repo_store
from app.models.common import success_response
from app.models.impact import ImpactAnalysisRequest
from app.services.impact_service import impact_service

router = APIRouter(prefix="/repositories", tags=["Impact Analysis"])


@router.post("/{repo_id}/impact")
def analyze_impact(repo_id: str, payload: ImpactAnalysisRequest):
    """
    Computes static impact, caller graph, affected files, and blast radius score
    for a chosen function or entity.
    """
    session = repo_store.get_session(repo_id)

    ast_data = session.ast_data if session else {}
    relative_files = [session.workspace_path / Path(k) for k in ast_data.keys()] if session else []

    impact_res = impact_service.analyze_impact(
        entity_name=payload.entity,
        target_file=payload.file,
        relative_files=relative_files,
        ast_data_by_file=ast_data,
    )

    return success_response(impact_res.model_dump())
