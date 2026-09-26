"""Grounding Service coordinating context retrieval, LLM generation, safety guards, and fallback."""

import time
import uuid
import hashlib
from typing import Optional, Any
from app.core.store import AnalyzedRepositorySession
from app.core.logging import get_logger
from app.llm.schemas import (
    StructuredLLMResponse,
    EvidenceItem,
    StructuredImpact,
    LLMStatusResponse,
)
from app.llm.safety import (
    redact_secrets,
    sanitize_code_for_prompt,
    validate_and_filter_citations,
)
from app.llm.prompts import (
    SYSTEM_PROMPT_BASE,
    MODE_INSTRUCTIONS,
    AUDIENCE_INSTRUCTIONS,
    STRUCTURED_OUTPUT_PROMPT,
)
from app.llm.context_builder import context_builder
from app.llm.provider import get_llm_provider
from app.services.reasoning_service import reasoning_service

logger = get_logger("llm.grounding")


class GroundingService:
    """Orchestrates grounded external LLM inference with deterministic fallback."""

    def __init__(self, cache_ttl_seconds: int = 300):
        self.cache_ttl = cache_ttl_seconds
        self._cache: dict[str, tuple[StructuredLLMResponse, float]] = {}

    def _cache_key(
        self,
        repo_id: str,
        query: str,
        mode: str,
        audience: str,
        target_symbol: Optional[str] = None,
    ) -> str:
        raw = f"{repo_id}:{mode}:{audience}:{target_symbol or ''}:{query.strip().lower()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def answer_grounded_query(
        self,
        session: Optional[AnalyzedRepositorySession],
        query: str,
        mode: str = "understand",
        audience: str = "senior",
        target_symbol: Optional[str] = None,
        target_file: Optional[str] = None,
        provider_name: Optional[str] = None,
    ) -> StructuredLLMResponse:
        """Answers developer query using grounded LLM or deterministic fallback."""
        repo_id = session.overview.id if session else "default"
        cache_k = self._cache_key(repo_id, query, mode, audience, target_symbol)

        # Check Cache
        now = time.time()
        if cache_k in self._cache:
            cached_resp, timestamp = self._cache[cache_k]
            if now - timestamp < self.cache_ttl:
                logger.info(f"Returning cached LLM response for query: {query[:40]}...")
                return cached_resp

        provider = get_llm_provider(provider_name)

        # Graceful Fallback if provider credentials are not configured
        if not provider.is_configured():
            logger.info(f"LLM provider '{provider.name}' not configured. Invoking deterministic reasoning fallback.")
            fallback_resp = self._deterministic_fallback(
                session=session,
                query=query,
                mode=mode,
                audience=audience,
                target_symbol=target_symbol,
            )
            return fallback_resp

        # Provider is configured: Assemble Grounded Context
        start_time = time.time()
        context_text, deterministic_evidence, metadata = context_builder.build_grounded_context(
            session=session,
            query=query,
            mode=mode,
            audience=audience,
            target_symbol=target_symbol,
            target_file=target_file,
        )

        # Build Prompts
        mode_instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["understand"])
        audience_instruction = AUDIENCE_INSTRUCTIONS.get(audience, AUDIENCE_INSTRUCTIONS["senior"])
        system_prompt = (
            f"{SYSTEM_PROMPT_BASE}\n\n"
            f"{mode_instruction}\n\n"
            f"{audience_instruction}\n\n"
            f"{STRUCTURED_OUTPUT_PROMPT}"
        )

        user_prompt = (
            f"DEVELOPER QUESTION: {sanitize_code_for_prompt(query, max_chars=1000)}\n"
            f"TARGET SYMBOL: {target_symbol or 'None'}\n"
            f"TARGET FILE: {target_file or 'None'}\n\n"
            f"VERIFIED REPOSITORY CONTEXT:\n"
            f"{context_text}\n\n"
            f"Please deliver your structured, evidence-grounded response conforming to the JSON schema."
        )

        try:
            structured_resp = await provider.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=StructuredLLMResponse,
                temperature=0.15,
            )
            elapsed_ms = (time.time() - start_time) * 1000

            # Post-generation Verification & Sanitization
            valid_files = set(session.ast_data.keys()) if session else set()
            valid_symbols = {item.symbol for item in deterministic_evidence}

            # Filter citations against actual repository files
            cleaned_evidence = validate_and_filter_citations(
                structured_resp.evidence, valid_files=valid_files, valid_symbols=valid_symbols
            )
            # If the LLM returned no citations or was overly conservative, include deterministic evidence
            if not cleaned_evidence and deterministic_evidence:
                cleaned_evidence = deterministic_evidence[:5]

            # Redact any accidental secrets
            clean_answer = redact_secrets(structured_resp.answer)
            clean_summary = redact_secrets(structured_resp.summary)

            # Preserve authoritative risk score from deterministic engine
            auth_risk_score = metadata.get("risk_score")
            auth_risk_level = metadata.get("risk_level")
            final_impact = structured_resp.impact
            if auth_risk_score is not None:
                final_impact.risk_score = auth_risk_score
                final_impact.risk_level = auth_risk_level
                if metadata.get("impact") and metadata["impact"].get("blast_radius_summary"):
                    final_impact.blast_radius_summary = metadata["impact"]["blast_radius_summary"]

            final_response = StructuredLLMResponse(
                id=f"llm-{uuid.uuid4().hex[:8]}",
                answer=clean_answer,
                summary=clean_summary,
                confidence=structured_resp.confidence or "high",
                mode=mode,
                audience=audience,  # type: ignore
                evidence=cleaned_evidence,
                related_symbols=structured_resp.related_symbols or list(valid_symbols)[:6],
                impact=final_impact,
                recommendations=structured_resp.recommendations or ["Inspect code evidence citations."],
                limitations=structured_resp.limitations or [
                    "Static AST & deterministic evidence boundary applied.",
                    "Claims restricted to indexed repository files."
                ],
                is_fallback=False,
                provider=provider.name,
                model=getattr(provider, "model", None),
                latency_ms=round(elapsed_ms, 2),
            )

            # Save in Cache
            self._cache[cache_k] = (final_response, now)
            return final_response

        except Exception as e:
            logger.error(f"External LLM generation failed ({e}). Falling back to deterministic intelligence.", exc_info=True)
            fallback = self._deterministic_fallback(
                session=session,
                query=query,
                mode=mode,
                audience=audience,
                target_symbol=target_symbol,
            )
            fallback.limitations.append(f"External LLM ({provider.name}) unavailable: {str(e)[:100]}")
            return fallback

    def _deterministic_fallback(
        self,
        session: Optional[AnalyzedRepositorySession],
        query: str,
        mode: str,
        audience: str,
        target_symbol: Optional[str] = None,
    ) -> StructuredLLMResponse:
        """Generates deterministic structured response using RepoMind's rule and AST engine."""
        ast_data = session.ast_data if session else {}
        relative_files = [session.workspace_path / Path(k) for k in ast_data.keys()] if session else []

        ask_res = reasoning_service.answer_query(
            query=query,
            relative_files=relative_files,
            ast_data_by_file=ast_data,
        )

        # Build evidence items from ask_res.sources
        evidence: list[EvidenceItem] = []
        for src in ask_res.sources:
            lines = src.lines.replace("–", "-").split("-")
            try:
                l_start = int(lines[0].strip())
                l_end = int(lines[1].strip()) if len(lines) > 1 else l_start + 5
            except ValueError:
                l_start, l_end = 1, 10

            evidence.append(
                EvidenceItem(
                    file=src.file,
                    line_start=l_start,
                    line_end=l_end,
                    symbol=src.func,
                    type="function",
                    reason="Deterministic code match verified by RepoMind AST index",
                    snippet=src.fullSnippet,
                )
            )

        chosen_explanation = ask_res.technicalExplanation if audience == "senior" else ask_res.juniorExplanation
        summary = (
            chosen_explanation[:140] + "..."
            if len(chosen_explanation) > 140
            else chosen_explanation
        )

        return StructuredLLMResponse(
            id=ask_res.id,
            answer=chosen_explanation,
            summary=summary,
            confidence="high",
            mode=mode,
            audience=audience,  # type: ignore
            evidence=evidence,
            related_symbols=ask_res.affectedEntities,
            impact=StructuredImpact(
                files=[s.file for s in ask_res.sources],
                functions=[s.func for s in ask_res.sources if s.func],
                blast_radius_summary=ask_res.riskAssessment,
            ),
            recommendations=[
                "Inspect verified source code snippets highlighted above.",
                "Review execution flow steps before initiating refactors.",
            ],
            limitations=[
                "Generated via RepoMind Deterministic Static Analysis Engine.",
                "External LLM provider not configured or operating in offline fallback.",
            ],
            is_fallback=True,
            provider="deterministic",
            model="ast-rule-engine",
            latency_ms=1.5,
        )

    async def get_status(self, provider_name: Optional[str] = None) -> LLMStatusResponse:
        """Returns health and operational status of the active LLM provider."""
        provider = get_llm_provider(provider_name)
        configured = provider.is_configured()
        available = False
        message = ""

        if configured:
            try:
                available = await provider.health_check()
                status = "available" if available else "offline_fallback"
                message = "Provider active and ready for grounded reasoning." if available else "Provider key present but ping check failed; running in offline fallback."
            except Exception as e:
                status = "offline_fallback"
                message = f"Provider health check failed: {str(e)[:80]}. Falling back to deterministic engine."
        else:
            status = "offline_fallback"
            message = "External LLM key not configured. RepoMind is operating in 100% deterministic intelligence mode."

        return LLMStatusResponse(
            status=status,
            provider=provider.name,
            model=getattr(provider, "model", "default"),
            configured=configured,
            available=available,
            message=message,
            metrics={"cache_entries": len(self._cache)},
        )


grounding_service = GroundingService()
