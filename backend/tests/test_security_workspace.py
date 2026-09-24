"""Tests for security guardrails, path validation, and workspace isolation."""

from pathlib import Path
import pytest
from app.core.security import assert_safe_path, validate_repository_source, is_safe_source_file
from app.core.workspace import workspace_manager


def test_assert_safe_path_valid(tmp_path: Path):
    base = tmp_path / "workspace"
    base.mkdir()
    child = base / "src" / "index.py"
    child.parent.mkdir()
    child.touch()

    safe = assert_safe_path(base, "src/index.py")
    assert safe == child.resolve()


def test_assert_safe_path_traversal_attack(tmp_path: Path):
    base = tmp_path / "workspace"
    base.mkdir()

    with pytest.raises(PermissionError):
        assert_safe_path(base, "../../../etc/passwd")

    with pytest.raises(PermissionError):
        assert_safe_path(base, "..\\..\\windows\\system32")


def test_validate_repository_source_github():
    res = validate_repository_source("https://github.com/fastapi/fastapi")
    assert res["type"] == "github"
    assert res["owner"] == "fastapi"
    assert res["repo"] == "fastapi"
    assert res["clean_url"] == "https://github.com/fastapi/fastapi"


def test_validate_repository_source_local(tmp_path: Path):
    local_dir = tmp_path / "my_project"
    local_dir.mkdir()
    res = validate_repository_source(str(local_dir))
    assert res["type"] == "local"
    assert res["repo"] == "my_project"


def test_validate_repository_source_invalid():
    with pytest.raises(ValueError):
        validate_repository_source("not-a-valid-url-or-dir")

    with pytest.raises(ValueError):
        validate_repository_source("")


def test_is_safe_source_file(tmp_path: Path):
    good_file = tmp_path / "main.py"
    good_file.touch()
    assert is_safe_source_file(good_file) is True

    git_file = tmp_path / ".git" / "config"
    assert is_safe_source_file(git_file) is False

    node_module = tmp_path / "node_modules" / "pkg" / "index.js"
    assert is_safe_source_file(node_module) is False

    bin_file = tmp_path / "app.exe"
    bin_file.touch()
    assert is_safe_source_file(bin_file) is False


def test_workspace_manager_lifecycle():
    ws = workspace_manager.create_workspace(prefix="test")
    assert ws.path.exists()
    assert workspace_manager.get_workspace(ws.id) is not None

    cleaned = workspace_manager.cleanup_workspace(ws.id)
    assert cleaned is True
    assert not ws.path.exists()
    assert workspace_manager.get_workspace(ws.id) is None
