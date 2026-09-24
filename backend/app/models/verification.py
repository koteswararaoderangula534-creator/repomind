"""Verification test execution data models."""

from typing import Optional
from pydantic import BaseModel, Field
from app.models.refactor import DualPerspective


class VerifyRequest(BaseModel):
    """Payload to trigger verification test runs."""
    refactor_id: Optional[str] = Field("REF-ORDER-01", description="Refactoring plan ID to verify")
    test_filter: Optional[str] = Field(None, description="Optional pytest filter expression (e.g., -k test_orders)")


class TestSuiteResult(BaseModel):
    """Result summary for an individual test suite file."""
    name: str
    total: int
    passed: int
    failed: int
    duration: str


class BeforeAfterMetrics(BaseModel):
    """Execution timing and pass count comparisons."""
    passed: int
    failed: int
    time: str


class VerificationResult(BaseModel):
    """Full verification outcome payload matching frontend contract."""
    totalTests: int
    passedCount: int
    failedCount: int
    skippedCount: int = 0
    runtime: str
    status: str  # "Passed" | "Failed"
    before: BeforeAfterMetrics
    after: BeforeAfterMetrics
    explanation: DualPerspective
    suites: list[TestSuiteResult]
    liveLogs: list[str]
