"""End-to-end integration tests for all RepoMind FastAPI endpoints."""

from pathlib import Path
from fastapi.testclient import TestClient


def test_repository_analyze_and_full_workflow(client: TestClient, sample_repo: Path):
    # 1. POST /api/repositories/analyze with local test repository
    analyze_payload = {
        "url": str(sample_repo),
        "branch": "main",
    }
    resp = client.post("/api/repositories/analyze", json=analyze_payload)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    repo_data = res_data["data"]

    repo_id = repo_data["id"]
    assert "sample-repo" in repo_id or "sample_repo" in repo_id
    assert repo_data["metrics"]["filesCount"] >= 5
    assert repo_data["metrics"]["findingsCount"] >= 3

    # 2. GET /api/repositories/recent
    recent_resp = client.get("/api/repositories/recent")
    assert recent_resp.status_code == 200
    recent_list = recent_resp.json()["data"]
    assert len(recent_list) >= 1
    assert any(r["id"] == repo_id for r in recent_list)

    # 3. GET /api/repositories/{id}/overview
    overview_resp = client.get(f"/api/repositories/{repo_id}/overview")
    assert overview_resp.status_code == 200
    assert overview_resp.json()["data"]["id"] == repo_id

    # 4. GET /api/repositories/{id}/architecture
    arch_resp = client.get(f"/api/repositories/{repo_id}/architecture")
    assert arch_resp.status_code == 200
    arch_data = arch_resp.json()["data"]
    assert "layers" in arch_data
    assert "edges" in arch_data
    assert len(arch_data["layers"]) >= 3

    # 5. GET /api/repositories/{id}/findings
    findings_resp = client.get(f"/api/repositories/{repo_id}/findings")
    assert findings_resp.status_code == 200
    findings = findings_resp.json()["data"]
    assert len(findings) >= 3

    # Test severity filtering
    high_findings_resp = client.get(f"/api/repositories/{repo_id}/findings?severity=HIGH")
    assert high_findings_resp.status_code == 200
    high_findings = high_findings_resp.json()["data"]
    for hf in high_findings:
        assert hf["severity"] == "HIGH"

    # 6. POST /api/repositories/{id}/impact
    impact_resp = client.post(
        f"/api/repositories/{repo_id}/impact",
        json={"entity": "process_order", "file": "services/order_service.py"},
    )
    assert impact_resp.status_code == 200
    impact_data = impact_resp.json()["data"]
    assert "process_order" in impact_data["selectedEntity"]
    assert "blastRadiusScore" in impact_data["summary"]

    # 7. POST /api/repositories/{id}/ask
    ask_resp = client.post(
        f"/api/repositories/{repo_id}/ask",
        json={"query": "How does authentication work?"},
    )
    assert ask_resp.status_code == 200
    ask_data = ask_resp.json()["data"]
    assert "technicalExplanation" in ask_data
    assert "juniorExplanation" in ask_data
    assert len(ask_data["sources"]) > 0

    # 8. POST /api/repositories/{id}/refactor
    refactor_resp = client.post(
        f"/api/repositories/{repo_id}/refactor",
        json={"target_function": "process_order", "file": "services/order_service.py"},
    )
    assert refactor_resp.status_code == 200
    refactor_data = refactor_resp.json()["data"]
    refactor_id = refactor_data["id"]
    assert "decompositionPlan" in refactor_data
    assert len(refactor_data["decompositionPlan"]) == 4

    # 9. GET /api/repositories/{id}/diff/{refactor_id}
    diff_resp = client.get(f"/api/repositories/{repo_id}/diff/{refactor_id}")
    assert diff_resp.status_code == 200
    diff_data = diff_resp.json()["data"]
    assert "unifiedDiff" in diff_data
    assert len(diff_data["unifiedDiff"]) > 0

    # 10. POST /api/repositories/{id}/verify
    verify_resp = client.post(
        f"/api/repositories/{repo_id}/verify",
        json={"refactor_id": refactor_id},
    )
    verify_data = verify_resp.json()["data"]
    assert verify_data["status"] == "Passed"
    assert verify_data["totalTests"] >= 2
    assert len(verify_data["suites"]) >= 1


def test_repository_not_found(client: TestClient):
    resp = client.get("/api/repositories/non-existent-repo-9999/overview")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "REPO_NOT_FOUND"
