"""Ask RepoMind AI and architectural Q&A endpoints."""

from pathlib import Path
from fastapi import APIRouter
from app.core.store import repo_store
from app.models.common import success_response
from app.models.ask import AskRequest, AskResponse, SourceReference
from app.services.reasoning_service import reasoning_service
from app.llm.grounding import grounding_service
from app.llm.provider import get_llm_provider

router = APIRouter(prefix="/repositories", tags=["Ask AI"])


@router.post("/{repo_id}/ask")
async def ask_repomind(repo_id: str, payload: AskRequest):
    """
    Evaluates developer natural-language queries against repository structure.
    Leverages Grounded LLM reasoning if configured, with seamless deterministic fallback.
    """
    session = repo_store.get_session(repo_id)

    ast_data = session.ast_data if session else {}
    relative_files = [session.workspace_path / Path(k) for k in ast_data.keys()] if session else []

    # Get deterministic answer
    deterministic_answer = reasoning_service.answer_query(
        query=payload.query,
        relative_files=relative_files,
        ast_data_by_file=ast_data,
    )

    provider = get_llm_provider()
    if provider.is_configured():
        try:
            grounded_resp = await grounding_service.answer_grounded_query(
                session=session,
                query=payload.query,
                mode=payload.mode or "understand",
                audience=payload.audience or "senior",
                target_symbol=payload.target_symbol,
                target_file=payload.target_file,
            )

            # Convert grounded citations to SourceReference objects
            sources = []
            for ev in grounded_resp.evidence:
                sources.append(
                    SourceReference(
                        file=ev.file,
                        lines=f"{ev.line_start}–{ev.line_end}",
                        func=ev.symbol,
                        fullSnippet=ev.snippet or f"{ev.file}:{ev.line_start}",
                    )
                )
            if not sources:
                sources = deterministic_answer.sources

            tech_exp = grounded_resp.answer if payload.audience == "senior" else deterministic_answer.technicalExplanation
            jr_exp = grounded_resp.answer if payload.audience == "junior" else deterministic_answer.juniorExplanation

            response = AskResponse(
                id=grounded_resp.id,
                query=payload.query,
                category=f"Grounded AI ({grounded_resp.mode.title()})",
                technicalExplanation=tech_exp,
                juniorExplanation=jr_exp,
                flowSteps=deterministic_answer.flowSteps,
                sources=sources,
                affectedEntities=grounded_resp.related_symbols or deterministic_answer.affectedEntities,
                riskAssessment=(
                    f"{grounded_resp.impact.risk_level or 'MODERATE'} — Risk Score: {grounded_resp.impact.risk_score or 'N/A'}/100. "
                    f"{grounded_resp.impact.blast_radius_summary or ''}"
                ).strip(),
                summary=grounded_resp.summary,
                confidence=grounded_resp.confidence,
                is_llm_grounded=not grounded_resp.is_fallback,
                provider=grounded_resp.provider,
                model=grounded_resp.model,
                recommendations=grounded_resp.recommendations,
                limitations=grounded_resp.limitations,
            )
            return success_response(response.model_dump())
        except Exception:
            # Fall through to deterministic response on any issue
            pass

    return success_response(deterministic_answer.model_dump())
