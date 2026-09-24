"""Pytest fixtures and test environment setup."""

import shutil
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_repo(tmp_path: Path) -> Path:
    """Creates a realistic miniature test repository structure for static analysis tests."""
    repo_dir = tmp_path / "sample_repo"
    repo_dir.mkdir(parents=True, exist_ok=True)

    # 1. config.py with hardcoded secret
    config_file = repo_dir / "config.py"
    config_file.write_text(
        "class Settings:\n"
        "    APP_NAME = 'TestApp'\n"
        "    SECRET_KEY = 'hardcoded_jwt_secret_token_12345'\n"
        "    ALGORITHM = 'HS256'\n",
        encoding="utf-8",
    )

    # 2. services/order_service.py with a large function
    services_dir = repo_dir / "services"
    services_dir.mkdir()
    order_file = services_dir / "order_service.py"

    large_body = "\n".join([f"    x_{i} = {i} * 2" for i in range(55)])
    order_file.write_text(
        "def process_order(order_data: dict, user_id: str):\n"
        "    '''Process customer order monolithic handler.'''\n"
        f"{large_body}\n"
        "    return {'status': 'ok'}\n\n"
        "def helper_func():\n"
        "    return 42\n",
        encoding="utf-8",
    )

    # 3. api/routes/enrollment.py with direct DB query
    routes_dir = repo_dir / "api" / "routes"
    routes_dir.mkdir(parents=True)
    enroll_file = routes_dir / "enrollment.py"
    enroll_file.write_text(
        "def enroll_student(db, student_id: int):\n"
        "    record = db.query('Enrollment').filter(id=student_id)\n"
        "    return record\n",
        encoding="utf-8",
    )

    # 4. tests/test_orders.py
    tests_dir = repo_dir / "tests"
    tests_dir.mkdir()
    test_file = tests_dir / "test_orders.py"
    test_file.write_text(
        "def test_process_order():\n"
        "    assert True\n\n"
        "def test_helper():\n"
        "    assert True\n",
        encoding="utf-8",
    )

    # 5. requirements.txt
    req_file = repo_dir / "requirements.txt"
    req_file.write_text("fastapi==0.110.0\nuvicorn==0.28.0\npydantic==2.6.0\npytest==8.0.0\n", encoding="utf-8")

    return repo_dir
