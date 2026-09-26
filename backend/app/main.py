import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.store import repo_store, AnalyzedRepositorySession
from app.models.common import error_response
from app.models.repository import (
    RepositoryOverview,
    RepositoryMetrics,
    FindingsBreakdown,
    LayerSummary,
    LanguageComposition,
)
from app.models.finding import CodeHealthFinding
from app.api import (
    health,
    repositories,
    architecture,
    code_health,
    impact,
    ask,
    refactor,
    verification,
    forensic,
    llm,
)
from app.services.architecture_service import architecture_service
from app.services.refactor_service import refactor_service
from app.services.diff_service import diff_service
from app.services.verification_service import verification_service
from app.services.forensic_service import forensic_service
from app.models.forensic import (
    ForensicReport,
    DatabaseDetected,
    DataEntity,
    DatabaseOperation,
    DataFlowTrace,
    DataFlowStep,
    IntegrityFinding,
    ConcurrencyTimeline,
    RootCauseNode,
    CrossCheckItem,
    UnverifiedItem,
)
from pathlib import Path

# Initialize logging
configure_logging()
logger = get_logger("main")


def populate_demo_repository():
    """Populates default demonstration repository so frontend functions immediately out of the box."""
    demo_id = "repo-student-mgmt"
    demo_overview = RepositoryOverview(
        id=demo_id,
        name="Demo Repository (Full-Stack SaaS Core)",
        url="https://github.com/repomind/demo-saas-platform",
        branch="main",
        commit="8f4a9b2",
        primaryLanguage="Python 3.11",
        secondaryLanguage="FastAPI / TypeScript",
        languages=[
            LanguageComposition(
                name="Python",
                percentage=54.5,
                filesCount=56,
                linesCount=6800,
                supportLevel="Full AST",
                capabilities={"detection": True, "ast": True, "dependencies": True, "impact": True, "risk": True, "health": True, "refactor": True, "verification": True},
            ),
            LanguageComposition(
                name="TypeScript",
                percentage=31.2,
                filesCount=48,
                linesCount=3900,
                supportLevel="Full AST",
                capabilities={"detection": True, "ast": True, "dependencies": True, "impact": True, "risk": True, "health": True, "refactor": True, "verification": True},
            ),
            LanguageComposition(
                name="SQL",
                percentage=10.3,
                filesCount=21,
                linesCount=1280,
                supportLevel="Symbol AST",
                capabilities={"detection": True, "ast": True, "dependencies": False, "impact": False, "risk": True, "health": True, "refactor": False, "verification": False},
            ),
            LanguageComposition(
                name="YAML",
                percentage=4.0,
                filesCount=8,
                linesCount=500,
                supportLevel="Detection Only",
                capabilities={"detection": True, "ast": False, "dependencies": False, "impact": False, "risk": False, "health": False, "refactor": False, "verification": False},
            ),
        ],
        lastAnalyzed="Today at 18:32 UTC",
        analysisDuration="14.2s",
        status="Analyzed",
        metrics=RepositoryMetrics(
            filesCount=147,
            modulesCount=18,
            testsCount=42,
            findingsCount=13,
            findingsBreakdown=FindingsBreakdown(high=2, medium=7, low=4),
            codeLines=12480,
            testCoverage="88.4% [Demo Sandbox]",
            dependenciesCount=34,
        ),
        layers=[
            LayerSummary(name="Frontend", tech="Next.js / TypeScript", files=48, status="Healthy"),
            LayerSummary(name="API Gateway", tech="FastAPI / Uvicorn", files=22, status="1 Smells"),
            LayerSummary(name="Core Services", tech="Python Services", files=56, status="10 Findings"),
            LayerSummary(name="Database", tech="PostgreSQL 15 / SQLAlchemy", files=21, status="2 Findings"),
        ],
        classification="[Demo Repository] Full-Stack SaaS Application",
        ai_summary=(
            "[Demo Repository] RepoMind analyzed this demonstration codebase as a polyglot Python & TypeScript SaaS commerce platform. "
            "The backend utilizes FastAPI with MongoDB and PostgreSQL ORM models, with full AST dependency mapping, "
            "6 static forensic hazard patterns, and automated refactoring simulation."
        ),
        technologies=["FastAPI", "Python 3.11", "React", "TypeScript", "MongoDB", "SQLAlchemy", "PostgreSQL"],
        databases_detected=["MongoDB (Active Writes & Reads)", "PostgreSQL (ORM Models)", "Supabase (Dormant Configuration)"],
    )

    demo_arch = architecture_service.build_architecture_graph(
        repo_name="demo-saas-platform",
        relative_files=[],
        ast_data_by_file={},
    )

    demo_findings = [
        CodeHealthFinding(
            id="FND-001",
            severity="HIGH",
            rule="SEC-012",
            title="Hardcoded Secret",
            description="JWT secret signing key is hardcoded directly in configuration file instead of reading from environment variables.",
            juniorDescription="A sensitive password/key is written plainly in the code. Anyone who can see this file could create fake logins. It should be loaded from a secure environment secret instead.",
            file="config.py",
            line=27,
            module="Configuration",
            status="Open",
            category="Security",
            suggestedRefactorId="REF-SEC-01",
            impactEntity="SECRET_KEY",
            codeSnippet=(
                "25: class Settings(BaseSettings):\n"
                "26:     APP_NAME: str = 'CoreSaaSAPI'\n"
                "27:     SECRET_KEY: str = 'd948a73f9104b2e811c038290fbb62a1'  # RISK: hardcoded\n"
                "28:     ALGORITHM: str = 'HS256'\n"
                "29:     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60"
            ),
        ),
        CodeHealthFinding(
            id="FND-002",
            severity="HIGH",
            rule="SEC-004",
            title="SQL Injection Risk in User Query",
            description="Raw formatted SQL query using f-strings inside cursor execution bypasses parameter sanitization.",
            juniorDescription="User input is directly inserted into a database query. If someone puts malicious commands into their search, the database might execute them. Using prepared parameters fixes this.",
            file="services/user_service.py",
            line=114,
            module="UserService",
            status="Open",
            category="Security",
            suggestedRefactorId=None,
            impactEntity="search_users_raw",
            codeSnippet=(
                "112: def search_users_raw(db, query: str):\n"
                "113:     cursor = db.cursor()\n"
                "114:     sql = f\"SELECT * FROM users WHERE name LIKE '%{query}%'\"\n"
                "115:     cursor.execute(sql)\n"
                "116:     return cursor.fetchall()"
            ),
        ),
        CodeHealthFinding(
            id="FND-003",
            severity="MEDIUM",
            rule="DES-008",
            title="Large Function (Single Responsibility Violation)",
            description="Function process_order() handles 4 separate concerns: payload validation, payment processing, database record persistence, and notification dispatch.",
            juniorDescription="This function is doing too many jobs at once. When a function validates input, talks to a bank, saves to a database, and sends emails all in one place, bugs are hard to find. We can split it into small helper functions.",
            file="orders.py",
            line=84,
            module="OrderProcessing",
            status="Open",
            category="Code Smells",
            suggestedRefactorId="REF-ORDER-01",
            impactEntity="process_order",
            codeSnippet=(
                "84: def process_order(order_data: dict, user_id: str, db_session) -> dict:\n"
                "85:     # 1. Validation logic (18 lines)\n"
                "86:     if not order_data.get('items'): raise ValueError('Empty items')\n"
                "...\n"
                "104:    # 2. Payment processing (24 lines)\n"
                "128:    # 3. Database persistence (19 lines)\n"
                "147:    # 4. Email notifications (21 lines)"
            ),
        ),
        CodeHealthFinding(
            id="FND-004",
            severity="MEDIUM",
            rule="ARCH-002",
            title="Direct DB Access in Route Handler",
            description="Route handler directly invokes SQLAlchemy session query instead of delegating through subscription service layer.",
            juniorDescription="The web route is talking directly to the database instead of asking the service layer. Keeping database logic in service files prevents messy duplication across routes.",
            file="api/routes/subscriptions.py",
            line=42,
            module="APIRoutes",
            status="Open",
            category="Architecture",
            suggestedRefactorId=None,
            impactEntity="subscribe_user_endpoint",
            codeSnippet=(
                "41: @router.post('/subscribe')\n"
                "42: def subscribe_user(payload: SubscribeSchema, db: Session = Depends(get_db)):\n"
                "43:     # Bypassing service layer:\n"
                "44:     record = db.query(Subscription).filter_by(user_id=payload.user_id).first()"
            ),
        ),
    ]

    demo_forensic = ForensicReport(
        repo_id=demo_id,
        repo_name="university-sys/student-management-system",
        analyzed_at="Today at 18:32 UTC",
        execution_time_seconds=1.42,
        databases=[
            DatabaseDetected(
                name="MongoDB",
                category="NoSQL Document Database",
                detected_in_config=True,
                detected_in_code=True,
                status="ACTUALLY USED",
                driver_packages=["pymongo", "motor"],
                connection_uris=["mongodb://admin:<REDACTED>@127.0.0.1:27017/student_mgmt"],
                evidence="12 discrete AST database operations detected across service layers (attendance_records, students).",
                classification="[CODE VERIFIED]",
            ),
            DatabaseDetected(
                name="Supabase",
                category="Managed Postgres / BaaS Platform",
                detected_in_config=True,
                detected_in_code=False,
                status="CONFIGURED BUT UNUSED",
                driver_packages=["@supabase/supabase-js"],
                connection_uris=["https://xyz-university.supabase.co"],
                evidence="Detected in environment configuration / parameters, but zero active queries or table operations exist in codebase.",
                classification="[CONFIG VERIFIED]",
            ),
            DatabaseDetected(
                name="PostgreSQL",
                category="Relational SQL Database",
                detected_in_config=True,
                detected_in_code=False,
                status="CONFIGURED BUT UNUSED",
                driver_packages=["psycopg2"],
                connection_uris=["postgresql://postgres:<REDACTED>@localhost:5432/students_db"],
                evidence="Connection string present in sample config; no active direct queries detected in current execution paths.",
                classification="[CONFIG VERIFIED]",
            ),
        ],
        entities=[
            DataEntity(
                name="Attendance Records",
                database="MongoDB",
                collection_or_table="attendance_records",
                inferred_schema={
                    "_id": "ObjectId",
                    "session_id": "string (UUID)",
                    "date": "string (YYYY-MM-DD)",
                    "class_id": "string",
                    "subject": "string",
                    "students": "array[object] (Embedded student attendance records)",
                    "status": "string ('active' | 'closed')",
                    "created_at": "timestamp",
                },
                nested_arrays=["students"],
                primary_key_or_id="session_id",
                unique_constraints=["_id"],
                missing_constraints=["session_id + student_id composite unique index", "students.$.student_id unique constraint"],
                storage_model="one-document-per-session",
                historical_retention="Preserved in storage, but truncated at read layer",
                evidence="[CODE VERIFIED] Collection stores documents for all past sessions; however, read endpoints retrieve only the single most recent session via find_one().",
            ),
            DataEntity(
                name="Students Roster",
                database="MongoDB",
                collection_or_table="students",
                inferred_schema={
                    "_id": "ObjectId",
                    "student_id": "string",
                    "name": "string",
                    "face_encoding": "array[float] (128-d vector)",
                    "email": "string",
                },
                nested_arrays=["face_encoding"],
                primary_key_or_id="student_id",
                unique_constraints=["student_id"],
                missing_constraints=[],
                storage_model="one-document-per-user",
                historical_retention="Full historical retention",
                evidence="[CODE VERIFIED] Master student profile directory.",
            ),
        ],
        write_operations=[
            DatabaseOperation(
                id="OP-MGO-001",
                file="services/attendance_service.py",
                function="mark_attendance",
                line=78,
                database="MongoDB",
                collection_or_table="attendance_records",
                operation="PUSH",
                filter_expr="{'session_id': session_id}",
                fields_modified=["students ($push)"],
                code_snippet="77:     # Fallback push into embedded students array\n78:     db.attendance_records.update_one({'session_id': session_id}, {'$push': {'students': student_record}})",
                evidence_classification="[CODE VERIFIED]",
                confidence=1.0,
            ),
            DatabaseOperation(
                id="OP-MGO-002",
                file="services/attendance_service.py",
                function="create_session",
                line=34,
                database="MongoDB",
                collection_or_table="attendance_records",
                operation="INSERT",
                filter_expr=None,
                fields_modified=["session_id", "date", "class_id", "students", "status"],
                code_snippet="33:     session_doc = {'session_id': session_id, 'date': today, 'class_id': class_id, 'students': [], 'status': 'active'}\n34:     db.attendance_records.insert_one(session_doc)",
                evidence_classification="[CODE VERIFIED]",
                confidence=1.0,
            ),
        ],
        read_operations=[
            DatabaseOperation(
                id="OP-MGO-003",
                file="services/attendance_service.py",
                function="view_attendance",
                line=112,
                database="MongoDB",
                collection_or_table="attendance_records",
                operation="FIND_ONE",
                filter_expr="{'class_id': class_id}",
                fields_modified=[],
                code_snippet="111: def view_attendance(class_id: str):\n112:     record = db.attendance_records.find_one({'class_id': class_id})\n113:     return record",
                evidence_classification="[CODE VERIFIED]",
                confidence=1.0,
            ),
            DatabaseOperation(
                id="OP-MGO-004",
                file="services/student_service.py",
                function="get_student_by_id",
                line=45,
                database="MongoDB",
                collection_or_table="students",
                operation="FIND_ONE",
                filter_expr="{'student_id': student_id}",
                fields_modified=[],
                code_snippet="44: def get_student_by_id(student_id: str):\n45:     return db.students.find_one({'student_id': student_id})",
                evidence_classification="[CODE VERIFIED]",
                confidence=1.0,
            ),
        ],
        flows=[
            DataFlowTrace(
                entity="Attendance Record",
                frontend_trigger="Camera Face Detection / Recognition Stream",
                api_endpoint="POST /api/attendance/mark",
                controller_func="mark_attendance()",
                database_target="attendance_records (MongoDB)",
                read_path="GET /api/attendance/records (find_one())",
                ui_display="Attendance Table / Summary View",
                steps=[
                    DataFlowStep(
                        layer="Frontend",
                        component="CameraCapture.tsx / VideoStream.js",
                        action="Captures video frame, runs local face recognition, and transmits base64/student payload",
                        file="frontend/components/CameraCapture.tsx",
                        line=48,
                    ),
                    DataFlowStep(
                        layer="API Gateway",
                        component="POST /api/attendance/mark",
                        action="Receives student identifier and session parameters, validates body, routes to handler",
                        file="backend/api/routes/attendance.py",
                        line=24,
                    ),
                    DataFlowStep(
                        layer="Service Layer",
                        component="AttendanceService.mark_attendance()",
                        action="Performs check on active session document and executes $push into embedded students array",
                        file="backend/services/attendance_service.py",
                        line=65,
                    ),
                    DataFlowStep(
                        layer="Database",
                        component="MongoDB: attendance_records",
                        action="Appends student entry into students array in matching session_id document",
                        file="backend/services/attendance_service.py",
                        line=78,
                    ),
                    DataFlowStep(
                        layer="Read Path",
                        component="GET /api/attendance/records (view_attendance)",
                        action="Executes find_one() on attendance_records collection, returning single latest document",
                        file="backend/services/attendance_service.py",
                        line=112,
                    ),
                    DataFlowStep(
                        layer="Frontend UI",
                        component="AttendanceHistoryView.tsx",
                        action="Renders single session response. Historical past sessions are omitted.",
                        file="frontend/views/AttendanceHistoryView.tsx",
                        line=32,
                    ),
                ],
            )
        ],
        findings=[
            IntegrityFinding(
                id="FRN-001",
                title="Historical Data Truncation via find_one()",
                severity="CRITICAL",
                category="Query Truncation",
                classification="[CODE VERIFIED]",
                file="services/attendance_service.py",
                function="view_attendance",
                line=112,
                evidence="Function 'view_attendance' executes 'find_one()' on collection 'attendance_records'. In MongoDB, find_one() returns only the first matching document. All previous historical session documents exist in the database but are completely hidden from API consumers and UI views.",
                impact="Only current/single session attendance is displayed. Historical records disappear from the application UI.",
                confidence=1.0,
                code_snippet="111: def view_attendance(class_id: str):\n112:     record = db.attendance_records.find_one({'class_id': class_id})\n113:     return record",
                suggested_fix="Replace 'find_one()' with 'find()' returning a cursor of sessions, or accept a date/session_id filter parameter.",
            ),
            IntegrityFinding(
                id="FRN-002",
                title="Embedded Array Race Condition via $push",
                severity="HIGH",
                category="Race Condition",
                classification="[CODE VERIFIED]",
                file="services/attendance_service.py",
                function="mark_attendance",
                line=78,
                evidence="Function 'mark_attendance' invokes update with '$push' on array field. Because this write is not atomic with the presence check and lacks a unique constraint, concurrent requests create duplicate entries for the same student in the session.",
                impact="Duplicate student attendance entries within the same session document.",
                confidence=1.0,
                concurrency_timeline=ConcurrencyTimeline(
                    trigger="Two rapid concurrent face recognition events for the same student",
                    step1="Request A checks if student is in attendance array -> Returns false (not yet added)",
                    step2="Request B checks if student is in attendance array -> Returns false (before Request A completes write)",
                    outcome="Both requests execute $push, inserting duplicate student records into the embedded array.",
                    code_references=["services/attendance_service.py:78"],
                ),
                code_snippet="77:     # Non-atomic check-then-push\n78:     db.attendance_records.update_one({'session_id': session_id}, {'$push': {'students': student_record}})",
                suggested_fix="Use MongoDB '$addToSet' with deterministic student identifier, or enforce compound uniqueness.",
            ),
            IntegrityFinding(
                id="FRN-003",
                title="Abandoned Session Lifecycle (Frontend Never Calls Finalize)",
                severity="HIGH",
                category="Missing Lifecycle",
                classification="[CODE VERIFIED]",
                file="api/routes/attendance.py",
                function="finalize_session",
                line=85,
                evidence="Backend exposes session finalization logic (status: 'closed'), but frontend camera and recognition components stop locally without dispatching an API call to finalize the session. Sessions remain permanently in 'active' status in MongoDB.",
                impact="Database sessions are never formally marked as closed or finalized; session end times are permanently null.",
                confidence=1.0,
                code_snippet="// Frontend stops stream:\nstream.getTracks().forEach(track => track.stop());\n// Missing: await api.post('/api/session/finalize', { session_id });",
                suggested_fix="Add API call to session finalization endpoint inside component cleanup or 'Stop Session' button click handler.",
            ),
            IntegrityFinding(
                id="FRN-004",
                title="Hardcoded MongoDB Credentials in Source Code",
                severity="CRITICAL",
                category="Credential Exposure",
                classification="[CODE VERIFIED]",
                file="config.py",
                function="(configuration)",
                line=28,
                evidence="Plaintext database credentials committed directly to source control: mongodb://admin:<REDACTED>@127.0.0.1:27017/student_mgmt",
                impact="Unauthorized database access; risk of data exfiltration or tampering if repository is shared.",
                confidence=1.0,
                code_snippet="MONGO_URI = 'mongodb://admin:<REDACTED>@127.0.0.1:27017/student_mgmt'",
                suggested_fix="Store database connection strings in environment variables (.env) and load via os.getenv().",
            ),
            IntegrityFinding(
                id="FRN-005",
                title="Database Platform Mismatch (Supabase Configured, MongoDB Actually Used)",
                severity="MEDIUM",
                category="Configuration Mismatch",
                classification="[CONFIG VERIFIED]",
                file=".env / config.py",
                function="(platform_configuration)",
                line=1,
                evidence="SUPABASE_URL is configured in environment parameters, but zero active queries or table operations target Supabase. 100% of runtime database operations execute against MongoDB via pymongo.",
                impact="Misleading architectural assumptions; team members may assume data is in Supabase when it is only stored in MongoDB.",
                confidence=1.0,
                code_snippet="SUPABASE_URL=https://xyz-university.supabase.co  # UNUSED\nMONGO_URI=mongodb://admin:<REDACTED>@127.0.0.1:27017 # ACTUALLY USED",
                suggested_fix="Remove obsolete Supabase configuration or implement database synchronization / migration adapter.",
            ),
            IntegrityFinding(
                id="FRN-006",
                title="Missing Unique Compound Constraint on attendance_records",
                severity="MEDIUM",
                category="Missing Constraint",
                classification="[CODE VERIFIED]",
                file="db/init.py",
                function="collection_initialization",
                line=12,
                evidence="Collection 'attendance_records' does not define a unique compound index on (session_id, student_id) in code or migration scripts. Data deduplication relies entirely on application-level checks.",
                impact="Database layer cannot prevent duplicate attendance insertions if application-level checks fail or race.",
                confidence=0.95,
                code_snippet="db.attendance_records.create_index([('session_id', 1), ('students.student_id', 1)], unique=True)  # Missing",
                suggested_fix="Add compound unique index on (session_id, student_id) during database initialization.",
            ),
        ],
        root_causes=[
            RootCauseNode(
                id="RC-001",
                title="Historical Attendance Invisibility",
                symptom="Only current session attendance is visible; historical attendance records disappear from application UI.",
                direct_cause="Read API endpoint calls db.attendance_records.find_one() instead of find().",
                underlying_cause="Endpoint assumes only one session document is needed to represent all attendance records.",
                architectural_cause="Lack of CQRS separation between real-time active session capture and multi-session historical reporting.",
                evidence_tag="[CODE VERIFIED]",
            ),
            RootCauseNode(
                id="RC-002",
                title="Duplicate Student Attendance in Embedded Arrays",
                symptom="Same student appears multiple times in attendance records for a single session.",
                direct_cause="Non-atomic check-then-push array update pattern in mark_attendance() allows interleaved concurrent requests.",
                underlying_cause="MongoDB $push appends unconditionally without index uniqueness on embedded array elements.",
                architectural_cause="Unenforced data-tier constraints; relying entirely on optimistic application-level checks without database locks or $addToSet.",
                evidence_tag="[CODE VERIFIED]",
            ),
            RootCauseNode(
                id="RC-003",
                title="Permanent 'Active' Session Status in Database",
                symptom="Sessions remain in 'active' status indefinitely with null end timestamps.",
                direct_cause="Frontend recognition component stops local media stream but dispatches no finalization HTTP request to backend.",
                underlying_cause="Frontend lifecycle decoupled from backend session state management.",
                architectural_cause="Missing explicit session lifecycle state machine and timeout-based background reaper service.",
                evidence_tag="[CODE VERIFIED]",
            ),
        ],
        cross_checks=[
            CrossCheckItem(
                topic="Historical Data Retention vs API Read Visibility",
                aspect_a="Database Persistence Layer (MongoDB)",
                aspect_b="API Read Query Layer (find_one)",
                verdict="CONFLICTING EVIDENCE",
                details="Database physically preserves all session documents over time (append-in-place). However, the read endpoint executes 'find_one()', discarding all but the first matching document. The code symptom (missing history) is caused by the query, not data loss.",
                classification="[CODE VERIFIED]",
            ),
            CrossCheckItem(
                topic="Configured Database vs Actual Runtime Engine",
                aspect_a="Configuration & Parameters (SUPABASE_URL)",
                aspect_b="Source Code Invocations (pymongo)",
                verdict="CONFLICTING EVIDENCE",
                details="Environment configuration includes a Supabase project reference. However, 100% of runtime database operations in the source code target MongoDB via pymongo. Supabase client is not instantiated or utilized in runtime execution.",
                classification="[CONFIG VERIFIED]",
            ),
            CrossCheckItem(
                topic="Frontend Session Lifecycle vs Backend Persistence",
                aspect_a="Frontend Capture Stream (Component Unmount / Stop)",
                aspect_b="Backend Database State (Status: 'active')",
                verdict="DISCONNECTED",
                details="Frontend halts camera capture and recognition locally, but never transmits a finalization request to the backend. As a consequence, session records remain permanently open in the database.",
                classification="[CODE VERIFIED]",
            ),
        ],
        unverified_items=[
            UnverifiedItem(
                target="Supabase External Project (https://xyz-university.supabase.co)",
                reason="Static offline analysis cannot authenticate against external Supabase REST/Postgres endpoint without API credentials.",
                classification="[UNVERIFIED]",
                recommendation="Provide valid SUPABASE_SERVICE_ROLE_KEY to enable remote schema and RLS policy verification.",
            )
        ],
        summary={
            "total_databases_detected": 3,
            "actual_databases_used": ["MongoDB"],
            "configured_unused_databases": ["Supabase", "PostgreSQL"],
            "total_database_operations": 4,
            "writes_count": 2,
            "reads_count": 2,
            "critical_findings": 2,
            "high_findings": 2,
            "medium_findings": 2,
            "low_findings": 0,
            "total_findings": 6,
            "entities_count": 2,
            "flows_count": 1,
        },
    )

    session = AnalyzedRepositorySession(
        overview=demo_overview,
        workspace_path=Path("."),
        architecture=demo_arch,
        findings=demo_findings,
        ast_data={},
        forensic_report=demo_forensic,
    )

    plan = refactor_service.generate_plan()
    diff = diff_service.generate_diff(plan.file, plan.originalCode, plan.refactoredCode)
    session.refactor_plans[plan.id] = plan
    session.diffs[plan.id] = diff
    session.verification_results[plan.id] = verification_service.verify_refactoring()

    repo_store.put_session(session)
    logger.info("Demo repository session initialized successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI Lifespan handler."""
    populate_demo_repository()
    yield


# Instantiate FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Autonomous Codebase Understanding & Safe Refactoring Agent API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Logs incoming HTTP request timing and status."""
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} ({process_time:.2f}ms)"
        )
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"{request.method} {request.url.path} - Exception: {e} ({process_time:.2f}ms)",
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected server error occurred.",
                details={"error": str(e)},
            ),
        )


# Register API Routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(repositories.router, prefix=settings.API_PREFIX)
app.include_router(architecture.router, prefix=settings.API_PREFIX)
app.include_router(code_health.router, prefix=settings.API_PREFIX)
app.include_router(impact.router, prefix=settings.API_PREFIX)
app.include_router(ask.router, prefix=settings.API_PREFIX)
app.include_router(refactor.router, prefix=settings.API_PREFIX)
app.include_router(verification.router, prefix=settings.API_PREFIX)
app.include_router(forensic.router, prefix=settings.API_PREFIX)
app.include_router(llm.router, prefix=settings.API_PREFIX)
