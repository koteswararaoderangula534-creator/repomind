"""Unit tests for the CodeIntelligenceService (AI/ML Hybrid Intelligence)."""

import pytest
from app.services.intelligence_service import intelligence_service


def test_classify_repository_signals():
    # 1. Full-Stack signals
    files = ["src/components/App.tsx", "src/pages/Home.jsx", "api/routes/users.py", "package.json"]
    langs = {"TypeScript": 1000, "Python": 800}
    deps = ["fastapi", "react", "uvicorn"]

    res = intelligence_service.classify_repository(files, langs, deps)
    assert res["category"] in ("Full-Stack Application", "Web Application", "API Service")
    assert res["confidence"] >= 0.70
    assert len(res["signals"]) > 0


def test_semantic_code_grouping():
    files = [
        "api/routes/auth.py",
        "services/auth_service.py",
        "api/routes/users.py",
        "models/database.py",
        "config/settings.py",
        "src/components/Navbar.tsx",
        "tests/test_auth.py",
    ]
    groups = intelligence_service.semantic_code_grouping(files)
    domains = {g["domain"] for g in groups}
    assert "Authentication & Security" in domains
    assert "Data Persistence & ORM" in domains or "Configuration & Infrastructure" in domains
    assert "User Interface & Components" in domains
    assert "Test Suite & Verification" in domains


def test_explain_finding_find_one_and_race_condition():
    # Test find_one truncation explanation
    f1 = intelligence_service.explain_finding(
        finding_id="FRN-001",
        title="Historical Data Truncation Hazard",
        rule="FOR-001",
        file_path="services/attendance_service.py",
        line_num=112,
        code_snippet="record = await db.attendance.find_one({'student_id': student_id})",
        junior_mode=False,
    )
    assert "find_one" in f1["what_was_detected"]
    assert "services/attendance_service.py:112" == f1["verified_evidence"]
    assert f1["confidence"] >= 0.90

    # Junior mode
    f1_junior = intelligence_service.explain_finding(
        finding_id="FRN-001",
        title="Historical Data Truncation Hazard",
        rule="FOR-001",
        file_path="services/attendance_service.py",
        line_num=112,
        code_snippet="record = await db.attendance.find_one({'student_id': student_id})",
        junior_mode=True,
    )
    assert "first page" in f1_junior["explanation"]

    # Test concurrency pattern explanation
    f2 = intelligence_service.explain_finding(
        finding_id="FRN-002",
        title="Potential Concurrency Hazard in Array Mutation",
        rule="FOR-002",
        file_path="services/attendance_service.py",
        line_num=78,
        code_snippet="await db.attendance.update_one({'student_id': id}, {'$push': {'sessions': s}})",
        junior_mode=False,
    )
    assert "push" in f2["what_was_detected"].lower() or "concurren" in f2["what_was_detected"].lower()
    assert "services/attendance_service.py:78" == f2["verified_evidence"]


def test_investigate_query_with_hallucination_guard():
    forensic_data = {
        "findings": [{"title": "Historical Data Truncation Hazard"}],
        "data_flow": {
            "steps": [
                {"source": "CameraCapture.tsx", "operation": "CAPTURE"},
                {"source": "api/routes/attendance.py", "operation": "INGEST"},
                {"source": "MongoDB", "operation": "PERSIST"},
            ]
        },
        "operations": [
            {
                "operation_type": "UPDATE",
                "target_entity": "attendance",
                "method_name": "update_one",
                "file_path": "services/attendance_service.py",
                "line_number": 78,
            }
        ],
    }

    # Query 1: Data disappearance
    ans1 = intelligence_service.investigate_query("Why might this data disappear?", {}, forensic_data)
    assert ans1["evidence_type"] == "VERIFIED EVIDENCE"
    assert "services/attendance_service.py:112" in ans1["code_reference"]

    # Query 2: Data flow
    ans2 = intelligence_service.investigate_query("What is the data flow path?", {}, forensic_data)
    assert "CameraCapture.tsx" in ans2["answer"]

    # Query 3: Hallucination Guard
    ans3 = intelligence_service.investigate_query("What is the quantum encryption key algorithm?", {}, forensic_data)
    assert "could not verify" in ans3["answer"].lower()
    assert ans3["evidence_type"] == "UNVERIFIED"


def test_generate_codebase_summary():
    summary = intelligence_service.generate_codebase_summary(
        repo_name="sample-project",
        primary_lang="Python",
        secondary_lang="TypeScript",
        languages={"Python": 1200, "TypeScript": 900},
        layers=[{"name": "Frontend"}, {"name": "API Gateway"}, {"name": "Database"}],
        detected_databases=["MongoDB (Active)"],
        findings_count=3,
        metrics={"filesCount": 24, "codeLines": 2100},
        is_demo=False,
    )
    assert "sample-project" in summary
    assert "Python" in summary
    assert "full-stack application" in summary.lower()
    assert "MongoDB" in summary
