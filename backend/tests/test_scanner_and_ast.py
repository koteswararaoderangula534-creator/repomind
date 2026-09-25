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


def test_polyglot_ast_service_parsing(tmp_path: Path):
    """Verifies polyglot symbol parsing across JS, TS, Go, Java, SQL, and Rust."""
    # 1. JavaScript file
    js_file = tmp_path / "app.js"
    js_file.write_text(
        "import React, { useState } from 'react';\n"
        "import axios from 'axios';\n"
        "export function fetchData(userId) {\n"
        "    if (userId) { return axios.get(`/users/${userId}`); }\n"
        "    return null;\n"
        "}\n"
        "export const calculateTax = (amount, rate) => {\n"
        "    return amount * rate;\n"
        "};\n",
        encoding="utf-8",
    )
    js_res = ast_service.parse_source_file(js_file, "app.js")
    assert js_res["language"] == "JavaScript"
    assert js_res["support_level"] == "Full AST"
    assert len(js_res["imports"]) >= 2
    js_funcs = [f.name for f in js_res["functions"]]
    assert "fetchData" in js_funcs
    assert "calculateTax" in js_funcs

    # 2. TypeScript React file
    ts_file = tmp_path / "Component.tsx"
    ts_file.write_text(
        "import { useEffect } from 'react';\n"
        "export class OrderViewer extends React.Component {\n"
        "    render() { return <div>Order</div>; }\n"
        "}\n",
        encoding="utf-8",
    )
    ts_res = ast_service.parse_source_file(ts_file, "Component.tsx")
    assert ts_res["language"] == "TypeScript"
    assert len(ts_res["classes"]) == 1
    assert ts_res["classes"][0].name == "OrderViewer"

    # 3. Go file
    go_file = tmp_path / "server.go"
    go_file.write_text(
        "package main\n"
        "import \"net/http\"\n"
        "type UserSession struct { ID string }\n"
        "func HandleAuth(w http.ResponseWriter, r *http.Request) {\n"
        "    if r.Method == \"POST\" { return }\n"
        "}\n",
        encoding="utf-8",
    )
    go_res = ast_service.parse_source_file(go_file, "server.go")
    assert go_res["language"] == "Go"
    assert go_res["support_level"] == "Symbol AST"
    assert len(go_res["classes"]) == 1
    assert go_res["classes"][0].name == "UserSession"
    assert len(go_res["functions"]) == 1
    assert go_res["functions"][0].name == "HandleAuth"

    # 4. Java file
    java_file = tmp_path / "AuthService.java"
    java_file.write_text(
        "package com.repomind.auth;\n"
        "import java.util.List;\n"
        "public class AuthService {\n"
        "    public boolean validateToken(String token) {\n"
        "        if (token != null) { return true; }\n"
        "        return false;\n"
        "    }\n"
        "}\n",
        encoding="utf-8",
    )
    java_res = ast_service.parse_source_file(java_file, "AuthService.java")
    assert java_res["language"] == "Java"
    assert java_res["support_level"] == "Symbol AST"
    assert len(java_res["classes"]) == 1
    assert java_res["classes"][0].name == "AuthService"
    assert len(java_res["functions"]) == 1
    assert java_res["functions"][0].name == "validateToken"

    # 5. SQL file
    sql_file = tmp_path / "schema.sql"
    sql_file.write_text(
        "CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50));\n"
        "CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT);\n",
        encoding="utf-8",
    )
    sql_res = ast_service.parse_source_file(sql_file, "schema.sql")
    assert sql_res["language"] == "SQL"
    assert len(sql_res["classes"]) == 2
    assert sql_res["classes"][0].name == "users"

    # 6. Rust file (Detection Only limitation)
    rust_file = tmp_path / "main.rs"
    rust_file.write_text("fn main() { println!(\"Hello World\"); }", encoding="utf-8")
    rust_res = ast_service.parse_source_file(rust_file, "main.rs")
    assert rust_res["language"] == "Rust"
    assert rust_res["support_level"] == "Detection Only"
    assert "currently unavailable for Rust" in rust_res["note"]

