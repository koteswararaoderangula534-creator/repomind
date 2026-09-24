# RepoMind Backend Service

> Autonomous Codebase Understanding & Safe Refactoring Agent API

RepoMind's backend is a high-performance Python application built on **FastAPI**, **Pydantic v2**, and **Python AST**. It provides static code analysis, architectural topology extraction, deterministic code health audits, static impact analysis, refactoring decomposition plans, and safety verification.

---

## 🏗️ Architecture & Philosophy

1. **Zero Untrusted Code Execution:**
   - Static analysis is performed purely via Python's built-in `ast` module.
   - Repositories are treated as untrusted input. No arbitrary repository code or scripts are executed during analysis.
2. **Safe Workspace Lifecycle:**
   - Repositories are cloned or extracted into isolated temporary workspaces (`~/.repomind_workspaces/`).
   - Every file path resolution is checked with `assert_safe_path` using directory containment checks to prevent path traversal attacks (`../`).
3. **No Database Yet (By Design):**
   - Analysis state is maintained in-memory via `repo_store`. Workspaces can be cleared or refreshed without external database dependencies.
4. **No Real LLM Yet (Clean Abstraction):**
   - The `CodeReasoningService` extracts real code evidence, docstrings, and call-graphs directly from parsed AST trees, producing structured technical and junior-friendly explanations.
5. **Universal Ingestion:**
   - Supports both GitHub repository URLs (`https://github.com/owner/repo`) and local paths for testing.
   - Graceful fallback: If `git` CLI is not installed on the host machine, RepoMind automatically falls back to secure GitHub Zip archive downloads via HTTP.

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app, CORS, middleware, lifespan router
│   ├── core/
│   │   ├── config.py               # Settings & limits (file size, timeout, CORS)
│   │   ├── logging.py              # Structured logging
│   │   ├── security.py             # Path traversal prevention & URL validation
│   │   ├── store.py                # In-memory repository session storage
│   │   └── workspace.py            # Temporary workspace isolation
│   ├── models/
│   │   ├── common.py               # API envelope: {"success": bool, "data": Any, "error": Any}
│   │   ├── repository.py           # AnalyzeRequest, Metrics, LayerSummary, Overview
│   │   ├── architecture.py         # ArchNode, ArchEdge, ArchLayer, ArchitectureGraph
│   │   ├── finding.py              # CodeHealthFinding, SeverityLevel
│   │   ├── impact.py               # ImpactAnalysisRequest, ImpactResponse, BlastRadius
│   │   ├── ask.py                  # AskRequest, AskResponse, FlowStep, SourceReference
│   │   ├── refactor.py             # RefactorPlan, DecompositionItem, DiffViewerData
│   │   └── verification.py         # VerificationResult, TestSuiteResult
│   ├── services/
│   │   ├── repository_service.py   # Safe cloning, zip download fallback & local staging
│   │   ├── scanner_service.py      # File tree scanning, language detection, LOC
│   │   ├── ast_service.py          # Python AST parser (functions, classes, calls, complexity)
│   │   ├── health_service.py       # Deterministic static rule engine (secrets, SQLi, God functions)
│   │   ├── architecture_service.py # Interactive layer & inter-service edge topology generator
│   │   ├── impact_service.py       # Blast radius calculation & caller graph tracing
│   │   ├── reasoning_service.py    # CodeReasoningService (Q&A with verifiable code evidence)
│   │   ├── refactor_service.py     # Decomposed refactoring plans with dual explanations
│   │   ├── diff_service.py         # Line-by-line unified diff generator
│   │   └── verification_service.py # Automated test safety verification runner
│   └── api/
│       ├── health.py               # GET  /api/health
│       ├── repositories.py         # POST /api/repositories/analyze, GET /api/repositories/recent
│       ├── architecture.py         # GET  /api/repositories/{id}/architecture
│       ├── code_health.py          # GET  /api/repositories/{id}/findings
│       ├── impact.py               # POST /api/repositories/{id}/impact
│       ├── ask.py                  # POST /api/repositories/{id}/ask
│       ├── refactor.py             # POST /api/repositories/{id}/refactor, GET .../diff/{id}
│       └── verification.py         # POST /api/repositories/{id}/verify
├── tests/
│   ├── conftest.py                 # Pytest fixtures & sample repository generator
│   ├── test_health.py              # Health check tests
│   ├── test_security_workspace.py  # Path traversal & workspace isolation tests
│   ├── test_scanner_and_ast.py     # File scanner & AST parser tests
│   ├── test_health_service.py      # Deterministic rule checks (SEC-001, DES-001, ARCH-001)
│   ├── test_impact_and_reasoning.py# Impact blast radius & Q&A tests
│   └── test_api_endpoints.py       # End-to-end integration tests for all 10 endpoints
├── requirements.txt                # Dependencies
├── run.py                          # Server launcher
└── README.md                       # Documentation
```

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Run the Server
```bash
python backend/run.py
```
Or directly with Uvicorn:
```bash
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI:** `http://localhost:8000/api/docs`
- **ReDoc:** `http://localhost:8000/api/redoc`

