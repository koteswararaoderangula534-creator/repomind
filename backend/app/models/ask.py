"""Ask AI query and structured response data models."""

from typing import Optional
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    """Payload to ask questions about the repository."""
    query: str = Field(..., description="Natural language question about repository architecture or code")
    mode: Optional[str] = Field("understand", description="Reasoning mode: understand, architecture, impact, security, debug, refactor, explain, general")
    audience: Optional[str] = Field("senior", description="Target audience perspective: senior or junior")
    target_symbol: Optional[str] = Field(None, description="Optional target symbol name")
    target_file: Optional[str] = Field(None, description="Optional target file path")


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

    # Grounded LLM Metadata (backward compatible defaults)
    summary: Optional[str] = None
    confidence: Optional[str] = "high"
    is_llm_grounded: Optional[bool] = False
    provider: Optional[str] = "deterministic"
    model: Optional[str] = None
    recommendations: Optional[list[str]] = None
    limitations: Optional[list[str]] = None
