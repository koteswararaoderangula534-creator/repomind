"""Architecture topology and dependency graph endpoints."""

from fastapi import APIRouter
from app.core.store import repo_store
from app.models.common import success_response, error_response
from app.services.architecture_service import architecture_service

router = APIRouter(prefix="/repositories", tags=["Architecture"])


@router.get("/{repo_id}/architecture")
def get_architecture(repo_id: str):
    """Returns the architectural layers, nodes, and inter-service edges."""
    session = repo_store.get_session(repo_id)

    if session and session.architecture:
        return success_response(session.architecture.model_dump(by_alias=True))

    # If repo session not found, build baseline architecture graph
    default_graph = architecture_service.build_architecture_graph(
        repo_name=repo_id,
        relative_files=[],
        ast_data_by_file={},
    )
    return success_response(default_graph.model_dump(by_alias=True))
