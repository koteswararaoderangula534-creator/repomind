"""Ask RepoMind AI and architectural Q&A endpoints."""

from pathlib import Path
from fastapi import APIRouter
from app.core.store import repo_store
from app.models.common import success_response
from app.models.ask import AskRequest
from app.services.reasoning_service import reasoning_service

router = APIRouter(prefix="/repositories", tags=["Ask AI"])


@router.post("/{repo_id}/ask")
def ask_repomind(repo_id: str, payload: AskRequest):
    """
    Evaluates developer natural-language queries against repository structure,
    returning structured technical and junior-friendly explanations with source references.
    """
    session = repo_store.get_session(repo_id)

    ast_data = session.ast_data if session else {}
    relative_files = [session.workspace_path / Path(k) for k in ast_data.keys()] if session else []

    answer = reasoning_service.answer_query(
        query=payload.query,
        relative_files=relative_files,
        ast_data_by_file=ast_data,
    )

    return success_response(answer.model_dump())
