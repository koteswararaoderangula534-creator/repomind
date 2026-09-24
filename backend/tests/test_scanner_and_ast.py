"""Tests for ScannerService and ASTService."""

from pathlib import Path
from app.services.scanner_service import scanner_service
from app.services.ast_service import ast_service


def test_scanner_service(sample_repo: Path):
    scan_res = scanner_service.scan_workspace(sample_repo)
    metrics = scan_res["metrics"]

    assert metrics.filesCount >= 5
    assert metrics.codeLines > 50
    assert metrics.dependenciesCount >= 4
    assert scan_res["primary_language"] == "Python"
    assert len(scan_res["layers"]) == 4


def test_ast_service_parse_file(sample_repo: Path):
    file_path = sample_repo / "services" / "order_service.py"
    ast_res = ast_service.parse_python_file(file_path, "services/order_service.py")

    functions = ast_res["functions"]
    assert len(functions) == 2

    func_names = [f.name for f in functions]
    assert "process_order" in func_names
    assert "helper_func" in func_names

    process_order_fn = next(f for f in functions if f.name == "process_order")
    assert process_order_fn.docstring == "Process customer order monolithic handler."
    assert process_order_fn.arguments == ["order_data", "user_id"]
    assert (process_order_fn.end_line - process_order_fn.start_line) > 50
