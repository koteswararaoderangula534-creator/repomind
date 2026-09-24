"""Refactoring plan and diff data models."""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class RefactorRequest(BaseModel):
    """Request payload to generate a safe refactoring plan."""
    finding_id: Optional[str] = Field(None, description="Optional finding ID to resolve (e.g. FND-003)")
    target_function: Optional[str] = Field(None, description="Target function to refactor")
    file: Optional[str] = Field(None, description="Relative file path")


class DualPerspective(BaseModel):
    """Explanation provided in both technical and junior-friendly terms."""
    technical: str
    junior: str


class DecompositionPlanItem(BaseModel):
    """An individual extracted function or step in the decomposed refactoring plan."""
    name: str
    responsibility: str


class RefactorPlan(BaseModel):
    """Complete refactoring plan matching the frontend specification."""
    id: str
    targetFunction: str
    file: str
    lineRange: str
    problem: DualPerspective
    decompositionPlan: list[DecompositionPlanItem]
    whyThisChange: DualPerspective
    expectedImpact: DualPerspective
    risk: DualPerspective
    originalCode: str
    refactoredCode: str


class DiffLine(BaseModel):
    """Single line in a unified or split diff."""
    type: Literal["header", "addition", "deletion", "context"]
    lineNum: Optional[int] = None
    prefix: str = " "
    text: str


class DiffViewerData(BaseModel):
    """Diff view data payload."""
    filePath: str
    changeSummary: str
    whyThisChanged: DualPerspective
    unifiedDiff: list[DiffLine]
