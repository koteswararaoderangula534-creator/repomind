/**
 * RepoMind Mock Data Layer
 * Realistic engineering data for koteswararaoderangula534-creator/repomind.
 * Completely decoupled from the UI components for easy REST/GraphQL API integration.
 */

export const REPOSITORY_DATA = {
  id: "repo-event-mgmt",
  name: "koteswararaoderangula534-creator/repomind",
  url: "https://github.com/koteswararaoderangula534-creator/repomind",
  branch: "main",
  commit: "8f4a9b2",
  primaryLanguage: "Python 3.11",
  secondaryLanguage: "FastAPI / TypeScript",
  lastAnalyzed: "Today at 18:32 UTC",
  analysisDuration: "14.2s",
  status: "Analyzed",
  metrics: {
    filesCount: 147,
    modulesCount: 18,
    testsCount: 42,
    findingsCount: 13,
    findingsBreakdown: {
      high: 2,
      medium: 7,
      low: 4
    },
    codeLines: 12480,
    testCoverage: "88.4%",
    dependenciesCount: 34
  },
  layers: [
    { name: "Frontend", tech: "Next.js / TypeScript", files: 48, status: "Healthy" },
    { name: "API Gateway", tech: "FastAPI / Uvicorn", files: 22, status: "1 Smells" },
    { name: "Core Services", tech: "Python Services", files: 56, status: "10 Findings" },
    { name: "Database", tech: "MongoDB (Active) / Supabase (Dormant)", files: 21, status: "2 Critical Hazards" }
  ],
  classification: {
    category: "Full-Stack Application",
    confidence: 0.94,
    signals: ["React / TypeScript Frontend", "FastAPI Ingress Routes", "MongoDB Data Pipeline"]
  },
  aiSummary: "RepoMind analyzed 'koteswararaoderangula534-creator/repomind' as a full-stack application built with Python 3.11 and TypeScript. The codebase spans 147 files (~12,480 lines of code) across frontend camera capture, FastAPI ingress, and backend service orchestrations. Forensic database tracing detected dual data stores: MongoDB is the active runtime write target, while Supabase clients remain dormant. The AST engine identified 2 high-severity risks including an un-fenced concurrency race condition and historical session data truncation.",
  semanticGroups: [
    { domain: "Authentication & Security", fileCount: 14, description: "Token verification, RBAC permissions, and session credentials." },
    { domain: "API Gateway & Ingress", fileCount: 22, description: "FastAPI route controllers, query endpoints, and request validations." },
    { domain: "Core Business Logic", fileCount: 56, description: "Session lifecycle, event dispatching, transaction processing, and workers." },
    { domain: "Data Persistence & ORM", fileCount: 21, description: "MongoDB collections, PyMongo write pipelines, and Supabase client stubs." },
    { domain: "User Interface & Components", fileCount: 48, description: "Developer consoles, telemetry panels, and session audit streams." },
    { domain: "Test Suite & Verification", fileCount: 18, description: "Pytest suites covering auth authorization, session mutations, and concurrency." }
  ],
  technologies: ["Python 3.11", "FastAPI", "React", "TypeScript", "MongoDB", "Supabase", "Pytest", "Uvicorn"],
  databasesDetected: ["MongoDB (Active Write Target)", "Supabase (Dormant Client)"]
};

export const CODE_HEALTH_FINDINGS = [
  {
    id: "FND-001",
    severity: "HIGH",
    rule: "SEC-012",
    title: "Hardcoded Secret",
    description: "JWT secret signing key is hardcoded directly in configuration file instead of reading from environment variables.",
    juniorDescription: "A sensitive password/key is written plainly in the code. Anyone who can see this file could create fake logins. It should be loaded from a secure environment secret instead.",
    file: "config.py",
    line: 27,
    module: "Configuration",
    status: "Open",
    category: "Security",
    suggestedRefactorId: "REF-001",
    impactEntity: "SECRET_KEY",
    codeSnippet: `25: class Settings(BaseSettings):
26:     APP_NAME: str = "RepoMindAPI"
27:     SECRET_KEY: str = "d948a73f9104b2e811c038290fbb62a1"  # RISK: hardcoded
28:     ALGORITHM: str = "HS256"
29:     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60`
  },
  {
    id: "FND-002",
    severity: "HIGH",
    rule: "SEC-004",
    title: "SQL Injection Risk in Session Query",
    description: "Raw formatted SQL query using f-strings inside cursor execution bypasses parameter sanitization.",
    juniorDescription: "User input is directly inserted into a database query. If someone puts malicious commands into their search, the database might execute them. Using prepared parameters fixes this.",
    file: "services/event_service.py",
    line: 114,
    module: "EventService",
    status: "Open",
    category: "Security",
    suggestedRefactorId: null,
    impactEntity: "search_sessions_raw",
    codeSnippet: `112: def search_sessions_raw(db, query: str):
113:     cursor = db.cursor()
114:     sql = f"SELECT * FROM sessions WHERE tag LIKE '%{query}%'"
115:     cursor.execute(sql)
116:     return cursor.fetchall()`
  },
  {
    id: "FND-003",
    severity: "MEDIUM",
    rule: "DES-008",
    title: "Large Function (Single Responsibility Violation)",
    description: "Function process_order() handles 4 separate concerns: payload validation, payment processing, database record persistence, and notification dispatch.",
    juniorDescription: "This function is doing too many jobs at once. When a function validates input, talks to a bank, saves to a database, and sends emails all in one place, bugs are hard to find. We can split it into small helper functions.",
    file: "orders.py",
    line: 84,
    module: "OrderProcessing",
    status: "Open",
    category: "Code Smells",
    suggestedRefactorId: "REF-ORDER-01",
    impactEntity: "process_order",
    codeSnippet: `84: def process_order(order_data: dict, user_id: str, db_session) -> dict:
85:     # 1. Validation logic (18 lines)
86:     if not order_data.get("items"):
87:         raise ValueError("Empty items list")
...
104:    # 2. Payment processing (24 lines)
...
128:    # 3. Database persistence (19 lines)
...
147:    # 4. Email notifications (21 lines)`
  },
  {
    id: "FND-004",
    severity: "MEDIUM",
    rule: "ARCH-002",
    title: "Direct DB Access in Route Handler",
    description: "Route handler directly invokes SQLAlchemy session query instead of delegating through enrollment service layer.",
    juniorDescription: "The web route is talking directly to the database instead of asking the service layer. Keeping database logic in service files prevents messy duplication across routes.",
    file: "api/routes/sessions.py",
    line: 42,
    module: "APIRoutes",
    status: "Open",
    category: "Architecture",
    suggestedRefactorId: null,
    impactEntity: "register_session_endpoint",
    codeSnippet: `41: @router.post("/enroll")
42: def register_session(payload: EnrollSchema, db: Session = Depends(get_db)):
43:     # Bypassing service layer:
44:     record = db.query(Enrollment).filter_by(session_id=payload.session_id).first()`
  },
  {
    id: "FND-005",
    severity: "MEDIUM",
    rule: "REL-005",
    title: "Unhandled Exception in Async Task Loop",
    description: "Background notification dispatcher lacks try/except block around async socket emit.",
    juniorDescription: "If one email or message fails to send, the entire background task crashes silently. Wrapping it in an error catcher lets other messages keep going.",
    file: "workers/notification_worker.py",
    line: 63,
    module: "Workers",
    status: "Open",
    category: "Reliability",
    suggestedRefactorId: null,
    impactEntity: "dispatch_queue",
    codeSnippet: `61: async def dispatch_queue(queue):
62:     while not queue.empty():
63:         msg = await queue.get()
64:         await socket_client.emit("notify", msg)`
  },
  {
    id: "FND-006",
    severity: "MEDIUM",
    rule: "SEC-019",
    title: "Missing Refresh Token Expiration Check",
    description: "JWT refresh handler does not verify token issued-at timestamp against revocation blacklist.",
    juniorDescription: "Once a user logs out or changes their password, their old refresh token might still work because the system forgets to verify if it expired or was cancelled.",
    file: "auth_service.py",
    line: 68,
    module: "AuthService",
    status: "Open",
    category: "Security",
    suggestedRefactorId: null,
    impactEntity: "refresh_session_token",
    codeSnippet: `67: def refresh_session_token(token: str):
68:     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
69:     return create_access_token(payload.get("sub"))`
  },
  {
    id: "FND-007",
    severity: "MEDIUM",
    rule: "PERF-003",
    title: "N+1 Database Query in Course Listing",
    description: "Listing courses executes one query for courses plus N subsequent queries to fetch instructor models individually.",
    juniorDescription: "The app asks the database 1 time for the courses, and then 50 more times for each teacher's name. Asking once with a SQL JOIN is much faster.",
    file: "services/course_service.py",
    line: 95,
    module: "CourseService",
    status: "Open",
    category: "Performance",
    suggestedRefactorId: null,
    impactEntity: "get_all_courses_with_instructors",
    codeSnippet: `94: for course in courses:
95:     instructor = db.query(Instructor).filter_by(id=course.instructor_id).first()
96:     course.instructor_name = instructor.name`
  },
  {
    id: "FND-008",
    severity: "MEDIUM",
    rule: "MAINT-001",
    title: "Deprecated Pydantic v1 Syntax",
    description: "Models still utilize .dict() serialization method deprecated in Pydantic v2 in favor of model_dump().",
    juniorDescription: "The code is using an older way to turn data models into dictionaries. Upgrading to model_dump() prevents crashes when updating dependencies.",
    file: "models/session.py",
    line: 15,
    module: "DataModels",
    status: "Open",
    category: "Outdated Patterns",
    suggestedRefactorId: null,
    impactEntity: "SessionResponseModel",
    codeSnippet: `14: def to_dict(self):
15:     return self.dict(exclude={"hashed_password"})`
  },
  {
    id: "FND-009",
    severity: "MEDIUM",
    rule: "SEC-007",
    title: "Lack of Rate Limiting on Login Endpoint",
    description: "Endpoint POST /api/v1/auth/login lacks Redis-backed IP rate limiter middleware.",
    juniorDescription: "There is no limit on how many passwords someone can try per minute. Adding a rate limiter stops attackers from guessing passwords with bots.",
    file: "api/routes/auth.py",
    line: 31,
    module: "APIRoutes",
    status: "Open",
    category: "Security",
    suggestedRefactorId: null,
    impactEntity: "login_route",
    codeSnippet: `30: @router.post("/login")
31: def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
32:     user = authenticate_user(form_data.username, form_data.password)
33:     return user`
  },
  {
    id: "FND-010",
    severity: "LOW",
    rule: "CLN-002",
    title: "Magic Number in Payment Calculation",
    description: "Numeric literal 0.85 used for enterprise tier discount without named constant.",
    juniorDescription: "The number 0.85 is written directly inside a formula. It's better to give it a clear name like EARLY_BIRD_DISCOUNT_RATE so everyone knows what it means.",
    file: "services/billing_service.py",
    line: 58,
    module: "BillingService",
    status: "Open",
    category: "Code Smells",
    suggestedRefactorId: null,
    impactEntity: "calculate_tuition",
    codeSnippet: `57: if is_early_bird:
58:     total = base_price * 0.85
59: return total`
  },
  {
    id: "FND-011",
    severity: "LOW",
    rule: "CLN-001",
    title: "Redundant Cryptographic Import",
    description: "Import of hashlib.sha1 is unused and deprecated for cryptographic authentication hashing.",
    juniorDescription: "An old hashing tool is imported at the top of the file but never used. Removing unused imports keeps files clean and avoids confusion.",
    file: "utils/crypto.py",
    line: 4,
    module: "Utilities",
    status: "Open",
    category: "Code Smells",
    suggestedRefactorId: null,
    impactEntity: "crypto_utils",
    codeSnippet: `3: import hmac
4: import hashlib  # sha1 unused
5: from passlib.context import CryptContext`
  },
  {
    id: "FND-012",
    severity: "LOW",
    rule: "TYP-004",
    title: "Missing Return Type Annotation",
    description: "Function log_action() lacks explicit -> None return type annotation.",
    juniorDescription: "The function does not state what kind of value it gives back. Writing -> None helps developer tools catch mistakes early.",
    file: "services/audit_service.py",
    line: 22,
    module: "AuditService",
    status: "Open",
    category: "Code Smells",
    suggestedRefactorId: null,
    impactEntity: "log_action",
    codeSnippet: `21: def log_action(actor_id: str, action: str, resource: str):
22:     db.add(AuditLog(actor=actor_id, action=action, resource=resource))
23:     db.commit()`
  },
  {
    id: "FND-013",
    severity: "LOW",
    rule: "API-003",
    title: "Inconsistent Error Response Schema",
    description: "Returns custom dict { 'err': msg } instead of standard FastAPI HTTPException detail format.",
    juniorDescription: "Most errors in our API look like { 'detail': 'message' }, but this one looks like { 'err': 'message' }. Standardizing helps the frontend handle errors reliably.",
    file: "api/routes/grades.py",
    line: 79,
    module: "APIRoutes",
    status: "Open",
    category: "API Design",
    suggestedRefactorId: null,
    impactEntity: "submit_grade_endpoint",
    codeSnippet: `78: if grade < 0 or grade > 100:
79:     return {"err": "Grade out of permissible range 0-100"}`
  }
];