### 3. Run the Test Suite
```bash
cd backend
python -m pytest tests/ -v
```

---

## 📡 API Endpoints Reference

All endpoints strictly follow the standard RepoMind response envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and timestamp |
| `POST` | `/api/repositories/analyze` | Ingests, scans, parses AST, and analyzes a repository |
| `GET` | `/api/repositories/recent` | Lists recently analyzed repositories |
| `GET` | `/api/repositories/{id}/overview` | Returns repository overview metrics and layers |
| `GET` | `/api/repositories/{id}/architecture` | Returns interactive architecture layers, nodes, and edges |
| `GET` | `/api/repositories/{id}/findings` | Returns static code health findings (supports `?severity=HIGH`) |
| `GET` | `/api/repositories/{id}/forensic` | Returns deep repository & database forensic diagnostic report |
| `POST` | `/api/repositories/{id}/forensic` | Re-evaluates forensic analysis with optional external Supabase URL |
| `POST` | `/api/repositories/{id}/impact` | Computes static blast radius and caller graph for an entity |
| `POST` | `/api/repositories/{id}/ask` | Structured Q&A explaining architecture with code snippets |
| `POST` | `/api/repositories/{id}/refactor` | Generates a decomposed refactoring plan |
| `GET` | `/api/repositories/{id}/diff/{refactor_id}` | Retrieves line-by-line unified diff data |
| `POST` | `/api/repositories/{id}/verify` | Runs automated verification and test comparisons |

---

## 🛡️ Deterministic Static Rules Implemented

- **`FRN-001` (Historical Data Truncation):** Flags `find_one()` used in functions meant to retrieve historical/reporting datasets.
- **`FRN-002` (Embedded Array Race Condition):** Flags non-atomic `$push` updates into embedded arrays without `$addToSet` or compound unique keys.
- **`FRN-003` (Abandoned Session Lifecycle):** Flags frontend client streams stopping locally without dispatching backend session finalization.
- **`FRN-004` (Hardcoded DB Credentials):** Detects raw database connection strings; reports with credentials `<REDACTED>`.
- **`FRN-005` (Database Platform Mismatch):** Identifies external databases (e.g. Supabase) present in config/env but possessing 0 runtime operations.
- **`FRN-006` (Missing Composite Unique Constraints):** Flags collections storing embedded arrays without compound uniqueness enforcement.
- **`SEC-001` (Hardcoded Secret):** Detects raw credentials, tokens, or JWT signing keys in source files.
- **`SEC-002` (SQL Injection Risk):** Detects unparameterized string formatting inside `.execute()` calls.
- **`DES-001` (Large Function / God Method):** Identifies functions exceeding 50 lines of code.
- **`DES-002` (High Cyclomatic Complexity):** Identifies functions with branching complexity score > 8.
- **`ARCH-001` (Direct DB Query in Routes):** Flags route handlers that bypass service/repository layers.
- **`CLN-001` (Deprecated Syntax):** Identifies deprecated Pydantic v1 `.dict()` or obsolete modules.
- **`TYP-001` (Missing Type Annotations):** Identifies public functions lacking explicit return types.
