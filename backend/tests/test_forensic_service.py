"""
Unit and Integration Tests for RepoMind Deep Forensic Analysis Engine.

Validates:
1. Database detection (MongoDB, PostgreSQL, Supabase).
2. Distinguishing mentioned/configured database from actually used database.
3. Query detection (find, find_one, insert, update, push, upsert).
4. Historical data truncation detection (find_one on history).
5. Concurrency race condition & array duplicate detection ($push fallback).
6. Abandoned lifecycle / frontend-backend mismatch.
7. Hardcoded credentials detection with mandatory secret redaction (<REDACTED>).
8. Evidence classification tags ([CODE VERIFIED], [CONFIG VERIFIED], [UNVERIFIED]).
9. Cross-check contradictory evidence engine.
10. End-to-end API endpoints (GET / POST /api/repositories/{id}/forensic).
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.models.forensic import ForensicReport
from app.services.forensic_service import forensic_service, redact_uri


@pytest.fixture
def attendance_repo(tmp_path: Path) -> Path:
    """
    Creates a realistic test repository modeling the target pattern:
    Frontend (Camera/recognition) -> API -> MongoDB attendance_records (embedded students array)
    with configured Supabase URL, hardcoded mongo password, find_one truncation, and $push race condition.
    """
    repo = tmp_path / "attendance_repo"
    repo.mkdir(parents=True, exist_ok=True)

    # 1. .env with configured Supabase URL and raw MongoDB URI with password
    env_file = repo / ".env"
    env_file.write_text(
        "SUPABASE_URL=https://prod-univ-portal.supabase.co\n"
        "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_value\n"
        "MONGO_URI=mongodb://admin:SuperSecretPassword123!@cluster0.mongodb.net/attendance_db\n"
        "PORT=8000\n",
        encoding="utf-8",
    )

    # 2. config.py with hardcoded database URI
    config_file = repo / "config.py"
    config_file.write_text(
        "class Settings:\n"
        "    SUPABASE_URL = 'https://prod-univ-portal.supabase.co'\n"
        "    MONGO_URI = 'mongodb://root:SecretMongoPass999@127.0.0.1:27017/attendance_db'\n",
        encoding="utf-8",
    )

    # 3. services/attendance_service.py with:
    # - find_one() for view_attendance (Historical truncation)
    # - $push fallback for mark_attendance (Array race condition)
    # - create_session() with insert_one
    # - finalize_session() backend endpoint
    services_dir = repo / "services"
    services_dir.mkdir(parents=True, exist_ok=True)
    att_service = services_dir / "attendance_service.py"
    att_service.write_text(
        "from pymongo import MongoClient\n"
        "\n"
        "client = MongoClient('mongodb://localhost:27017')\n"
        "db = client['attendance_db']\n"
        "\n"
        "def create_session(session_id: str, date: str, class_id: str):\n"
        "    doc = {'session_id': session_id, 'date': date, 'class_id': class_id, 'students': [], 'status': 'active'}\n"
        "    return db.attendance_records.insert_one(doc)\n"
        "\n"
        "def mark_attendance(session_id: str, student_id: str):\n"
        "    # Check then push race condition:\n"
        "    existing = db.attendance_records.find_one({'session_id': session_id, 'students.student_id': student_id})\n"
        "    if not existing:\n"
        "        return db.attendance_records.update_one(\n"
        "            {'session_id': session_id},\n"
        "            {'$push': {'students': {'student_id': student_id, 'timestamp': '10:00'}}}\n"
        "        )\n"
        "    return None\n"
        "\n"
        "def view_attendance(class_id: str):\n"
        "    # Historical data truncation bug: find_one() returns only 1 session\n"
        "    return db.attendance_records.find_one({'class_id': class_id})\n"
        "\n"
        "def finalize_session(session_id: str):\n"
        "    return db.attendance_records.update_one({'session_id': session_id}, {'$set': {'status': 'closed'}})\n",
        encoding="utf-8",
    )

    # 4. frontend/components/CameraCapture.js
    # Stops camera stream locally but NEVER calls backend finalize_session endpoint
    frontend_dir = repo / "frontend" / "components"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    camera_file = frontend_dir / "CameraCapture.js"
    camera_file.write_text(
        "export function stopCameraRecognition(stream) {\n"
        "    console.log('Stopping recognition video track...');\n"
        "    stream.getTracks().forEach(track => track.stop());\n"
        "    // Note: session/finalize is never dispatched\n"
        "}\n",
        encoding="utf-8",
    )

    return repo


def test_redact_uri():
    """Verify that credentials are strictly redacted from URIs."""
    raw = "mongodb://admin:super_secret_password@cluster0.net:27017/db"
    redacted = redact_uri(raw)
    assert "super_secret_password" not in redacted
    assert "<REDACTED>" in redacted
    assert "admin" in redacted

    raw_pg = "postgresql://myuser:secret123@localhost:5432/test"
    redacted_pg = redact_uri(raw_pg)
    assert "secret123" not in redacted_pg
    assert "<REDACTED>" in redacted_pg


def test_forensic_database_detection_and_distinction(attendance_repo: Path):
    """
    Verify:
    1. MongoDB is detected as ACTUALLY USED.
    2. Supabase is detected as CONFIGURED BUT UNUSED / EXTERNAL REFERENCE.
    3. Classification tags are assigned properly.
    """
    rel_files = list(attendance_repo.rglob("*"))
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=[p.relative_to(attendance_repo) for p in rel_files if p.is_file()],
        ast_data_by_file={},
        repo_name="attendance-system",
    )

    db_map = {db.name: db for db in report.databases}
    assert "MongoDB" in db_map
    assert db_map["MongoDB"].status == "ACTUALLY USED"
    assert db_map["MongoDB"].classification == "[CODE VERIFIED]"

    assert "Supabase" in db_map
    assert db_map["Supabase"].status == "CONFIGURED BUT UNUSED"
    assert db_map["Supabase"].classification == "[CONFIG VERIFIED]"
    assert "zero active queries" in db_map["Supabase"].evidence.lower()


def test_forensic_query_and_write_detection(attendance_repo: Path):
    """
    Verify AST detects insert, push, and find_one operations.
    """
    rel_files = [p.relative_to(attendance_repo) for p in attendance_repo.rglob("*") if p.is_file()]
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=rel_files,
        ast_data_by_file={},
    )

    ops = report.write_operations + report.read_operations
    op_types = {op.operation for op in ops}

    assert "INSERT" in op_types
    assert "PUSH" in op_types
    assert "FIND_ONE" in op_types

    # Find the push operation
    push_ops = [op for op in report.write_operations if op.operation == "PUSH"]
    assert len(push_ops) >= 1
    assert push_ops[0].function == "mark_attendance"
    assert push_ops[0].collection_or_table == "attendance_records"


def test_forensic_historical_truncation_detection(attendance_repo: Path):
    """
    Verify that find_one() on view_attendance is detected as CRITICAL Query Truncation.
    """
    rel_files = [p.relative_to(attendance_repo) for p in attendance_repo.rglob("*") if p.is_file()]
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=rel_files,
        ast_data_by_file={},
    )

    trunc_findings = [f for f in report.findings if f.category == "Query Truncation"]
    assert len(trunc_findings) >= 1
    f = trunc_findings[0]
    assert f.severity == "CRITICAL"
    assert f.classification == "[CODE VERIFIED]"
    assert "view_attendance" in f.function
    assert "find_one" in f.evidence


def test_forensic_array_race_condition(attendance_repo: Path):
    """
    Verify that $push into embedded array is flagged as HIGH Race Condition with a ConcurrencyTimeline.
    """
    rel_files = [p.relative_to(attendance_repo) for p in attendance_repo.rglob("*") if p.is_file()]
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=rel_files,
        ast_data_by_file={},
    )

    race_findings = [f for f in report.findings if f.category == "Race Condition"]
    assert len(race_findings) >= 1
    f = race_findings[0]
    assert f.severity == "HIGH"
    assert f.concurrency_timeline is not None
    assert "Request A" in f.concurrency_timeline.step1
    assert "duplicate" in f.concurrency_timeline.outcome.lower()


def test_forensic_abandoned_lifecycle(attendance_repo: Path):
    """
    Verify that frontend stopping camera without calling finalize_session is detected as Missing Lifecycle.
    """
    rel_files = [p.relative_to(attendance_repo) for p in attendance_repo.rglob("*") if p.is_file()]
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=rel_files,
        ast_data_by_file={},
    )

    lifecycle_findings = [f for f in report.findings if f.category == "Missing Lifecycle"]
    assert len(lifecycle_findings) >= 1
    f = lifecycle_findings[0]
    assert f.severity == "HIGH"
    assert "finalize" in f.evidence.lower()


def test_forensic_credential_redaction_in_findings(attendance_repo: Path):
    """
    Verify hardcoded credentials are detected and strictly REDACTED in evidence.
    """
    rel_files = [p.relative_to(attendance_repo) for p in attendance_repo.rglob("*") if p.is_file()]
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=rel_files,
        ast_data_by_file={},
    )

    sec_findings = [f for f in report.findings if f.category == "Credential Exposure"]
    assert len(sec_findings) >= 1
    for sf in sec_findings:
        assert sf.severity == "CRITICAL"
        assert "<REDACTED>" in sf.evidence
        assert "SuperSecretPassword123!" not in sf.evidence
        assert "SecretMongoPass999" not in sf.evidence


def test_forensic_cross_checks_and_root_cause(attendance_repo: Path):
    """
    Verify cross-checks surface CONFLICTING EVIDENCE and root-cause tree separates symptoms from architecture.
    """
    rel_files = [p.relative_to(attendance_repo) for p in attendance_repo.rglob("*") if p.is_file()]
    report = forensic_service.analyze_workspace(
        workspace_path=attendance_repo,
        relative_files=rel_files,
        ast_data_by_file={},
    )

    # Cross-checks
    verdicts = {cc.verdict for cc in report.cross_checks}
    assert "CONFLICTING EVIDENCE" in verdicts
    assert "DISCONNECTED" in verdicts

    # Root causes
    assert len(report.root_causes) >= 2
    rc_titles = [rc.title for rc in report.root_causes]
    assert any("Attendance Invisibility" in t for t in rc_titles)
    assert any("Duplicate Student Attendance" in t for t in rc_titles)


def test_forensic_api_endpoints(client: TestClient):
    """
    Test GET and POST /api/repositories/{id}/forensic endpoints against demo repository.
    """
    # 1. GET forensic report
    res = client.get("/api/repositories/repo-student-mgmt/forensic")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    report = data["data"]

    assert report["repo_id"] == "repo-student-mgmt"
    assert len(report["databases"]) >= 2
    assert len(report["findings"]) >= 4
    assert len(report["root_causes"]) >= 2

    # 2. POST with custom Supabase URL
    post_res = client.post(
        "/api/repositories/repo-student-mgmt/forensic",
        json={"supabase_url": "https://custom-project.supabase.co"},
    )
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["success"] is True
    assert post_data["data"]["unverified_items"][0]["classification"] == "[UNVERIFIED]"