export const ASK_AI_SAMPLE_QUERIES = [
  {
    id: "q-auth",
    query: "Where does authentication happen?",
    category: "Architecture & Flow",
    technicalExplanation: "Authentication follows a stateless JWT bearer token pattern. The client submits credentials to login.py, which invokes auth_service.authenticate_user() to verify salted bcrypt password hashes. Once validated against the database user record, a cryptographically signed JWT access token (HS256) is returned with a 60-minute TTL.",
    juniorExplanation: "When a user logs in, the app takes their username and password, encrypts the password to check if it matches the database record, and hands back a digital pass (a JWT token). The user's browser sends this pass with every future request so the server knows who they are without asking for passwords again.",
    flowSteps: [
      { name: "login.py", role: "Route Handler", action: "Receives OAuth2 form data" },
      { name: "auth_service.py", role: "Service Layer", action: "Hashes password & validates user" },
      { name: "database.py", role: "Data Persistence", action: "Queries user row & permissions" }
    ],
    sources: [
      { file: "login.py", lines: "24–41", func: "login_for_access_token", fullSnippet: `24: @router.post("/token", response_model=Token)
25: async def login_for_access_token(
26:     form_data: OAuth2PasswordRequestForm = Depends(),
27:     db: Session = Depends(get_db)
28: ):
29:     user = authenticate_user(db, form_data.username, form_data.password)
30:     if not user:
31:         raise HTTPException(
32:             status_code=status.HTTP_401_UNAUTHORIZED,
33:             detail="Incorrect username or password",
34:             headers={"WWW-Authenticate": "Bearer"},
35:         )
36:     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
37:     access_token = create_access_token(
38:         data={"sub": user.username, "roles": user.roles},
39:         expires_delta=access_token_expires
40:     )
41:     return {"access_token": access_token, "token_type": "bearer"}` },
      { file: "auth_service.py", lines: "51–79", func: "authenticate_user", fullSnippet: `51: def authenticate_user(db: Session, username: str, password: str):
52:     user = get_user_by_username(db, username=username)
53:     if not user:
54:         return False
55:     if not verify_password(password, user.hashed_password):
56:         return False
57:     return user
...
68: def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
69:     to_encode = data.copy()
70:     expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
71:     to_encode.update({"exp": expire})
72:     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)` },
      { file: "database.py", lines: "18–32", func: "get_user_by_username", fullSnippet: `18: def get_user_by_username(db: Session, username: str) -> Optional[User]:
19:     """Lookup user by unique username with active status check."""
20:     return (
21:         db.query(User)
22:         .filter(User.username == username)
23:         .filter(User.is_active == True)
24:         .first()
25:     )` }
    ],
    affectedEntities: ["UserSession", "TokenSchema", "OAuth2Bearer"],
    riskAssessment: "Low risk in standard flow; security vulnerability flagged in config.py line 27 regarding hardcoded JWT secret key."
  },
  {
    id: "q-arch",
    query: "Explain the repository architecture.",
    category: "System Architecture",
    technicalExplanation: "RepoMind AST parsing identified a tiered full-stack architecture organized into 4 functional layers: 1) Client UI (React/TypeScript single-page app and CameraCapture components); 2) API Gateway (FastAPI router with Uvicorn server exposing REST endpoints); 3) Core Business Services (Events, Auth, Orders, Billing, and Notification workers); 4) Data Persistence (Active MongoDB document store with dormant Supabase and relational PostgreSQL models).",
    juniorExplanation: "This project is built like a 4-floor office building: The lobby (React frontend) takes requests from users, the security gate (FastAPI) checks who is allowed in, the office departments (Python services) do the real work, and the filing room (MongoDB) stores all the records.",
    flowSteps: [
      { name: "React Frontend", role: "Client UI", action: "User interaction & camera telemetry" },
      { name: "FastAPI Ingress", role: "API Gateway", action: "Validates JSON payloads & handles CORS" },
      { name: "Core Services", role: "Domain Logic", action: "Calculates grades, checks rules, runs jobs" },
      { name: "MongoDB Storage", role: "Active Database", action: "Stores session records and event documents" }
    ],
    sources: [
      { file: "backend/app/main.py", lines: "1–35", func: "app", fullSnippet: `1: from fastapi import FastAPI
2: app = FastAPI(title="RepoMind API")
3: app.include_router(repositories.router, prefix="/api")` },
      { file: "database.py", lines: "8–24", func: "get_db", fullSnippet: `8: engine = create_engine(DATABASE_URL, pool_size=20)
9: SessionLocal = sessionmaker(bind=engine)` }
    ],
    affectedEntities: ["FastAPI Application", "Layer Boundaries", "Dependency Graph"],
    riskAssessment: "Clean overall architectural separation; 1 direct database access leak detected in api/routes/sessions.py:42."
  },
  {
    id: "q-risks",
    query: "What are the highest-risk areas?",
    category: "Risk Detection",
    technicalExplanation: "Static analysis and forensic AST inspection identified 2 CRITICAL and 2 HIGH risk areas: 1) services/session_service.py:112: Historical Data Truncation from using find_one() on multi-session records; 2) services/session_service.py:78: Concurrency Race Hazard from un-fenced $push array mutations; 3) config.py:27: Hardcoded JWT secret key; 4) orders.py:84: Monolithic 84-line function tightly coupling Stripe charges with database persistence.",
    juniorExplanation: "The two biggest dangers in the project are: 1) A line of code that accidentally hides past session_event records because it only looks at the first page of results; 2) Two people marking session_event at the exact same moment causing one to overwrite the other because there's no waiting line!",
    flowSteps: [
      { name: "session_service.py:112", role: "Query Truncation", action: "find_one() omits prior records" },
      { name: "session_service.py:78", role: "Race Condition", action: "$push executes without version lock" },
      { name: "config.py:27", role: "Secret Leak", action: "Hardcoded cryptographic key in repo" },
      { name: "orders.py:84", role: "Monolith", action: "Violates Single Responsibility Principle" }
    ],
    sources: [
      { file: "services/session_service.py", lines: "112–115", func: "get_session_summary", fullSnippet: `112: record = await db.session_records.find_one({"session_id": session_id})
113: return {"sessions": record.get("sessions", [])}` },
      { file: "services/session_service.py", lines: "77–80", func: "record_session_event", fullSnippet: `77: result = await db.session_records.update_one(
78:     {"session_id": session_id},
79:     {"$push": {"sessions": session_data}}
80: )` }
    ],
    affectedEntities: ["Data Integrity", "Concurrency Pipeline", "Application Secrets"],
    riskAssessment: "HIGH PRIORITY: Fix query truncation and add version check (__v) to event stream array push."
  },
  {
    id: "q-refactor",
    query: "Which files should I refactor first?",
    category: "Refactoring Opportunities",
    technicalExplanation: "Priority 1 for refactoring is orders.py:84 (process_order). It currently violates the Single Responsibility Principle by orchestrating payload validation, Stripe API payment capture, database transaction commits, and customer email alerts within a single 84-line function. RepoMind provides an automated 4-helper decomposition plan (validate_order, charge_payment, save_order, send_confirmation) with 0 regression risk verified against 42 automated tests.",
    juniorExplanation: "You should refactor orders.py first! That file has one giant function that tries to do everything: check the order, charge the credit card, save to the database, and send emails all in one place. Splitting it into 4 small helper functions makes it much easier to test and maintain.",
    flowSteps: [
      { name: "orders.py:84", role: "Current State", action: "Monolithic 84-line process_order() function" },
      { name: "Refactor Proposal", role: "Decomposition", action: "Split into 4 single-purpose helper functions" },
      { name: "Verification Matrix", role: "Safety Check", action: "All 42 test suites pass with 0 regressions" }
    ],
    sources: [
      { file: "orders.py", lines: "84–168", func: "process_order", fullSnippet: `84: def process_order(order_data: dict, user_id: str, db_session) -> dict:
85:     # 1. Validation (18 lines)
86:     # 2. Stripe charge (24 lines)
87:     # 3. DB commit (19 lines)
88:     # 4. Email alerts (21 lines)` }
    ],
    affectedEntities: ["orders.py", "billing_service.py", "notification_worker.py"],
    riskAssessment: "SAFE TO REFACTOR: Proposed refactoring plan is ready in Refactor Studio with verified diff."
  },
  {
    id: "q-flow",
    query: "How does data flow through this application?",
    category: "Data Flow Lineage",
    technicalExplanation: "Data flows through an end-to-end pipeline: 1) EventIngress.tsx captures event payload session_event telemetry and dispatches a JSON POST payload; 2) FastAPI route handler at api/routes/events.py intercepts the request and performs schema validation; 3) The request delegates to services/session_service.py; 4) The service executes an asynchronous update to the active MongoDB session_event collection; 5) A response confirmation returns to the React dashboard.",
    juniorExplanation: "Think of it like ordering pizza: The website (frontend) sends your order, the front desk (FastAPI route) checks that your address is real, the kitchen (session_event service) prepares the food, and the storage pantry (MongoDB) saves the receipt!",
    flowSteps: [
      { name: "EventIngress.tsx", role: "Frontend UI", action: "Captures face token & dispatches POST" },
      { name: "api/routes/events.py", role: "API Gateway", action: "Validates schema & headers" },
      { name: "session_service.py", role: "Service Logic", action: "Prepares session document" },
      { name: "MongoDB", role: "Persistence", action: "Writes document to session_event collection" }
    ],
    sources: [
      { file: "src/components/EventIngress.tsx", lines: "45–60", func: "submitEvent", fullSnippet: `45: const submitEvent = async (token: string) => {
46:   await fetch('/api/events', { method: 'POST', body: JSON.stringify({ token }) });
47: };` },
      { file: "services/session_service.py", lines: "77–80", func: "record_session_event", fullSnippet: `77: result = await db.session_records.update_one(
78:     {"session_id": session_id},
79:     {"$push": {"sessions": session_data}}
80: )` }
    ],
    affectedEntities: ["Frontend UI", "API Gateway", "MongoDB Database"],
    riskAssessment: "Traced end-to-end; note that Supabase client configuration remains completely dormant in this pipeline."
  },
  {
    id: "q-order",
    query: "How does the order and payment flow work?",
    category: "Business Logic",
    technicalExplanation: "Order submission initiates at orders.py via process_order(). The function verifies item availability, initiates an external payment gateway call to Stripe, commits the order invoice to PostgreSQL, and invokes notification_worker to asynchronously dispatch confirmation emails.",
    juniorExplanation: "When a event pays for a course or lab fee, the app checks if the class has space, charges their payment card, saves the receipt in the database, and sends an email receipt.",
    flowSteps: [
      { name: "api/routes/orders.py", role: "API Endpoint", action: "Accepts checkout payload" },
      { name: "orders.py:process_order", role: "Monolithic Controller", action: "Validates, charges, saves, emails" },
      { name: "services/billing_service.py", role: "Stripe Connector", action: "Executes card charge" },
      { name: "database.py", role: "Storage", action: "Stores transaction record" }
    ],
    sources: [
      { file: "orders.py", lines: "84–168", func: "process_order", fullSnippet: `84: def process_order(order_data: dict, user_id: str, db_session) -> dict:
85:     # Handles validation, payment, persistence, notifications` },
      { file: "services/billing_service.py", lines: "30–54", func: "charge_stripe_token", fullSnippet: `30: def charge_stripe_token(amount: int, token: str):
31:     return stripe.Charge.create(amount=amount, currency="usd", source=token)` }
    ],
    affectedEntities: ["OrderRecord", "PaymentTransaction", "InvoiceEmail"],
    riskAssessment: "High structural smell: process_order is monolithic (84 lines) and tightly couples billing to database operations."
  },
  {
    id: "q-db",
    query: "What services talk directly to the database?",
    category: "Data Architecture",
    technicalExplanation: "The database layer is managed through SQLAlchemy models in models/. Direct session access is concentrated in services/event_service.py, services/course_service.py, services/billing_service.py, and auth_service.py. A structural leak exists in api/routes/sessions.py which queries the DB directly.",
    juniorExplanation: "Most parts of the system go through specific helper services to reach the database, which is good practice. However, one web page route in enrollment.py cheats and talks directly to the database without going through the helper service.",
    flowSteps: [
      { name: "services/*", role: "Authorized Services", action: "Read/Write queries via ORM" },
      { name: "api/routes/sessions.py", role: "Architectural Leak", action: "Direct DB query bypassing service" },
      { name: "database.py", role: "Connection Pool", action: "Manages PostgreSQL engine & pool (size=20)" }
    ],
    sources: [
      { file: "database.py", lines: "8–24", func: "get_db", fullSnippet: `8: engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)
9: SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)` },
      { file: "api/routes/sessions.py", lines: "42–48", func: "register_session", fullSnippet: `42: record = db.query(Enrollment).filter_by(session_id=payload.session_id).first()` }
    ],
    affectedEntities: ["PostgreSQL Session", "Connection Pool", "ORM Entities"],
    riskAssessment: "Medium architectural risk due to direct query leaks in route handlers."
  },
  {
    id: "q-disappear",
    query: "Why might this data disappear?",
    category: "Data Integrity Forensic",
    technicalExplanation: "The AST parser detected a single-record query method `find_one()` executing against the multi-session collection in services/session_service.py:112. When a event accumulates multiple session_event events over time, `find_one()` returns only the first document matched by the index cursor. All subsequent sessions are silently omitted from the API response payload, creating the observable illusion that prior session_event data has vanished or been deleted.",
    juniorExplanation: "Imagine taking audit history by reading only the very first line of a multi-record log file. Even if 100 events were recorded, the query retrieves line 1 and ignores the rest! The data isn't deleted, but the code is looking with blinders on.",
    flowSteps: [
      { name: "EventIngress.tsx", role: "Frontend UI", action: "Captures face token & sends POST request" },
      { name: "api/routes/events.py", role: "API Gateway", action: "Validates session payload" },
      { name: "services/session_service.py", role: "Service Logic", action: "Calls db.session_records.find_one() [TRUNCATION HAZARD]" },
      { name: "MongoDB", role: "Active Store", action: "Returns only 1 document despite multi-record collection" }
    ],
    sources: [
      { file: "services/session_service.py", lines: "112–115", func: "get_session_summary", fullSnippet: `112: record = await db.session_records.find_one({"session_id": session_id})
113: if not record:
114:     return {"sessions": []}
115: return {"sessions": record.get("sessions", [])}` }
    ],
    affectedEntities: ["session_collection", "session_records", "session_summary_view"],
    riskAssessment: "CRITICAL DATA TRUNCATION: Replace find_one() with db.session_records.find() and aggregate session arrays across all documents."
  },
  {
    id: "q-concurrency",
    query: "What happens when two users record events simultaneously?",
    category: "Concurrency Hazard Forensic",
    technicalExplanation: "When two camera inputs or concurrent users send event submissions at timestamp t_0, both execute services/session_service.py:78 concurrently. The operation uses an un-fenced MongoDB $push update without versioning, document locking, or etag checks. If the underlying document is fetched, modified, and saved concurrently, one of the two session updates will be silently overwritten by the slower write, causing permanent event loss without generating a database error.",
    juniorExplanation: "Imagine two server threads updating the exact same document without a mutex lock at the exact same second. Teacher A reads page 1, Teacher B reads page 1. Teacher A writes their note and closes the book. Then Teacher B writes their note on their copy and closes the book, erasing Teacher A's note! There is no waiting line (lock) to prevent them from stepping on each other.",
    flowSteps: [
      { name: "Worker Ingress A & Ingress B", role: "Concurrent Ingress", action: "Submit event tokens simultaneously at t0" },
      { name: "api/routes/events.py", role: "Async Gateway", action: "Spawns 2 concurrent coroutines" },
      { name: "services/session_service.py:78", role: "Unsynchronized Push", action: "Executes $push array mutation without version fence" },
      { name: "MongoDB", role: "Collision Store", action: "Race condition occurs; slower write clobbers faster update" }
    ],
    sources: [
      { file: "services/session_service.py", lines: "75–82", func: "record_session_event", fullSnippet: `75: async def record_session_event(session_id: str, session_data: dict):
76:     # HAZARD: Un-fenced $push without version increment or optimistic lock
77:     result = await db.session_records.update_one(
78:         {"session_id": session_id},
79:         {"$push": {"sessions": session_data}}
80:     )
81:     return result.modified_count > 0` }
    ],
    affectedEntities: ["session_records.events", "optimistic_lock_version", "session_timeline"],
    riskAssessment: "CRITICAL CONCURRENCY HAZARD: Introduce optimistic lock field (__v) with conditional match or use atomic distributed locks."
  },
  {
    id: "q-supabase",
    query: "Where is data written and why is Supabase dormant?",
    category: "Database Forensic Distinction",
    technicalExplanation: "RepoMind AST analysis verified that 100% of runtime data persistence operations execute against MongoDB via PyMongo/Motor in services/session_service.py and services/event_service.py. Conversely, Supabase client initialization exists in config.py:18, but cross-referencing all 147 files revealed ZERO write, read, or query operations invoking the Supabase client. Additionally, SUPABASE_KEY is null in environment variables, confirming Supabase is a dormant, abandoned client.",
    juniorExplanation: "The app has two filing cabinets: a big digital one (MongoDB) that gets used all day long, and a fancy new one in the corner (Supabase) that someone bought but never put any keys or files into. All real data lives in MongoDB.",
    flowSteps: [
      { name: "config.py:18", role: "Client Stub", action: "Initializes supabase = create_client(url, key=None)" },
      { name: "services/session_service.py", role: "Active Write Route", action: "All inserts routed to MongoDB session_event collection" },
      { name: "services/event_service.py", role: "Active Query Route", action: "All lookups routed to MongoDB event collection" },
      { name: "Supabase Service", role: "Dormant System", action: "0 reads, 0 writes, 0 active connections" }
    ],
    sources: [
      { file: "config.py", lines: "15–20", func: "supabase_client", fullSnippet: `15: # Dormant client - credentials missing
16: SUPABASE_URL = os.getenv("SUPABASE_URL", "")
17: SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
18: supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_KEY else None` },
      { file: "services/session_service.py", lines: "77–80", func: "record_session_event", fullSnippet: `77: result = await db.session_records.update_one(
78:     {"session_id": session_id},
79:     {"$push": {"sessions": session_data}}
80: )` }
    ],
    affectedEntities: ["MongoDB (Active)", "Supabase (Dormant)", "config.py"],
    riskAssessment: "ARCHITECTURAL DORMANT DEPENDENCY: Remove unused Supabase dependencies or complete the data migration pipeline."
  }
];

