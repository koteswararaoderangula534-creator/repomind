"""Tests for HealthService static rule detection."""

from pathlib import Path
from app.services.scanner_service import scanner_service
from app.services.ast_service import ast_service
from app.services.health_service import health_service


def test_health_service_detects_deterministic_findings(sample_repo: Path):
    scan_res = scanner_service.scan_workspace(sample_repo)
    relative_files = scan_res["relative_files"]

    ast_data = {}
    for rel_f in relative_files:
        if rel_f.suffix == ".py":
            rel_str = str(rel_f).replace("\\", "/")
            ast_data[rel_str] = ast_service.parse_python_file(sample_repo / rel_f, rel_str)

    findings = health_service.analyze_repository(sample_repo, relative_files, ast_data)
    rule_ids = {f.rule for f in findings}

    # 1. Hardcoded Secret in config.py
    assert "SEC-001" in rule_ids
    sec_finding = next(f for f in findings if f.rule == "SEC-001")
    assert sec_finding.severity == "HIGH"
    assert "SECRET_KEY" in sec_finding.impactEntity

    # 2. Large function in order_service.py
    assert "DES-001" in rule_ids
    des_finding = next(f for f in findings if f.rule == "DES-001")
    assert des_finding.severity == "MEDIUM"
    assert des_finding.impactEntity == "process_order"

    # 3. Direct DB query in route
    assert "ARCH-001" in rule_ids
    arch_finding = next(f for f in findings if f.rule == "ARCH-001")
    assert arch_finding.severity == "MEDIUM"
    assert "db.query" in arch_finding.impactEntity
