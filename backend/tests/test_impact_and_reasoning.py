"""Tests for ImpactService and CodeReasoningService."""

from pathlib import Path
from app.services.scanner_service import scanner_service
from app.services.ast_service import ast_service
from app.services.impact_service import impact_service
from app.services.reasoning_service import reasoning_service


def test_impact_analysis(sample_repo: Path):
    scan_res = scanner_service.scan_workspace(sample_repo)
    relative_files = scan_res["relative_files"]

    ast_data = {}
    for rel_f in relative_files:
        if rel_f.suffix == ".py":
            rel_str = str(rel_f).replace("\\", "/")
            ast_data[rel_str] = ast_service.parse_python_file(sample_repo / rel_f, rel_str)

    impact = impact_service.analyze_impact(
        entity_name="process_order",
        target_file="services/order_service.py",
        relative_files=relative_files,
        ast_data_by_file=ast_data,
    )

    assert "process_order" in impact.selectedEntity
    assert impact.summary.affectedFilesCount >= 1
    assert len(impact.dependencyFlow) >= 2
    assert len(impact.riskAreas) >= 1


def test_reasoning_service_queries(sample_repo: Path):
    scan_res = scanner_service.scan_workspace(sample_repo)
    relative_files = scan_res["relative_files"]
    ast_data = {}
    for rel_f in relative_files:
        if rel_f.suffix == ".py":
            rel_str = str(rel_f).replace("\\", "/")
            ast_data[rel_str] = ast_service.parse_python_file(sample_repo / rel_f, rel_str)

    # 1. Auth Query
    auth_resp = reasoning_service.answer_query("How does authentication work?", relative_files, ast_data)
    assert auth_resp.category == "Architecture & Flow"
    assert "JWT" in auth_resp.technicalExplanation
    assert len(auth_resp.sources) > 0
    assert len(auth_resp.flowSteps) > 0

    # 2. Database Query
    db_resp = reasoning_service.answer_query("What talks to the database?", relative_files, ast_data)
    assert db_resp.category == "Data Architecture"
    assert len(db_resp.sources) > 0