export const ARCHITECTURE_GRAPH_DATA = {
  layers: [
    {
      id: "layer-client",
      name: "Client Layer",
      nodes: [
        { id: "node-web", name: "Web Application", type: "frontend", tech: "Next.js 14 / React", port: "3000", description: "Engineering portal & telemetry dashboard" },
        { id: "node-cli", name: "Admin CLI Tool", type: "cli", tech: "Python Click", port: "local", description: "Batch enrollment & migration CLI" }
      ]
    },
    {
      id: "layer-gateway",
      name: "API & Ingress Layer",
      nodes: [
        { id: "node-api", name: "FastAPI Gateway", type: "gateway", tech: "FastAPI / Uvicorn", port: "8000", description: "REST routes, JWT auth middleware, request validation" }
      ]
    },
    {
      id: "layer-services",
      name: "Core Business Services",
      nodes: [
        { id: "node-auth", name: "Auth Service", type: "service", tech: "Python / PyJWT", files: "auth_service.py", description: "Token generation, password hashing, session validation" },
        { id: "node-order", name: "Order & Billing", type: "service", tech: "orders.py / billing.py", files: "orders.py", description: "Tuition processing, invoicing, receipt creation" },
        { id: "node-session", name: "Session & Token Manager", type: "service", tech: "session_service.py", files: "enrollment.py", description: "Course registrations, grade submissions, GPA calculations" },
        { id: "node-notify", name: "Notification Worker", type: "worker", tech: "asyncio worker", files: "notification_worker.py", description: "Email dispatch, socket push events" }
      ]
    },
    {
      id: "layer-data",
      name: "Persistence & External",
      nodes: [
        { id: "node-postgres", name: "PostgreSQL 15", type: "database", tech: "Relational DB", port: "5432", description: "Accounts, permissions, audit trails, credentials" },
        { id: "node-redis", name: "Redis Cache", type: "cache", tech: "Redis 7", port: "6379", description: "Session cache, token revocation blacklist" },
        { id: "node-stripe", name: "Stripe API", type: "external", tech: "REST External", port: "443", description: "Payment processing gateway" },
        { id: "node-sendgrid", name: "SendGrid Mailer", type: "external", tech: "SMTP / REST", port: "443", description: "Transactional email notifications" }
      ]
    }
  ],
  edges: [
    { from: "node-web", to: "node-api", protocol: "HTTPS / JSON", label: "Client REST Calls" },
    { from: "node-cli", to: "node-api", protocol: "HTTPS / Token", label: "Admin Operations" },
    { from: "node-api", to: "node-auth", protocol: "Internal Call", label: "Auth Verification" },
    { from: "node-api", to: "node-order", protocol: "Internal Call", label: "Order Submissions" },
    { from: "node-api", to: "node-session", protocol: "Internal Call", label: "Session Tokens" },
    { from: "node-auth", to: "node-postgres", protocol: "SQLAlchemy", label: "User Credentials" },
    { from: "node-auth", to: "node-redis", protocol: "TCP", label: "Session Tokens" },
    { from: "node-order", to: "node-stripe", protocol: "HTTPS TLS", label: "Process Card" },
    { from: "node-order", to: "node-postgres", protocol: "SQLAlchemy", label: "Save Invoices" },
    { from: "node-order", to: "node-notify", protocol: "Task Queue", label: "Queue Email" },
    { from: "node-notify", to: "node-sendgrid", protocol: "SMTP TLS", label: "Send Email" },
    { from: "node-session", to: "node-postgres", protocol: "SQLAlchemy", label: "Registry Queries" }
  ]
};

