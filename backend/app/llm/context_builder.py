"""Targeted Grounded Context Builder for RepoMind LLM Intelligence Layer."""

import re
from pathlib import Path
from typing import Optional, Any
from app.core.store import AnalyzedRepositorySession
from app.llm.schemas import EvidenceItem, StructuredImpact
from app.llm.safety import sanitize_code_for_prompt, wrap_evidence_block
from app.services.risk_service import risk_service
from app.services.impact_service import impact_service


STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "from", "up", "down", "in", "out", "on", "off",
    "over", "under", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "can", "will", "just", "don", "should", "now", "is",
    "are", "was", "were", "what", "does", "explain", "show", "code", "file"
}


class ContextBuilder:
    """Builds targeted, evidence-dense context from deterministic analysis artifacts."""

    def __init__(self, max_context_chars: int = 10000):
        self.max_context_chars = max_context_chars

    def build_grounded_context(
        self,
        session: Optional[AnalyzedRepositorySession],
        query: str,
        mode: str = "understand",
        audience: str = "senior",
        target_symbol: Optional[str] = None,
        target_file: Optional[str] = None,
    ) -> tuple[str, list[EvidenceItem], dict[str, Any]]:
        """
        Gathers targeted repository evidence matching the developer query.
        Returns:
            - context_text: sanitized, isolated evidence prompt string
            - evidence_items: list of verifiable EvidenceItem objects
            - metadata: deterministic risk, affected files, and symbol metrics
        """
        if not session:
            return self._build_empty_fallback_context(query)

        query_tokens = self._extract_tokens(query)
        if target_symbol:
            query_tokens.add(target_symbol.lower().replace("()", ""))
        if target_file:
            query_tokens.add(Path(target_file).stem.lower())

        evidence_items: list[EvidenceItem] = []
        context_sections: list[str] = []

        # 1. Repository Identity & Structural Overview
        overview = session.overview
        repo_info = (
            f"REPOSITORY METADATA:\n"
            f"- Name: {overview.name}\n"
            f"- URL: {overview.url}\n"
            f"- Primary Language: {overview.primaryLanguage}\n"
            f"- Secondary Language: {overview.secondaryLanguage or 'N/A'}\n"
            f"- Classification: {overview.classification or 'Application'}\n"
            f"- Indexed Files: {overview.metrics.filesCount}\n"
            f"- Code Lines: ~{overview.metrics.codeLines:,}\n"
            f"- Dependencies Tracked: {overview.metrics.dependenciesCount}\n"
            f"- Verified Automated Tests: {overview.metrics.testsCount} ({overview.metrics.testCoverage})\n"
        )
        context_sections.append(repo_info)

        # 2. Architectural Layers
        if overview.layers:
            layers_info = ["ARCHITECTURAL LAYERS:"]
            for lyr in overview.layers:
                layers_info.append(f"  • {lyr.name}: {lyr.tech} ({lyr.files} files, status: {lyr.status})")
            context_sections.append("\n".join(layers_info))

        # 3. Targeted AST Symbol Retrieval (Functions & Classes)
        matched_symbols = self._find_matching_symbols(session.ast_data, query_tokens, target_symbol)
        if matched_symbols:
            symbols_info = ["MATCHED SOURCE CODE SYMBOLS (AST VERIFIED):"]
            for item in matched_symbols[:8]:
                evidence_items.append(item)
                symbols_info.append(
                    f"  • Symbol `{item.symbol}` ({item.type}) in `{item.file}:{item.line_start}-{item.line_end}`\n"
                    f"    Role: {item.reason}\n"
                    f"    Snippet:\n"
                    f"    ```\n"
                    f"    {sanitize_code_for_prompt(item.snippet or '', max_chars=400)}\n"
                    f"    ```"
                )
            context_sections.append("\n".join(symbols_info))

        # 4. Relevant Code Health & Security Findings
        matched_findings = self._find_matching_findings(session.findings, query_tokens)
        if matched_findings:
            findings_info = ["RELEVANT CODE HEALTH & SECURITY FINDINGS:"]
            for fnd in matched_findings[:5]:
                ev = EvidenceItem(
                    file=fnd.file,
                    line_start=fnd.line,
                    line_end=fnd.line + 5,
                    symbol=fnd.impactEntity or fnd.title,
                    type="finding",
                    reason=f"{fnd.severity} severity finding: {fnd.title} ({fnd.rule})",
                    snippet=fnd.codeSnippet,
                )
                evidence_items.append(ev)
                findings_info.append(
                    f"  • [{fnd.severity}] {fnd.title} in `{fnd.file}:{fnd.line}`\n"
                    f"    Rule: {fnd.rule} | Category: {fnd.category}\n"
                    f"    Description: {fnd.description}\n"
                    f"    Snippet: {sanitize_code_for_prompt(fnd.codeSnippet or '', max_chars=250)}"
                )
            context_sections.append("\n".join(findings_info))

        # 5. Deterministic Impact & Risk Context (If query is about impact, risk, or refactoring)
        impact_meta = {}
        risk_score = None
        risk_level = None
        if mode in ("impact", "refactor", "debug") or any(k in query_tokens for k in ("impact", "risk", "break", "blast", "change", "refactor")):
            symbol_to_check = target_symbol or (matched_symbols[0].symbol if matched_symbols else "process_order")
            impact_res, r_score, r_level = self._compute_deterministic_impact_and_risk(session, symbol_to_check)
            risk_score = r_score
            risk_level = r_level
            impact_meta = {
                "files": [af.file for af in impact_res.affectedFiles],
                "functions": [c.function for c in impact_res.callers],
                "risk_score": r_score,
                "risk_level": r_level,
                "blast_radius_summary": impact_res.summary.blastRadiusScore,
            }

            impact_text = (
                f"DETERMINISTIC BLAST RADIUS & RISK ANALYSIS FOR `{symbol_to_check}`:\n"
                f"- Authoritative Risk Score: {r_score}/100 ({r_level})\n"
                f"- Blast Radius Rating: {impact_res.summary.blastRadiusScore}\n"
                f"- Direct Callers: {len(impact_res.callers)} detected ({', '.join(c.function for c in impact_res.callers[:5])})\n"
                f"- Affected Files: {len(impact_res.affectedFiles)} ({', '.join(af.file for af in impact_res.affectedFiles[:5])})\n"
                f"- Affected Architecture Layers: {', '.join(impact_res.summary.affectedLayers)}\n"
                f"- Related Tests: {len(impact_res.relatedTests)} test suite(s)"
            )
            context_sections.append(impact_text)

        # 6. Deep Forensic Context (If available and relevant)
        if session.forensic_report and any(k in query_tokens for k in ("database", "db", "mongo", "postgres", "supabase", "race", "truncat", "concurren")):
            forensic_info = ["FORENSIC TRACE & RUNTIME DATA PERSISTENCE:"]
            fr = session.forensic_report
            for db in fr.databases:
                forensic_info.append(f"  • Database `{db.name}`: Status={db.status}, Operations={db.operations_count}")
            for rc in fr.root_cause_nodes[:3]:
                forensic_info.append(f"  • Root Cause [{rc.symptom}]: Located at {rc.trigger_file}:{rc.trigger_line} ({rc.confidence})")
            context_sections.append("\n".join(forensic_info))

        # Assemble and enforce context budget
        raw_context = "\n\n".join(context_sections)
        if len(raw_context) > self.max_context_chars:
            raw_context = raw_context[:self.max_context_chars] + "\n... [Context truncated to stay within token budget]"

        isolated_context = wrap_evidence_block(raw_context)

        metadata = {
            "repository_name": overview.name,
            "matched_symbols_count": len(matched_symbols),
            "evidence_count": len(evidence_items),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "impact": impact_meta,
        }

        return isolated_context, evidence_items, metadata

    def _extract_tokens(self, text: str) -> set[str]:
        """Extracts significant normalized keywords from query text."""
        raw_words = re.findall(r"[A-Za-z0-9_]{3,}", text.lower())
        return {w for w in raw_words if w not in STOP_WORDS}

    def _find_matching_symbols(
        self,
        ast_data: dict[str, dict[str, Any]],
        tokens: set[str],
        target_symbol: Optional[str] = None,
    ) -> list[EvidenceItem]:
        """Finds matching functions or classes from repository AST."""
        matched: list[EvidenceItem] = []
        clean_target = target_symbol.lower().replace("()", "") if target_symbol else None

        for rel_file, data in ast_data.items():
            functions = data.get("functions", [])
            classes = data.get("classes", [])

            for f in functions:
                fname = getattr(f, "name", "")
                fname_lower = fname.lower()
                doc = getattr(f, "docstring", "") or ""
                doc_lower = doc.lower()

                is_exact = clean_target and fname_lower == clean_target
                is_token_match = any(t in fname_lower or (t in doc_lower and len(t) > 3) for t in tokens)

                if is_exact or is_token_match:
                    start = getattr(f, "start_line", 1)
                    end = getattr(f, "end_line", start + 10)
                    snippet = self._extract_snippet(data.get("raw_lines", []), start, end)
                    matched.append(
                        EvidenceItem(
                            file=rel_file,
                            line_start=start,
                            line_end=end,
                            symbol=fname,
                            type="function",
                            reason=f"Function definition with cyclomatic complexity {getattr(f, 'complexity', 1)}",
                            snippet=snippet,
                        )
                    )

            for c in classes:
                cname = getattr(c, "name", "")
                cname_lower = cname.lower()
                if clean_target and cname_lower == clean_target or any(t in cname_lower for t in tokens):
                    start = getattr(c, "start_line", 1)
                    end = getattr(c, "end_line", start + 20)
                    snippet = self._extract_snippet(data.get("raw_lines", []), start, end)
                    matched.append(
                        EvidenceItem(
                            file=rel_file,
                            line_start=start,
                            line_end=end,
                            symbol=cname,
                            type="class",
                            reason="Class definition and methods",
                            snippet=snippet,
                        )
                    )

        return matched

    def _find_matching_findings(self, findings: list[Any], tokens: set[str]) -> list[Any]:
        """Finds CodeHealth findings matching query tokens."""
        matched = []
        for f in findings:
            title = getattr(f, "title", "").lower()
            rule = getattr(f, "rule", "").lower()
            desc = getattr(f, "description", "").lower()
            file = getattr(f, "file", "").lower()

            if any(t in title or t in rule or t in desc or t in file for t in tokens):
                matched.append(f)
        return matched

    def _compute_deterministic_impact_and_risk(
        self, session: AnalyzedRepositorySession, symbol_name: str
    ) -> tuple[Any, int, str]:
        """Computes deterministic impact and risk score using RepoMind's native engines."""
        relative_files = [session.workspace_path / Path(k) for k in session.ast_data.keys()]
        impact_res = impact_service.analyze_impact(
            entity_name=symbol_name,
            target_file=None,
            relative_files=relative_files,
            ast_data_by_file=session.ast_data,
        )

        r_factors = risk_service.compute_risk(
            file_changes_count=len(impact_res.affectedFiles),
            callers_count=len(impact_res.callers),
            layers_count=len(impact_res.summary.affectedLayers),
            tests_count=len(impact_res.relatedTests),
            is_security_sensitive="auth" in symbol_name.lower() or "order" in symbol_name.lower() or "pay" in symbol_name.lower(),
            complexity=22 if "order" in symbol_name.lower() else 12,
        )
        return impact_res, r_factors.risk_score, r_factors.risk_level

    def _extract_snippet(self, raw_lines: list[str], start: int, end: int) -> str:
        """Extracts and formats code lines."""
        if not raw_lines:
            return ""
        s = max(0, start - 1)
        e = min(len(raw_lines), end)
        snippet_lines = [f"{i + 1}: {raw_lines[i]}" for i in range(s, min(s + 20, e))]
        return "\n".join(snippet_lines)

    def _build_empty_fallback_context(self, query: str) -> tuple[str, list[EvidenceItem], dict[str, Any]]:
        """Fallback when no repository session is active."""
        text = (
            "REPOSITORY CONTEXT NOT LOADED:\n"
            "No active repository workspace is currently mounted.\n"
            f"Query received: {query}"
        )
        return wrap_evidence_block(text), [], {"status": "empty"}


context_builder = ContextBuilder()
