"""In-memory repository and analysis state storage."""

from typing import Optional, Any
from pathlib import Path
from app.models.repository import RepositoryOverview, RecentRepositoryItem
from app.models.architecture import ArchitectureGraph
from app.models.finding import CodeHealthFinding
from app.models.refactor import RefactorPlan, DiffViewerData
from app.models.verification import VerificationResult
from app.models.forensic import ForensicReport


class AnalyzedRepositorySession:
    """Holds all in-memory analysis artifacts for an analyzed repository."""

    def __init__(
        self,
        overview: RepositoryOverview,
        workspace_path: Path,
        architecture: Optional[ArchitectureGraph] = None,
        findings: Optional[list[CodeHealthFinding]] = None,
        ast_data: Optional[dict[str, Any]] = None,
        forensic_report: Optional[ForensicReport] = None,
    ):
        self.overview = overview
        self.workspace_path = workspace_path
        self.architecture = architecture
        self.findings = findings or []
        self.ast_data = ast_data or {}
        self.forensic_report = forensic_report
        self.refactor_plans: dict[str, RefactorPlan] = {}
        self.diffs: dict[str, DiffViewerData] = {}
        self.verification_results: dict[str, VerificationResult] = {}


class RepositoryStore:
    """Thread-safe in-memory store for active repository sessions."""

    def __init__(self):
        self._sessions: dict[str, AnalyzedRepositorySession] = {}
        self._current_repo_id: Optional[str] = None

    def put_session(self, session: AnalyzedRepositorySession) -> None:
        self._sessions[session.overview.id] = session
        self._current_repo_id = session.overview.id

    def get_session(self, repo_id: str) -> Optional[AnalyzedRepositorySession]:
        return self._sessions.get(repo_id)

    def get_current_id(self) -> Optional[str]:
        return self._current_repo_id

    def set_current_id(self, repo_id: str) -> None:
        if repo_id in self._sessions:
            self._current_repo_id = repo_id

    def list_recent(self) -> list[RecentRepositoryItem]:
        items = []
        for repo_id, session in self._sessions.items():
            overview = session.overview
            high_count = overview.metrics.findingsBreakdown.high
            items.append(
                RecentRepositoryItem(
                    id=overview.id,
                    name=overview.name,
                    language=overview.primaryLanguage,
                    lastAnalyzed=overview.lastAnalyzed,
                    filesCount=overview.metrics.filesCount,
                    findingsCount=overview.metrics.findingsCount,
                    highFindings=high_count,
                    testsCount=overview.metrics.testsCount,
                    isCurrent=(repo_id == self._current_repo_id),
                )
            )
        return items


repo_store = RepositoryStore()