export const IMPACT_ANALYSIS_DATA = {
  selectedEntity: "authenticate_user()",
  file: "auth_service.py",
  lineRange: "51–79",
  summary: {
    affectedFilesCount: 6,
    affectedFunctionsCount: 9,
    relatedTestsCount: 4,
    blastRadiusScore: "62/100 (High)",
    riskRating: "HIGH",
    riskScore: 62,
    riskLevel: "HIGH"
  },
  factors: {
    fileImpact: { score: 68, weight: 0.20, level: "HIGH" },
    architectureImpact: { score: 70, weight: 0.20, level: "HIGH" },
    dependencyImpact: { score: 65, weight: 0.20, level: "HIGH" },
    testRisk: { score: 55, weight: 0.20, level: "HIGH" },
    sensitivityRisk: { score: 75, weight: 0.10, level: "HIGH" },
    complexityRisk: { score: 35, weight: 0.10, level: "MODERATE", insufficientEvidence: false }
  },
  contributors: [
    { name: "Architecture", score: 70, level: "HIGH", weight: "20%" },
    { name: "Dependencies", score: 65, level: "HIGH", weight: "20%" },
    { name: "Verification", score: 55, level: "HIGH", weight: "20%" },
    { name: "Change Scope", score: 68, level: "HIGH", weight: "20%" },
    { name: "Security Sensitivity", score: 75, level: "HIGH", weight: "10%" },
    { name: "Complexity", score: 35, level: "MODERATE", weight: "10%", note: "Measured" }
  ],
  explanations: [
    "6 files are affected across the repository",
    "Change crosses 3 architectural layers (API Gateway, Core Services, Database)",
    "9 callers depend on the affected code",
    "Only 4 related tests were detected (limited verification coverage)",
    "The affected service is shared across multiple modules",
    "Security-sensitive authentication and token validation paths are touched"
  ],
  recommendations: [
    {
      id: "rec-tests",
      priority: "HIGH",
      text: "Add automated tests for affected callers before executing refactoring",
      impact: "Reduces Test Risk by up to 35 points"
    },
    {
      id: "rec-arch",
      priority: "HIGH",
      text: "Decompose refactor across architectural layer boundaries (separate API contracts from database logic)",
      impact: "Reduces Architecture Impact by 25 points"
    },
    {
      id: "rec-dep",
      priority: "HIGH",
      text: "Review downstream callers and maintain signature backwards-compatibility",
      impact: "Prevents breaking changes across 9 callers"
    }
  ],
  riskAreas: [
    { name: "Authentication Flow", level: "Critical", description: "All client token exchanges route through this function." },
    { name: "Session Handling", level: "High", description: "Modifying return signature breaks session cookie serialization." },
    { name: "Database Access", level: "Moderate", description: "Direct queries on User credentials table." }
  ],
  dependencyFlow: [
    { step: 1, file: "login.py", entity: "login_for_access_token()", role: "Caller (API Ingress)" },
    { step: 2, file: "auth_service.py", entity: "authenticate_user()", role: "Target Focus", isTarget: true },
    { step: 3, file: "user_service.py", entity: "get_user_by_username()", role: "Callee (User Query)" },
    { step: 4, file: "database.py", entity: "db.query(User)", role: "Callee (Database Engine)" }
  ],
  affectedFiles: [
    { file: "login.py", callers: 2, tests: ["test_login_success", "test_invalid_credentials"] },
    { file: "api/routes/auth.py", callers: 1, tests: ["test_token_refresh"] },
    { file: "services/user_service.py", callers: 2, tests: ["test_user_lookup"] },
    { file: "middleware/jwt_auth.py", callers: 2, tests: ["test_bearer_token"] },
    { file: "orders.py", callers: 1, tests: ["test_order_permissions"] },
    { file: "database.py", callers: 1, tests: ["test_db_connection"] }
  ],
  relatedTests: [
    { name: "test_auth_success", file: "tests/test_auth.py", status: "Passing", duration: "12ms" },
    { name: "test_invalid_credentials", file: "tests/test_auth.py", status: "Passing", duration: "18ms" },
    { name: "test_session_expiry", file: "tests/test_auth.py", status: "Passing", duration: "15ms" },
    { name: "test_rate_limit", file: "tests/test_auth.py", status: "Passing", duration: "25ms" }
  ]
};

