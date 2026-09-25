"""Static repository file scanner, language detection, and metrics calculator."""

import os
import re
from pathlib import Path
from collections import defaultdict
from app.core.security import is_safe_source_file
from app.models.repository import RepositoryMetrics, LayerSummary, FindingsBreakdown, LanguageComposition
from app.services.ast_service import LANGUAGE_CAPABILITY_MATRIX

EXTENSION_TO_LANGUAGE = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sql": "SQL",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".md": "Markdown",
}


class ScannerService:
    """Scans repository workspaces to extract structural file and code metrics."""

    def scan_workspace(self, workspace_path: Path) -> dict:
        """
        Scans all files in workspace_path and returns:
        - relative_files: list of relative Paths
        - primary_language: str
        - secondary_language: str | None
        - languages: list[LanguageComposition]
        - metrics: RepositoryMetrics
        - layers: list[LayerSummary]
        """
        relative_files: list[Path] = []
        lang_line_counts: dict[str, int] = defaultdict(int)
        lang_file_counts: dict[str, int] = defaultdict(int)
        total_lines = 0
        test_files = 0
        test_funcs_count = 0
        modules_set: set[str] = set()
        dependencies_count = 0

        # Layer counters
        layer_files = {
            "Frontend": 0,
            "API Gateway": 0,
            "Core Services": 0,
            "Database": 0,
        }

        for root, dirs, files in os.walk(workspace_path):
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "venv", "__pycache__", ".git", "dist", "build")]
            rel_root = Path(root).relative_to(workspace_path)

            for file in files:
                abs_file = Path(root) / file
                if not is_safe_source_file(abs_file):
                    continue

                rel_file = rel_root / file
                relative_files.append(rel_file)

                # Track module directory
                if str(rel_root) not in (".", ""):
                    modules_set.add(str(rel_root).split(os.sep)[0])

                # Check if dependency manifest
                lower_name = file.lower()
                if lower_name in ("requirements.txt", "pyproject.toml", "package.json", "go.mod", "cargo.toml"):
                    dependencies_count += self._estimate_dependency_count(abs_file)

                # Check if test file
                is_test = False
                if lower_name.startswith("test_") or lower_name.endswith("_test.py") or "test" in rel_file.parts or ".test." in lower_name or ".spec." in lower_name:
                    test_files += 1
                    is_test = True

                # Categorize into architectural layer
                rel_str = str(rel_file).lower()
                if any(k in rel_str for k in ("ui", "frontend", "pages", "components", "static", "templates", "client", "views")):
                    layer_files["Frontend"] += 1
                elif any(k in rel_str for k in ("api", "route", "gateway", "controller", "endpoint", "main.py", "app.py", "server")):
                    layer_files["API Gateway"] += 1
                elif any(k in rel_str for k in ("model", "db", "database", "schema", "entity", "migration", "repository", "sql")):
                    layer_files["Database"] += 1
                else:
                    layer_files["Core Services"] += 1

                # Count lines and detect language
                ext = abs_file.suffix.lower()
                lang = EXTENSION_TO_LANGUAGE.get(ext, "Other")
                try:
                    lines = abs_file.read_text(encoding="utf-8", errors="ignore").splitlines()
                    line_count = len(lines)
                    total_lines += line_count
                    lang_line_counts[lang] += line_count
                    lang_file_counts[lang] += 1

                    if is_test:
                        # Count test functions
                        test_funcs_count += sum(1 for line in lines if line.strip().startswith("def test_") or "it(" in line or "test(" in line)
                except Exception:
                    pass

        # Determine primary and secondary languages
        sorted_langs = sorted(
            [l for l in lang_line_counts.items() if l[0] not in ("Other", "JSON", "Markdown", "YAML", "CSS", "SCSS", "HTML")],
            key=lambda x: x[1],
            reverse=True,
        )

        primary_lang = sorted_langs[0][0] if sorted_langs else "Python"
        secondary_lang = sorted_langs[1][0] if len(sorted_langs) > 1 else None

        # Build genuine polyglot LanguageComposition list
        code_languages: list[LanguageComposition] = []
        total_code_lines = sum(
            lines for lang, lines in lang_line_counts.items()
            if lang not in ("Other", "JSON", "Markdown", "YAML", "CSS", "SCSS", "HTML")
        )
        denom = total_code_lines if total_code_lines > 0 else (total_lines if total_lines > 0 else 1)

        for lang, line_count in sorted(lang_line_counts.items(), key=lambda x: x[1], reverse=True):
            if line_count <= 0:
                continue
            pct = round((line_count / denom) * 100.0, 1)
            matrix_entry = LANGUAGE_CAPABILITY_MATRIX.get(lang, {
                "detection": True,
                "ast": False,
                "dependencies": False,
                "impact": False,
                "risk": False,
                "health": False,
                "refactor": False,
                "verification": False,
                "support_level": "Detection Only",
            })
            code_languages.append(
                LanguageComposition(
                    name=lang,
                    percentage=min(100.0, pct),
                    filesCount=lang_file_counts[lang],
                    linesCount=line_count,
                    supportLevel=matrix_entry.get("support_level", "Detection Only"),
                    capabilities={k: v for k, v in matrix_entry.items() if k not in ("support_level", "note")},
                )
            )

        # Build LayerSummary list
        layers = [
            LayerSummary(
                name="Frontend",
                tech=f"{secondary_lang or 'Next.js / HTML'}",
                files=layer_files["Frontend"],
                status="Healthy" if layer_files["Frontend"] > 0 else "Not Detected",
            ),
            LayerSummary(
                name="API Gateway",
                tech=f"{primary_lang} / FastAPI",
                files=layer_files["API Gateway"],
                status="Active" if layer_files["API Gateway"] > 0 else "Not Detected",
            ),
            LayerSummary(
                name="Core Services",
                tech=f"{primary_lang} Services",
                files=layer_files["Core Services"],
                status="Analyzed" if layer_files["Core Services"] > 0 else "Not Detected",
            ),
            LayerSummary(
                name="Database",
                tech="SQLAlchemy / SQL Models",
                files=layer_files["Database"],
                status="Verified" if layer_files["Database"] > 0 else "Not Detected",
            ),
        ]

        metrics = RepositoryMetrics(
            filesCount=len(relative_files),
            modulesCount=max(len(modules_set), 1),
            testsCount=test_funcs_count if test_funcs_count > 0 else test_files,
            findingsCount=0,  # Will be populated after health service runs
            findingsBreakdown=FindingsBreakdown(high=0, medium=0, low=0),
            codeLines=total_lines,
            testCoverage="Not Available (Static AST Mode)" if test_files > 0 else "Not Available (0 test files)",
            dependenciesCount=dependencies_count,
        )

        return {
            "relative_files": relative_files,
            "primary_language": primary_lang,
            "secondary_language": secondary_lang,
            "languages": code_languages,
            "metrics": metrics,
            "layers": layers,
        }

    def _estimate_dependency_count(self, manifest_file: Path) -> int:
        """Parses dependency file to count third-party dependencies."""
        try:
            content = manifest_file.read_text(encoding="utf-8", errors="ignore")
            fname = manifest_file.name.lower()
            if fname == "requirements.txt":
                lines = [
                    line.strip()
                    for line in content.splitlines()
                    if line.strip() and not line.strip().startswith("#") and not line.strip().startswith("-")
                ]
                return len(lines)
            elif fname == "package.json":
                return len(re.findall(r'"[^"]+"\s*:\s*"\^?[0-9]', content))
            elif fname == "pyproject.toml":
                return len(re.findall(r'^[a-zA-Z0-9_\-]+(?:\s*>=|\s*==|\s*=)', content, re.MULTILINE))
            elif fname == "go.mod":
                return len(re.findall(r'^\s+[a-zA-Z0-9_\-./]+\s+v[0-9]', content, re.MULTILINE))
            elif fname == "cargo.toml":
                return len(re.findall(r'^[a-zA-Z0-9_\-]+\s*=\s*"', content, re.MULTILINE))
        except Exception:
            pass
        return 0


scanner_service = ScannerService()
