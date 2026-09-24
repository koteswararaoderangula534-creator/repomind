"""Ask AI query and structured response data models."""

from typing import Optional
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    """Payload to ask questions about the repository."""
    query: str = Field(..., description="Natural language question about repository architecture or code")


class FlowStep(BaseModel):
    """An architectural flow step explaining execution path."""
    name: str
    role: str
    action: str


class SourceReference(BaseModel):
    """A precise source code snippet citation."""
    file: str
    lines: str
    func: str
    fullSnippet: str


class AskResponse(BaseModel):
    """Structured answer to a developer's question."""
    id: str
    query: str
    category: str
    technicalExplanation: str
    juniorExplanation: str
    flowSteps: list[FlowStep]
    sources: list[SourceReference]
    affectedEntities: list[str]
    riskAssessment: str