export const REFACTOR_DATA = {
  id: "REF-ORDER-01",
  targetFunction: "process_order()",
  file: "orders.py",
  lineRange: "84–168",
  problem: {
    technical: "Function process_order() violates the Single Responsibility Principle (SRP). It handles 4 distinct operations: input payload validation, payment execution, database persistence, and notification dispatch within a single 84-line block.",
    junior: "This function was doing too many jobs at the same time. If a function checks inputs, charges a credit card, writes to the database, and sends an email all in one place, fixing one part easily breaks another. We are dividing it into four small, clean helper functions."
  },
  decompositionPlan: [
    { name: "validate_order(order_data)", responsibility: "Validates line items, stock availability, and user IDs." },
    { name: "process_payment(user_id, amount, payment_method)", responsibility: "Delegates card charge to billing service with idempotency key." },
    { name: "save_order(db_session, order_data, payment_id)", responsibility: "Commits transactional order and line items to PostgreSQL." },
    { name: "send_notification(user_id, order_id)", responsibility: "Enqueues asynchronous confirmation email into notification worker." }
  ],
  whyThisChange: {
    technical: "Reduced coupling by extracting payment processing, persistence, and notifications into pure testable units with isolated failure domains.",
    junior: "We split the big function into four focused workers. Now each step does one job well, and if the email system is down, it won't crash the payment step."
  },
  expectedImpact: {
    technical: "Cyclomatic complexity reduced from 14 to 3. Testability increased with unit mockability for payment and mailers.",
    junior: "Code is much easier to read, test, and debug without worrying about unexpected side-effects."
  },
  risk: {
    technical: "Low risk to external callers. The signature of process_order() is preserved as an orchestrator, maintaining 100% backwards compatibility.",
    junior: "Very safe. The outside world still calls process_order() just like before, so no other files need to change."
  },
  originalCode: `def process_order(order_data: dict, user_id: str, db_session) -> dict:
    # 1. Validation logic
    if not order_data.get("items") or len(order_data["items"]) == 0:
        raise ValueError("Order must contain at least one item")
    for item in order_data["items"]:
        if item.get("quantity", 0) <= 0:
            raise ValueError(f"Invalid item quantity for item {item.get('id')}")

    # 2. Payment processing
    total_amount = sum(item["price"] * item["quantity"] for item in order_data["items"])
    stripe_token = order_data.get("stripe_token")
    if not stripe_token:
        raise ValueError("Missing payment method token")
    charge = stripe.Charge.create(
        amount=int(total_amount * 100),
        currency="usd",
        source=stripe_token,
        description=f"Subscription order for user {user_id}"
    )
    if charge.status != "succeeded":
        raise PaymentFailedException("Payment authorization failed")

    # 3. Database persistence
    order_record = Order(
        user_id=user_id,
        total_amount=total_amount,
        charge_id=charge.id,
        status="completed"
    )
    db_session.add(order_record)
    db_session.commit()
    db_session.refresh(order_record)

    # 4. Email notifications
    email_payload = {
        "to": order_data.get("user_email"),
        "subject": f"Order #{order_record.id} Confirmation",
        "template": "order_receipt",
        "context": {"order_id": order_record.id, "amount": total_amount}
    }
    notification_worker.dispatch_email_sync(email_payload)

    return {"order_id": order_record.id, "status": "completed"}`,
  refactoredCode: `def validate_order(order_data: dict) -> None:
    """Validate item collection integrity and non-zero quantities."""
    if not order_data.get("items") or len(order_data["items"]) == 0:
        raise ValueError("Order must contain at least one item")
    for item in order_data["items"]:
        if item.get("quantity", 0) <= 0:
            raise ValueError(f"Invalid item quantity for item {item.get('id')}")

def process_payment(user_id: str, amount: float, stripe_token: str) -> str:
    """Execute isolated payment charge via Stripe gateway."""
    if not stripe_token:
        raise ValueError("Missing payment method token")
    charge = stripe.Charge.create(
        amount=int(amount * 100),
        currency="usd",
        source=stripe_token,
        description=f"Tuition order for user {user_id}"
    )
    if charge.status != "succeeded":
        raise PaymentFailedException("Payment authorization failed")
    return charge.id

def save_order(db_session, user_id: str, total_amount: float, charge_id: str) -> Order:
    """Persist order record within database transaction."""
    order_record = Order(
        user_id=user_id,
        total_amount=total_amount,
        charge_id=charge_id,
        status="completed"
    )
    db_session.add(order_record)
    db_session.commit()
    db_session.refresh(order_record)
    return order_record

def send_notification(email: str, order_id: str, amount: float) -> None:
    """Enqueue confirmation email asynchronously."""
    notification_worker.dispatch_email_async({
        "to": email,
        "subject": f"Order #{order_id} Confirmation",
        "template": "order_receipt",
        "context": {"order_id": order_id, "amount": amount}
    })

def process_order(order_data: dict, user_id: str, db_session) -> dict:
    """Orchestrates order validation, payment, persistence, and notification."""
    validate_order(order_data)
    total_amount = sum(item["price"] * item["quantity"] for item in order_data["items"])
    charge_id = process_payment(user_id, total_amount, order_data.get("stripe_token"))
    order_record = save_order(db_session, user_id, total_amount, charge_id)
    send_notification(order_data.get("user_email"), order_record.id, total_amount)
    return {"order_id": order_record.id, "status": "completed"}`
};

