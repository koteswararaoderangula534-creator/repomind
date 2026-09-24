"""
Data models for the RepoMind Deep Repository & Database Forensic Analysis Engine.
Defines structured contracts for database detection, operations, data flows,
integrity findings, root-cause trees, and evidence classifications.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class DatabaseDetected(BaseModel):
    """Represents a database detected in configuration or runtime code."""
    name: str  # e.g., "MongoDB", "PostgreSQL", "Supabase", "SQLite", "Redis"
    category: str  # e.g., "NoSQL Document", "Relational SQL", "BaaS / Postgres"
    detected_in_config: bool = False
    detected_in_code: bool = False
    status: str  # "ACTUALLY USED" | "CONFIGURED BUT UNUSED" | "EXTERNAL REFERENCE ONLY" | "NOT DETECTED"
    driver_packages: list[str] = Field(default_factory=list)
    connection_uris: list[str] = Field(default_factory=list)  # Secrets must always be REDACTED
    evidence: str = ""
    classification: str = "[CODE VERIFIED]"


class DatabaseOperation(BaseModel):
    """Represents a discrete database read/write operation extracted via AST."""
    id: str
    file: str
    function: str
    line: int
    database: str
    collection_or_table: str
    operation: str  # "INSERT" | "UPDATE" | "UPSERT" | "DELETE" | "FIND" | "FIND_ONE" | "PUSH" | "REPLACE" | "AGGREGATE"
    filter_expr: Optional[str] = None
    fields_modified: list[str] = Field(default_factory=list)
    code_snippet: str = ""
    evidence_classification: str = "[CODE VERIFIED]"
    confidence: float = 1.0


class DataEntity(BaseModel):
    """Represents a persistent domain entity / collection / table."""
    name: str
    database: str
    collection_or_table: str
    inferred_schema: dict[str, str] = Field(default_factory=dict)
    nested_arrays: list[str] = Field(default_factory=list)
    primary_key_or_id: str = "id"
    unique_constraints: list[str] = Field(default_factory=list)
    missing_constraints: list[str] = Field(default_factory=list)
    storage_model: str = "one-document-per-session"  # "append-only", "update-in-place", etc.
    historical_retention: str = "Preserved in storage, but truncated at read layer"
    evidence: str = ""


class DataFlowStep(BaseModel):
    """Single step in an end-to-end data flow pipeline."""
    layer: str  # "Frontend", "API Gateway", "Service Layer", "Database"
    component: str  # e.g., "CameraCapture.tsx", "POST /api/attendance/mark"
    action: str  # "Captures frame & sends base64", "Decodes JPEG & runs face recognition"
    file: str
    line: Optional[int] = None


class DataFlowTrace(BaseModel):
    """Traces an entity from frontend interaction to database persistence and back to UI."""
    entity: str
    frontend_trigger: str
    api_endpoint: str
    controller_func: str
    database_target: str
    read_path: str
    ui_display: str
    steps: list[DataFlowStep] = Field(default_factory=list)


class ConcurrencyTimeline(BaseModel):
    """Step-by-step race condition execution timeline."""
    trigger: str
    step1: str
    step2: str
    outcome: str
    code_references: list[str] = Field(default_factory=list)


class IntegrityFinding(BaseModel):
    """A forensic finding regarding data integrity, race condition, truncation, or security."""
    id: str
    title: str
    severity: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    category: str  # "Query Truncation", "Race Condition", "Missing Lifecycle", "Credential Exposure", "Logic Defect"
    classification: str  # "[CODE VERIFIED]", "[DATABASE VERIFIED]", "[CONFIG VERIFIED]", "[TEST VERIFIED]", "[INFERRED]", "[UNVERIFIED]"
    file: str
    function: str
    line: int
    evidence: str
    impact: str
    confidence: float = 1.0
    concurrency_timeline: Optional[ConcurrencyTimeline] = None
    code_snippet: Optional[str] = None
    suggested_fix: Optional[str] = None


class RootCauseNode(BaseModel):
    """Hierarchical root-cause explanation separating symptoms from architectural origins."""
    id: str
    title: str
    symptom: str
    direct_cause: str
    underlying_cause: str
    architectural_cause: str
    evidence_tag: str = "[CODE VERIFIED]"


class CrossCheckItem(BaseModel):
    """Cross-validation between code, configuration, database operations, and frontend."""
    topic: str
    aspect_a: str
    aspect_b: str
    verdict: str  # "CONSISTENT" | "CONFLICTING EVIDENCE" | "DISCONNECTED"
    details: str
    classification: str = "[CODE VERIFIED]"


class UnverifiedItem(BaseModel):
    """Explicitly records external resources or assumptions that could not be verified."""
    target: str
    reason: str
    classification: str = "[UNVERIFIED]"
    recommendation: str


class ForensicReport(BaseModel):
    """Complete forensic analysis output contract for RepoMind."""
    repo_id: str
    repo_name: str
    analyzed_at: str
    execution_time_seconds: float = 0.0
    databases: list[DatabaseDetected] = Field(default_factory=list)
    entities: list[DataEntity] = Field(default_factory=list)
    write_operations: list[DatabaseOperation] = Field(default_factory=list)
    read_operations: list[DatabaseOperation] = Field(default_factory=list)
    flows: list[DataFlowTrace] = Field(default_factory=list)
    findings: list[IntegrityFinding] = Field(default_factory=list)
    root_causes: list[RootCauseNode] = Field(default_factory=list)
    cross_checks: list[CrossCheckItem] = Field(default_factory=list)
    unverified_items: list[UnverifiedItem] = Field(default_factory=list)
    summary: dict[str, Any] = Field(default_factory=dict)
