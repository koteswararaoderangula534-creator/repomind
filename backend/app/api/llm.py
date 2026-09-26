"""Grounded LLM intelligence API routes."""

from typing import Optional
from fastapi import APIRouter, Query
from app.core.store import repo_store
from app.models.common import success_response
from app.llm.schemas import (
    AskLLMRequest,
    ExplainCodeRequest,
    ImpactExplainRequest,
    RefactorExplainRequest,
)
from app.llm.grounding import grounding_service
from app.llm.provider import list_available_providers

router = APIRouter(prefix="/llm", tags=["LLM Intelligence"])


@router.get("/status")
async def get_llm_status(provider: Optional[str] = Query(None, description="Optional provider override")):
    """Returns the operational status, health, and configuration state of the LLM layer."""
    status = await grounding_service.get_status(provider_name=provider)
    return success_response(status.model_dump())


@router.get("/providers")
def get_available_providers():
    """Lists supported LLM providers and their configuration status."""
    providers = list_available_providers()
    return success_response({"providers": providers})


@router.post("/chat")
async def ask_grounded_llm(payload: AskLLMRequest):
    """
    Submits a developer query to the Grounded LLM Intelligence Layer.
    Applies strict anti-hallucination boundaries and falls back to deterministic AST reasoning if offline.
    """
    session = repo_store.get_session(payload.repository_id)
    response = await grounding_service.answer_grounded_query(
        session=session,
        query=payload.question,
        mode=payload.mode,
        audience=payload.audience,
        target_symbol=payload.target_symbol,
        target_file=payload.target_file,
    )
    return success_response(response.model_dump())


@router.post("/explain")
async def explain_code(payload: ExplainCodeRequest):
    """Explains a specific source file or symbol with grounded citations."""
    session = repo_store.get_session(payload.repository_id)
    query = f"Explain the structure and purpose of {payload.symbol or payload.file} in {payload.file}."
    response = await grounding_service.answer_grounded_query(
        session=session,
        query=query,
        mode="explain",
        audience=payload.audience,
        target_symbol=payload.symbol,
        target_file=payload.file,
    )
    return success_response(response.model_dump())


@router.post("/impact-explain")
async def explain_impact(payload: ImpactExplainRequest):
    """
    Explains the structural blast radius and risk consequences of changing a function or symbol.
    Integrates authoritative risk scores from RepoMind's Risk Engine.
    """
    session = repo_store.get_session(payload.repository_id)
    query = f"What is the impact and blast radius if I refactor or change the symbol `{payload.symbol}`?"
    response = await grounding_service.answer_grounded_query(
        session=session,
        query=query,
        mode="impact",
        audience=payload.audience,
        target_symbol=payload.symbol,
        target_file=payload.file,
    )
    return success_response(response.model_dump())


@router.post("/refactor-explain")
async def explain_refactor(payload: RefactorExplainRequest):
    """
    Explains proposed decomposition, Single Responsibility isolation, and behavioral verification for a symbol.
    """
    session = repo_store.get_session(payload.repository_id)
    query = f"Explain how to safely refactor `{payload.target_function}` into decoupled helper functions while preserving behavior."
    response = await grounding_service.answer_grounded_query(
        session=session,
        query=query,
        mode="refactor",
        audience=payload.audience,
        target_symbol=payload.target_function,
        target_file=payload.file,
    )
    return success_response(response.model_dump())