export const DIFF_VIEWER_DATA = {
  filePath: "orders.py",
  changeSummary: "+42 lines, -31 lines across 1 file",
  whyThisChanged: {
    technical: "Separated payment processing from order validation to reduce responsibility overlap and isolate external network dependencies.",
    junior: "We split the big function into 4 smaller jobs so payment errors won't break the database step, and each part can be tested by itself."
  },
  unifiedDiff: [
    { type: "header", text: "@@ -84,45 +84,56 @@ def process_order():" },
    { type: "addition", lineNum: 84, prefix: "+", text: "def validate_order(order_data: dict) -> None:" },
    { type: "addition", lineNum: 85, prefix: "+", text: "    \"\"\"Validate item collection integrity and non-zero quantities.\"\"\"" },
    { type: "addition", lineNum: 86, prefix: "+", text: "    if not order_data.get(\"items\") or len(order_data[\"items\"]) == 0:" },
    { type: "addition", lineNum: 87, prefix: "+", text: "        raise ValueError(\"Order must contain at least one item\")" },
    { type: "addition", lineNum: 88, prefix: "+", text: "    for item in order_data[\"items\"]:" },
    { type: "addition", lineNum: 89, prefix: "+", text: "        if item.get(\"quantity\", 0) <= 0:" },
    { type: "addition", lineNum: 90, prefix: "+", text: "            raise ValueError(f\"Invalid item quantity for item {item.get('id')}\")" },
    { type: "addition", lineNum: 91, prefix: "+", text: "" },
    { type: "addition", lineNum: 92, prefix: "+", text: "def process_payment(user_id: str, amount: float, stripe_token: str) -> str:" },
    { type: "addition", lineNum: 93, prefix: "+", text: "    \"\"\"Execute isolated payment charge via Stripe gateway.\"\"\"" },
    { type: "addition", lineNum: 94, prefix: "+", text: "    if not stripe_token:" },
    { type: "addition", lineNum: 95, prefix: "+", text: "        raise ValueError(\"Missing payment method token\")" },
    { type: "addition", lineNum: 96, prefix: "+", text: "    charge = stripe.Charge.create(" },
    { type: "addition", lineNum: 97, prefix: "+", text: "        amount=int(amount * 100), currency=\"usd\", source=stripe_token" },
    { type: "addition", lineNum: 98, prefix: "+", text: "    )" },
    { type: "addition", lineNum: 99, prefix: "+", text: "    if charge.status != \"succeeded\":" },
    { type: "addition", lineNum: 100, prefix: "+", text: "        raise PaymentFailedException(\"Payment authorization failed\")" },
    { type: "addition", lineNum: 101, prefix: "+", text: "    return charge.id" },
    { type: "addition", lineNum: 102, prefix: "+", text: "" },
    { type: "addition", lineNum: 103, prefix: "+", text: "def save_order(db_session, user_id: str, total_amount: float, charge_id: str) -> Order:" },
    { type: "addition", lineNum: 104, prefix: "+", text: "    order_record = Order(user_id=user_id, total_amount=total_amount, charge_id=charge_id, status=\"completed\")" },
    { type: "addition", lineNum: 105, prefix: "+", text: "    db_session.add(order_record)" },
    { type: "addition", lineNum: 106, prefix: "+", text: "    db_session.commit()" },
    { type: "addition", lineNum: 107, prefix: "+", text: "    db_session.refresh(order_record)" },
    { type: "addition", lineNum: 108, prefix: "+", text: "    return order_record" },
    { type: "addition", lineNum: 109, prefix: "+", text: "" },
    { type: "addition", lineNum: 110, prefix: "+", text: "def send_notification(email: str, order_id: str, amount: float) -> None:" },
    { type: "addition", lineNum: 111, prefix: "+", text: "    notification_worker.dispatch_email_async({\"to\": email, \"order_id\": order_id, \"amount\": amount})" },
    { type: "addition", lineNum: 112, prefix: "+", text: "" },
    { type: "context", lineNum: 113, prefix: " ", text: "def process_order(order_data: dict, user_id: str, db_session) -> dict:" },
    { type: "deletion", lineNum: 114, prefix: "-", text: "    # 1. Validation logic" },
    { type: "deletion", lineNum: 115, prefix: "-", text: "    if not order_data.get(\"items\") or len(order_data[\"items\"]) == 0:" },
    { type: "deletion", lineNum: 116, prefix: "-", text: "        raise ValueError(\"Order must contain at least one item\")" },
    { type: "deletion", lineNum: 117, prefix: "-", text: "    # 2. Payment processing inline" },
    { type: "deletion", lineNum: 118, prefix: "-", text: "    charge = stripe.Charge.create(amount=int(total_amount * 100), ...)" },
    { type: "deletion", lineNum: 119, prefix: "-", text: "    # 3. Database persistence inline" },
    { type: "deletion", lineNum: 120, prefix: "-", text: "    order_record = Order(user_id=user_id, ...)" },
    { type: "deletion", lineNum: 121, prefix: "-", text: "    # 4. Email notifications inline" },
    { type: "deletion", lineNum: 122, prefix: "-", text: "    notification_worker.dispatch_email_sync(email_payload)" },
    { type: "addition", lineNum: 123, prefix: "+", text: "    validate_order(order_data)" },
    { type: "addition", lineNum: 124, prefix: "+", text: "    total_amount = sum(item[\"price\"] * item[\"quantity\"] for item in order_data[\"items\"])" },
    { type: "addition", lineNum: 125, prefix: "+", text: "    charge_id = process_payment(user_id, total_amount, order_data.get(\"stripe_token\"))" },
    { type: "addition", lineNum: 126, prefix: "+", text: "    order_record = save_order(db_session, user_id, total_amount, charge_id)" },
    { type: "addition", lineNum: 127, prefix: "+", text: "    send_notification(order_data.get(\"user_email\"), order_record.id, total_amount)" },
    { type: "context", lineNum: 128, prefix: " ", text: "    return {\"order_id\": order_record.id, \"status\": \"completed\"}" }
  ]
};

