"""Repository ingestion, scanning, and overview endpoints."""

import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.core.logging import get_logger
from app.core.store import repo_store, AnalyzedRepositorySession
from app.models.common import success_response, error_response
from app.models.repository import (
    AnalyzeRequest,
    RepositoryOverview,
    FindingsBreakdown,
)
from app.services.repository_service import repository_service
from app.services.scanner_service import scanner_service
from app.services.ast_service import ast_service
from app.services.health_service import health_service
from app.services.architecture_service import architecture_service
from app.services.forensic_service import forensic_service

router = APIRouter(prefix="/repositories", tags=["Repositories"])
logger = get_logger("api.repositories")


@router.post("/analyze")
def analyze_repository(payload: AnalyzeRequest):
    """
    Ingests, safely clones or downloads, parses AST, and analyzes a repository.
    Returns the complete repository overview contract.
    """
    start_time = time.time()
    logger.info(f"Initiating repository analysis for: {payload.url} (branch: {payload.branch})")

    try:
        # 1. Fetch repository into an isolated workspace
        ws, meta = repository_service.clone_or_fetch(payload.url, payload.branch)
    except Exception as e:
        logger.error(f"Failed to clone/fetch repository: {e}")
        return error_response(
            code="INGESTION_ERROR",
            message=f"Failed to fetch repository: {str(e)}",
        )

    try:
        # 2. Scan workspace files and calculate structural metrics
        scan_res = scanner_service.scan_workspace(ws.path)
        relative_files = scan_res["relative_files"]
        metrics = scan_res["metrics"]
        layers = scan_res["layers"]

        # 3. Parse AST for Python files
        ast_data_by_file = {}
        for rel_file in relative_files:
            if rel_file.suffix == ".py":
                rel_str = str(rel_file).replace("\\", "/")
                abs_file = ws.path / rel_file
                ast_data_by_file[rel_str] = ast_service.parse_python_file(abs_file, rel_str)

        # 4. Deterministic Code Health Analysis
        findings = health_service.analyze_repository(ws.path, relative_files, ast_data_by_file)

        # 5. Populate findings breakdown into metrics
        high_count = sum(1 for f in findings if f.severity == "HIGH")
        med_count = sum(1 for f in findings if f.severity == "MEDIUM")
        low_count = sum(1 for f in findings if f.severity == "LOW")

        metrics.findingsCount = len(findings)
        metrics.findingsBreakdown = FindingsBreakdown(
            high=high_count,
            medium=med_count,
            low=low_count,
        )

        # 6. Build interactive architecture graph
        arch_graph = architecture_service.build_architecture_graph(
            repo_name=meta["repo"],
            relative_files=relative_files,
            ast_data_by_file=ast_data_by_file,
        )

        # 7. Construct RepositoryOverview
        elapsed_str = f"{time.time() - start_time:.1f}s"
        now_str = datetime.now(timezone.utc).strftime("Today at %H:%M UTC")

        repo_id = f"repo-{meta['owner']}-{meta['repo']}".lower().replace("_", "-")
        overview = RepositoryOverview(
            id=repo_id,
            name=f"{meta['owner']}/{meta['repo']}",
            url=meta["clean_url"],
            branch=meta["branch"],
            commit=meta["commit"],
            primaryLanguage=scan_res["primary_language"],
            secondaryLanguage=scan_res["secondary_language"],
            lastAnalyzed=now_str,
            analysisDuration=elapsed_str,
            status="Analyzed",
            metrics=metrics,
            layers=layers,
        )

        # 8. Deep Forensic Repository & Database Analysis
        forensic_report = forensic_service.analyze_workspace(
            workspace_path=ws.path,
            relative_files=relative_files,
            ast_data_by_file=ast_data_by_file,
            supabase_url=payload.supabase_url,
            repo_name=meta["repo"],
            repo_id=repo_id,
        )

        # 9. Store session in memory
        session = AnalyzedRepositorySession(
            overview=overview,
            workspace_path=ws.path,
            architecture=arch_graph,
            findings=findings,
            ast_data=ast_data_by_file,
            forensic_report=forensic_report,
        )
        repo_store.put_session(session)

        return success_response(overview.model_dump())

    except Exception as e:
        logger.error(f"Error during repository analysis: {e}", exc_info=True)
        return error_response(
            code="ANALYSIS_ERROR",
            message=f"Analysis pipeline error: {str(e)}",
        )


@router.get("/recent")
def get_recent_repositories():
    """Returns the list of recently analyzed repositories."""
    recent_list = repo_store.list_recent()
    return success_response([item.model_dump() for item in recent_list])


@router.get("/{repo_id}/overview")
def get_repository_overview(repo_id: str):
    """Retrieves cached overview metrics for an analyzed repository."""
    session = repo_store.get_session(repo_id)
    if not session:
        return error_response(
            code="REPO_NOT_FOUND",
            message=f"Repository '{repo_id}' has not been analyzed yet. Run POST /api/repositories/analyze first.",
        )
    return success_response(session.overview.model_dump())
