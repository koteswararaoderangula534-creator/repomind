"""Repository request and response data models."""

from typing import Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Payload to trigger repository analysis."""
    url: str = Field(..., description="GitHub repository URL or local path")
    branch: Optional[str] = Field("main", description="Target branch to inspect")
    supabase_url: Optional[str] = Field(None, description="Optional Supabase or external database URL for forensic validation")


class FindingsBreakdown(BaseModel):
    """Breakdown of findings by severity."""
    high: int = 0
    medium: int = 0
    low: int = 0


class RepositoryMetrics(BaseModel):
    """Detailed structural and quality metrics for analyzed repository."""
    filesCount: int = 0
    modulesCount: int = 0
    testsCount: int = 0
    findingsCount: int = 0
    findingsBreakdown: FindingsBreakdown = Field(default_factory=FindingsBreakdown)
    codeLines: int = 0
    testCoverage: str = "N/A"
    dependenciesCount: int = 0


class LayerSummary(BaseModel):
    """Architectural layer summary in the repository overview."""
    name: str
    tech: str
    files: int
    status: str


class RepositoryOverview(BaseModel):
    """Full repository overview payload matching the frontend contract."""
    id: str
    name: str
    url: str
    branch: str = "main"
    commit: str = "HEAD"
    primaryLanguage: str = "Unknown"
    secondaryLanguage: Optional[str] = None
    lastAnalyzed: str
    analysisDuration: str
    status: str = "Analyzed"
    metrics: RepositoryMetrics
    layers: list[LayerSummary] = Field(default_factory=list)
    classification: Optional[str] = "Full-Stack Application"
    ai_summary: Optional[str] = None
    semantic_groups: Optional[list[dict]] = None
    technologies: Optional[list[str]] = None
    databases_detected: Optional[list[str]] = None


class RecentRepositoryItem(BaseModel):
    """Recent repository listing item."""
    id: str
    name: str
    language: str
    lastAnalyzed: str
    filesCount: int
    findingsCount: int
    highFindings: int
    testsCount: int
    isCurrent: bool = False