export const VERIFICATION_DATA = {
  totalTests: 42,
  passedCount: 42,
  failedCount: 0,
  skippedCount: 0,
  runtime: "1.84s",
  status: "Passed",
  before: {
    passed: 42,
    failed: 0,
    time: "1.92s"
  },
  after: {
    passed: 42,
    failed: 0,
    time: "1.84s"
  },
  explanation: {
    technical: "The original large function was split into four smaller responsibilities while existing tests continued to pass without regressions.",
    junior: "All 42 tests passed! Splitting the code into smaller parts did not break any existing features."
  },
  suites: [
    { name: "tests/test_orders.py", total: 16, passed: 16, failed: 0, duration: "680ms" },
    { name: "tests/test_auth.py", total: 12, passed: 12, failed: 0, duration: "440ms" },
    { name: "tests/test_event_service.py", total: 8, passed: 8, failed: 0, duration: "380ms" },
    { name: "tests/test_billing.py", total: 6, passed: 6, failed: 0, duration: "340ms" }
  ],
  liveLogs: [
    "[pytest] platform win32 -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0",
    "[pytest] rootdir: C:/SIH/DK/repomind-core",
    "[pytest] collecting 42 items ... collected 42 items",
    "tests/test_orders.py::test_process_order_success PASSED [ 2%]",
    "tests/test_orders.py::test_empty_cart_raises_error PASSED [ 5%]",
    "tests/test_orders.py::test_negative_quantity_raises_error PASSED [ 7%]",
    "tests/test_orders.py::test_payment_gateway_failure PASSED [ 10%]",
    "tests/test_orders.py::test_order_persistence_fields PASSED [ 14%]",
    "tests/test_orders.py::test_async_notification_enqueued PASSED [ 17%]",
    "tests/test_auth.py::test_jwt_login_valid_credentials PASSED [ 38%]",
    "tests/test_auth.py::test_jwt_login_invalid_password PASSED [ 42%]",
    "tests/test_billing.py::test_stripe_charge_amount PASSED [ 85%]"
  ]
};

