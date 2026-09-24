"""Architecture graph data models."""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ArchNode(BaseModel):
    """An architectural entity node in the dependency graph."""
    id: str
    name: str
    type: str = Field(..., description="frontend, gateway, service, worker, database, cache, external, cli")
    tech: str
    port: Optional[str] = None
    files: Optional[str] = None
    description: str


class ArchLayer(BaseModel):
    """A layer grouping architectural nodes."""
    id: str
    name: str
    nodes: list[ArchNode] = Field(default_factory=list)


class ArchEdge(BaseModel):
    """A directed communication edge between architectural nodes."""
    model_config = ConfigDict(populate_by_name=True)

    from_node: str = Field(..., alias="from")
    to_node: str = Field(..., alias="to")
    protocol: str
    label: str


class ArchitectureGraph(BaseModel):
    """Full architecture graph payload."""
    layers: list[ArchLayer] = Field(default_factory=list)
    edges: list[ArchEdge] = Field(default_factory=list)
