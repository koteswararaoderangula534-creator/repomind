"""Impact analysis request and response data models."""

from typing import Optional, Literal, Any
from pydantic import BaseModel, Field


class ImpactAnalysisRequest(BaseModel):
    """Request payload to analyze impact of refactoring or changing an entity."""
    entity: str = Field(..., description="Target function or class name (e.g., authenticate_user or process_order)")
    file: Optional[str] = Field(None, description="Optional relative file path containing the entity")


class ImpactSummary(BaseModel):
    """High-level summary of blast radius and affected surface area."""
    affectedFilesCount: int
    affectedFunctionsCount: int
    relatedTestsCount: int
    blastRadiusScore: str
    riskRating: Literal["CRITICAL", "HIGH", "MODERATE", "LOW"]
    riskScore: Optional[float] = None
    riskLevel: Optional[str] = None


class RiskArea(BaseModel):
    """Specific architectural risk domain."""
    name: str
    level: str
    description: str


class DependencyStep(BaseModel):
    """Step in the caller-to-callee dependency execution chain."""
    step: int
    file: str
    entity: str
    role: str
    isTarget: bool = False


class AffectedFile(BaseModel):
    """A file impacted by changes to the target entity."""
    file: str
    callers: int
    tests: list[str] = Field(default_factory=list)


class RelatedTest(BaseModel):
    """A test suite or case covering the target or its direct callers."""
    name: str
    file: str
    status: str = "Passing"
    duration: str = "15ms"


class ImpactAnalysisResponse(BaseModel):
    """Full impact analysis response payload."""
    selectedEntity: str
    file: str
    lineRange: str
    summary: ImpactSummary
    riskAreas: list[RiskArea] = Field(default_factory=list)
    dependencyFlow: list[DependencyStep] = Field(default_factory=list)
    affectedFiles: list[AffectedFile] = Field(default_factory=list)
    relatedTests: list[RelatedTest] = Field(default_factory=list)
    factors: Optional[dict[str, Any]] = None
    evidence: Optional[dict[str, Any]] = None
    contributors: Optional[list[dict[str, Any]]] = None
    recommendations: Optional[list[str]] = None
    explanations: Optional[list[str]] = None