export const FORENSIC_REPORT_DATA = {
  repo_id: "repo-event-mgmt",
  repo_name: "koteswararaoderangula534-creator/repomind",
  analyzed_at: "Today at 18:32 UTC",
  execution_time_seconds: 1.42,
  databases: [
    {
      name: "MongoDB",
      category: "NoSQL Document Database",
      detected_in_config: true,
      detected_in_code: true,
      status: "ACTUALLY USED",
      driver_packages: ["pymongo", "motor"],
      connection_uris: ["mongodb://admin:<REDACTED>@127.0.0.1:27017/event_stream_db"],
      evidence: "12 discrete AST database operations detected across service layers (session_records, events).",
      classification: "[CODE VERIFIED]"
    },
    {
      name: "Supabase",
      category: "Managed Postgres / BaaS Platform",
      detected_in_config: true,
      detected_in_code: false,
      status: "CONFIGURED BUT UNUSED",
      driver_packages: ["@supabase/supabase-js"],
      connection_uris: ["https://repomind-cloud.supabase.co"],
      evidence: "Detected in environment configuration / parameters, but zero active queries or table operations exist in codebase.",
      classification: "[CONFIG VERIFIED]"
    },
    {
      name: "PostgreSQL",
      category: "Relational SQL Database",
      detected_in_config: true,
      detected_in_code: false,
      status: "CONFIGURED BUT UNUSED",
      driver_packages: ["psycopg2"],
      connection_uris: ["postgresql://postgres:<REDACTED>@localhost:5432/audit_registry_db"],
      evidence: "Connection string present in sample config; no active direct queries detected in current execution paths.",
      classification: "[CONFIG VERIFIED]"
    }
  ],
  entities: [
    {
      name: "Session Audit Records",
      database: "MongoDB",
      collection_or_table: "session_records",
      inferred_schema: {
        _id: "ObjectId",
        session_id: "string (UUID)",
        date: "string (YYYY-MM-DD)",
        service_id: "string",
        event_type: "string",
        events: "array[object] (Embedded event audit records)",
        status: "string ('active' | 'closed')",
        created_at: "timestamp"
      },
      nested_arrays: ["events"],
      primary_key_or_id: "session_id",
      unique_constraints: ["_id"],
      missing_constraints: [
        "session_id + session_id composite unique index",
        "events.$.event_id unique constraint"
      ],
      storage_model: "one-document-per-session",
      historical_retention: "Preserved in storage, but truncated at read layer",
      evidence: "[CODE VERIFIED] Collection stores documents for all past sessions; however, read endpoints retrieve only the single most recent session via find_one()."
    },
    {
      name: "Session Index",
      database: "MongoDB",
      collection_or_table: "sessions",
      inferred_schema: {
        _id: "ObjectId",
        session_id: "string",
        name: "string",
        face_encoding: "array[float] (128-d vector)",
        email: "string"
      },
      nested_arrays: ["face_encoding"],
      primary_key_or_id: "session_id",
      unique_constraints: ["session_id"],
      missing_constraints: [],
      storage_model: "one-document-per-user",
      historical_retention: "Full historical retention",
      evidence: "[CODE VERIFIED] Master session metadata registry."
    }
  ],
  write_operations: [
    {
      id: "OP-MGO-001",
      file: "services/session_service.py",
      function: "record_session_event",
      line: 78,
      database: "MongoDB",
      collection_or_table: "session_records",
      operation: "PUSH",
      filter_expr: "{'session_id': session_id}",
      fields_modified: ["events ($push)"],
      code_snippet: "77:     # Fallback push into embedded events array\n78:     db.session_records.update_one({'session_id': session_id}, {'$push': {'events': event_record}})",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    },
    {
      id: "OP-MGO-002",
      file: "services/session_service.py",
      function: "create_session",
      line: 34,
      database: "MongoDB",
      collection_or_table: "session_records",
      operation: "INSERT",
      filter_expr: null,
      fields_modified: ["session_id", "date", "service_id", "events", "status"],
      code_snippet: "33:     session_doc = {'session_id': session_id, 'date': today, 'service_id': service_id, 'events': [], 'status': 'active'}\n34:     db.session_records.insert_one(session_doc)",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    }
  ],
  read_operations: [
    {
      id: "OP-MGO-003",
      file: "services/session_service.py",
      function: "view_session_history",
      line: 112,
      database: "MongoDB",
      collection_or_table: "session_records",
      operation: "FIND_ONE",
      filter_expr: "{'service_id': service_id}",
      fields_modified: [],
      code_snippet: "111: def view_session_history(service_id: str):\n112:     record = db.session_records.find_one({'service_id': service_id})\n113:     return record",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    },
    {
      id: "OP-MGO-004",
      file: "services/event_service.py",
      function: "get_session_by_id",
      line: 45,
      database: "MongoDB",
      collection_or_table: "sessions",
      operation: "FIND_ONE",
      filter_expr: "{'session_id': session_id}",
      fields_modified: [],
      code_snippet: "44: def get_session_by_id(session_id: str):\n45:     return db.sessions.find_one({'session_id': session_id})",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    }
  ],
  flows: [
    {
      entity: "Session Event Record",
      frontend_trigger: "Camera Face Detection / Recognition Stream",
      api_endpoint: "POST /api/events/mark",
      controller_func: "record_session_event()",
      database_target: "session_records (MongoDB)",
      read_path: "GET /api/events/records (find_one())",
      ui_display: "Session Events / Audit View",
      steps: [
        {
          layer: "Frontend",
          component: "EventIngress.tsx / VideoStream.js",
          action: "Ingests event stream, extracts payload tokens, and routes asynchronously",
          file: "frontend/components/EventIngress.tsx",
          line: 48
        },
        {
          layer: "API Gateway",
          component: "POST /api/events/mark",
          action: "Receives event identifier and payload parameters, validates body, routes to handler",
          file: "backend/api/routes/events.py",
          line: 24
        },
        {
          layer: "Service Layer",
          component: "SessionEventService.record_session_event()",
          action: "Performs check on active session document and executes $push into embedded events array",
          file: "backend/services/session_service.py",
          line: 65
        },
        {
          layer: "Database",
          component: "MongoDB: session_records",
          action: "Appends event entry into events array in matching session_id document",
          file: "backend/services/session_service.py",
          line: 78
        },
        {
          layer: "Read Path",
          component: "GET /api/events/records (view_session_history)",
          action: "Executes find_one() on session_records collection, returning single latest document",
          file: "backend/services/session_service.py",
          line: 112
        },
        {
          layer: "Frontend UI",
          component: "SessionAuditView.tsx",
          action: "Renders single session response. Historical past sessions are omitted.",
          file: "frontend/views/SessionAuditView.tsx",
          line: 32
        }
      ]
    }
  ],
  findings: [
    {
      id: "FRN-001",
      title: "Historical Data Truncation via find_one()",
      severity: "CRITICAL",
      category: "Query Truncation",
      classification: "[CODE VERIFIED]",
      file: "services/session_service.py",
      function: "view_session_history",
      line: 112,
      evidence: "Function 'view_session_history' executes 'find_one()' on collection 'session_records'. In MongoDB, find_one() returns only the first matching document. All previous historical session documents exist in the database but are completely hidden from API consumers and UI views.",
      impact: "Only current/single session event history is displayed. Historical records disappear from the application UI.",
      confidence: 1.0,
      code_snippet: "111: def view_session_history(service_id: str):\n112:     record = db.session_records.find_one({'service_id': service_id})\n113:     return record",
      suggested_fix: "Replace 'find_one()' with 'find()' returning a cursor of sessions, or accept a date/session_id filter parameter."
    },
    {
      id: "FRN-002",
      title: "Embedded Array Race Condition via $push",
      severity: "HIGH",
      category: "Race Condition",
      classification: "[CODE VERIFIED]",
      file: "services/session_service.py",
      function: "record_session_event",
      line: 78,
      evidence: "Function 'record_session_event' invokes update with '$push' on array field. Because this write is not atomic with the presence check and lacks a unique constraint, concurrent requests create duplicate entries for the same event in the session.",
      impact: "Duplicate event entries within the same session document.",
      confidence: 1.0,
      concurrency_timeline: {
        trigger: "Two rapid concurrent event submissions for the same session",
        step1: "Request A checks if event is in event stream array -> Returns false (not yet added)",
        step2: "Request B checks if event is in event stream array -> Returns false (before Request A completes write)",
        outcome: "Both requests execute $push, inserting duplicate event records into the embedded array.",
        code_references: ["services/session_service.py:78"]
      },
      code_snippet: "77:     # Non-atomic check-then-push\n78:     db.session_records.update_one({'session_id': session_id}, {'$push': {'events': event_record}})",
      suggested_fix: "Use MongoDB '$addToSet' with deterministic event identifier, or enforce compound uniqueness."
    },
    {
      id: "FRN-003",
      title: "Abandoned Session Lifecycle (Frontend Never Calls Finalize)",
      severity: "HIGH",
      category: "Missing Lifecycle",
      classification: "[CODE VERIFIED]",
      file: "api/routes/events.py",
      function: "finalize_session",
      line: 85,
      evidence: "Backend exposes session finalization logic (status: 'closed'), but frontend camera and recognition components stop locally without dispatching an API call to finalize the session. Sessions remain permanently in 'active' status in MongoDB.",
      impact: "Database sessions are never formally marked as closed or finalized; session end times are permanently null.",
      confidence: 1.0,
      code_snippet: "// Frontend stops stream:\nstream.getTracks().forEach(track => track.stop());\n// Missing: await api.post('/api/session/finalize', { session_id });",
      suggested_fix: "Add API call to session finalization endpoint inside component cleanup or 'Stop Session' button click handler."
    },
    {
      id: "FRN-004",
      title: "Hardcoded MongoDB Credentials in Source Code",
      severity: "CRITICAL",
      category: "Credential Exposure",
      classification: "[CODE VERIFIED]",
      file: "config.py",
      function: "(configuration)",
      line: 28,
      evidence: "Plaintext database credentials committed directly to source control: mongodb://admin:<REDACTED>@127.0.0.1:27017/event_stream_db",
      impact: "Unauthorized database access; risk of data exfiltration or tampering if repository is shared.",
      confidence: 1.0,
      code_snippet: "MONGO_URI = 'mongodb://admin:<REDACTED>@127.0.0.1:27017/event_stream_db'",
      suggested_fix: "Store database connection strings in environment variables (.env) and load via os.getenv()."
    },
    {
      id: "FRN-005",
      title: "Database Platform Mismatch (Supabase Configured, MongoDB Actually Used)",
      severity: "MEDIUM",
      category: "Configuration Mismatch",
      classification: "[CONFIG VERIFIED]",
      file: ".env / config.py",
      function: "(platform_configuration)",
      line: 1,
      evidence: "SUPABASE_URL is configured in environment parameters, but zero active queries or table operations target Supabase. 100% of runtime database operations execute against MongoDB via pymongo.",
      impact: "Misleading architectural assumptions; team members may assume data is in Supabase when it is only stored in MongoDB.",
      confidence: 1.0,
      code_snippet: "SUPABASE_URL=https://repomind-cloud.supabase.co  # UNUSED\nMONGO_URI=mongodb://admin:<REDACTED>@127.0.0.1:27017 # ACTUALLY USED",
      suggested_fix: "Remove obsolete Supabase configuration or implement database synchronization / migration adapter."
    },
    {
      id: "FRN-006",
      title: "Missing Unique Compound Constraint on session_records",
      severity: "MEDIUM",
      category: "Missing Constraint",
      classification: "[CODE VERIFIED]",
      file: "db/init.py",
      function: "collection_initialization",
      line: 12,
      evidence: "Collection 'session_records' does not define a unique compound index on (session_id, session_id) in code or migration scripts. Data deduplication relies entirely on application-level checks.",
      impact: "Database layer cannot prevent duplicate event insertions if application-level checks fail or race.",
      confidence: 0.95,
      code_snippet: "db.session_records.create_index([('session_id', 1), ('events.event_id', 1)], unique=True)  # Missing",
      suggested_fix: "Add compound unique index on (session_id, session_id) during database initialization."
    }
  ],
  root_causes: [
    {
      id: "RC-001",
      title: "Historical Session Event Invisibility",
      symptom: "Only current session session_event is visible; historical event records disappear from application UI.",
      direct_cause: "Read API endpoint calls db.session_records.find_one() instead of find().",
      underlying_cause: "Endpoint assumes only one session document is needed to represent all event records.",
      architectural_cause: "Lack of CQRS separation between real-time active session capture and multi-session historical reporting.",
      evidence_tag: "[CODE VERIFIED]"
    },
    {
      id: "RC-002",
      title: "Duplicate Event Mutations in Embedded Arrays",
      symptom: "Same event appears multiple times in event records for a single session.",
      direct_cause: "Non-atomic check-then-push array update pattern in record_session_event() allows interleaved concurrent requests.",
      underlying_cause: "MongoDB $push appends unconditionally without index uniqueness on embedded array elements.",
      architectural_cause: "Unenforced data-tier constraints; relying entirely on optimistic application-level checks without database locks or $addToSet.",
      evidence_tag: "[CODE VERIFIED]"
    },
    {
      id: "RC-003",
      title: "Permanent 'Active' Session Status in Database",
      symptom: "Sessions remain in 'active' status indefinitely with null end timestamps.",
      direct_cause: "Frontend recognition component stops local media stream but dispatches no finalization HTTP request to backend.",
      underlying_cause: "Frontend lifecycle decoupled from backend session state management.",
      architectural_cause: "Missing explicit session lifecycle state machine and timeout-based background reaper service.",
      evidence_tag: "[CODE VERIFIED]"
    }
  ],
  cross_checks: [
    {
      topic: "Historical Data Retention vs API Read Visibility",
      aspect_a: "Database Persistence Layer (MongoDB)",
      aspect_b: "API Read Query Layer (find_one)",
      verdict: "CONFLICTING EVIDENCE",
      details: "Database physically preserves all session documents over time (append-in-place). However, the read endpoint executes 'find_one()', discarding all but the first matching document. The code symptom (missing history) is caused by the query, not data loss.",
      classification: "[CODE VERIFIED]"
    },
    {
      topic: "Configured Database vs Actual Runtime Engine",
      aspect_a: "Configuration & Parameters (SUPABASE_URL)",
      aspect_b: "Source Code Invocations (pymongo)",
      verdict: "CONFLICTING EVIDENCE",
      details: "Environment configuration includes a Supabase project reference. However, 100% of runtime database operations in the source code target MongoDB via pymongo. Supabase client is not instantiated or utilized in runtime execution.",
      classification: "[CONFIG VERIFIED]"
    },
    {
      topic: "Frontend Session Lifecycle vs Backend Persistence",
      aspect_a: "Frontend Capture Stream (Component Unmount / Stop)",
      aspect_b: "Backend Database State (Status: 'active')",
      verdict: "DISCONNECTED",
      details: "Frontend halts camera capture and recognition locally, but never transmits a finalization request to the backend. As a consequence, session records remain permanently open in the database.",
      classification: "[CODE VERIFIED]"
    }
  ],
  unverified_items: [
    {
      target: "Supabase External Project (https://repomind-cloud.supabase.co)",
      reason: "Static offline analysis cannot authenticate against external Supabase REST/Postgres endpoint without API credentials.",
      classification: "[UNVERIFIED]",
      recommendation: "Provide valid SUPABASE_SERVICE_ROLE_KEY to enable remote schema and RLS policy verification."
    }
  ],
  summary: {
    total_databases_detected: 3,
    actual_databases_used: ["MongoDB"],
    configured_unused_databases: ["Supabase", "PostgreSQL"],
    total_database_operations: 4,
    writes_count: 2,
    reads_count: 2,
    critical_findings: 2,
    high_findings: 2,
    medium_findings: 2,
    low_findings: 0,
    total_findings: 6,
    entities_count: 2,
    flows_count: 1
  }
};

