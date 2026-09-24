"""Code health findings data models."""

from typing import Optional, Literal
from pydantic import BaseModel, Field

SeverityLevel = Literal["HIGH", "MEDIUM", "LOW"]


class CodeHealthFinding(BaseModel):
    """An individual code quality or security finding detected via static analysis."""
    id: str
    severity: SeverityLevel
    rule: str
    title: str
    description: str
    juniorDescription: str
    file: str
    line: int
    module: str
    status: str = "Open"
    category: str
    suggestedRefactorId: Optional[str] = None
    impactEntity: str
    codeSnippet: str
