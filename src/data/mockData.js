/**
 * RepoMind Mock Data Layer
 * Realistic engineering data for university-sys/student-management-system.
 * Completely decoupled from the UI components for easy REST/GraphQL API integration.
 */

export const REPOSITORY_DATA = {
  id: "repo-student-mgmt",
  name: "university-sys/student-management-system",
  url: "https://github.com/university-sys/student-management-system",
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
    { name: "Database", tech: "PostgreSQL 15 / SQLAlchemy", files: 21, status: "2 Findings" }
  ]
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
26:     APP_NAME: str = "StudentManagementAPI"
27:     SECRET_KEY: str = "d948a73f9104b2e811c038290fbb62a1"  # RISK: hardcoded
28:     ALGORITHM: str = "HS256"
29:     ACCESS_TOKEN_EXPIRE_MINUTES: int = 60`
  },
  {
    id: "FND-002",
    severity: "HIGH",
    rule: "SEC-004",
    title: "SQL Injection Risk in Student Query",
    description: "Raw formatted SQL query using f-strings inside cursor execution bypasses parameter sanitization.",
    juniorDescription: "User input is directly inserted into a database query. If someone puts malicious commands into their search, the database might execute them. Using prepared parameters fixes this.",
    file: "services/student_service.py",
    line: 114,
    module: "StudentService",
    status: "Open",
    category: "Security",
    suggestedRefactorId: null,
    impactEntity: "search_students_raw",
    codeSnippet: `112: def search_students_raw(db, query: str):
113:     cursor = db.cursor()
114:     sql = f"SELECT * FROM students WHERE name LIKE '%{query}%'"
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
    file: "api/routes/enrollment.py",
    line: 42,
    module: "APIRoutes",
    status: "Open",
    category: "Architecture",
    suggestedRefactorId: null,
    impactEntity: "enroll_student_endpoint",
    codeSnippet: `41: @router.post("/enroll")
42: def enroll_student(payload: EnrollSchema, db: Session = Depends(get_db)):
43:     # Bypassing service layer:
44:     record = db.query(Enrollment).filter_by(student_id=payload.student_id).first()`
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
    file: "models/student.py",
    line: 15,
    module: "DataModels",
    status: "Open",
    category: "Outdated Patterns",
    suggestedRefactorId: null,
    impactEntity: "StudentResponseModel",
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
    description: "Numeric literal 0.85 used for early bird student discount without named constant.",
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
    query: "How does authentication work?",
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
    id: "q-order",
    query: "How does the order and payment flow work?",
    category: "Business Logic",
    technicalExplanation: "Order submission initiates at orders.py via process_order(). The function verifies item availability, initiates an external payment gateway call to Stripe, commits the order invoice to PostgreSQL, and invokes notification_worker to asynchronously dispatch confirmation emails.",
    juniorExplanation: "When a student pays for a course or lab fee, the app checks if the class has space, charges their payment card, saves the receipt in the database, and sends an email receipt.",
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
    technicalExplanation: "The database layer is managed through SQLAlchemy models in models/. Direct session access is concentrated in services/student_service.py, services/course_service.py, services/billing_service.py, and auth_service.py. A structural leak exists in api/routes/enrollment.py which queries the DB directly.",
    juniorExplanation: "Most parts of the system go through specific helper services to reach the database, which is good practice. However, one web page route in enrollment.py cheats and talks directly to the database without going through the helper service.",
    flowSteps: [
      { name: "services/*", role: "Authorized Services", action: "Read/Write queries via ORM" },
      { name: "api/routes/enrollment.py", role: "Architectural Leak", action: "Direct DB query bypassing service" },
      { name: "database.py", role: "Connection Pool", action: "Manages PostgreSQL engine & pool (size=20)" }
    ],
    sources: [
      { file: "database.py", lines: "8–24", func: "get_db", fullSnippet: `8: engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)
9: SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)` },
      { file: "api/routes/enrollment.py", lines: "42–48", func: "enroll_student", fullSnippet: `42: record = db.query(Enrollment).filter_by(student_id=payload.student_id).first()` }
    ],
    affectedEntities: ["PostgreSQL Session", "Connection Pool", "ORM Entities"],
    riskAssessment: "Medium architectural risk due to direct query leaks in route handlers."
  }
];

export const ARCHITECTURE_GRAPH_DATA = {
  layers: [
    {
      id: "layer-client",
      name: "Client Layer",
      nodes: [
        { id: "node-web", name: "Web Application", type: "frontend", tech: "Next.js 14 / React", port: "3000", description: "Student portal & admin dashboard" },
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
        { id: "node-student", name: "Student & Enrollment", type: "service", tech: "student_service.py", files: "enrollment.py", description: "Course registrations, grade submissions, GPA calculations" },
        { id: "node-notify", name: "Notification Worker", type: "worker", tech: "asyncio worker", files: "notification_worker.py", description: "Email dispatch, socket push events" }
      ]
    },
    {
      id: "layer-data",
      name: "Persistence & External",
      nodes: [
        { id: "node-postgres", name: "PostgreSQL 15", type: "database", tech: "Relational DB", port: "5432", description: "Students, courses, enrollments, credentials" },
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
    { from: "node-api", to: "node-student", protocol: "Internal Call", label: "Student Records" },
    { from: "node-auth", to: "node-postgres", protocol: "SQLAlchemy", label: "User Credentials" },
    { from: "node-auth", to: "node-redis", protocol: "TCP", label: "Session Tokens" },
    { from: "node-order", to: "node-stripe", protocol: "HTTPS TLS", label: "Process Card" },
    { from: "node-order", to: "node-postgres", protocol: "SQLAlchemy", label: "Save Invoices" },
    { from: "node-order", to: "node-notify", protocol: "Task Queue", label: "Queue Email" },
    { from: "node-notify", to: "node-sendgrid", protocol: "SMTP TLS", label: "Send Email" },
    { from: "node-student", to: "node-postgres", protocol: "SQLAlchemy", label: "Course Queries" }
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
    blastRadiusScore: "62/100 (Moderate)",
    riskRating: "HIGH"
  },
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
        description=f"Tuition order for user {user_id}"
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
    { name: "tests/test_student_service.py", total: 8, passed: 8, failed: 0, duration: "380ms" },
    { name: "tests/test_billing.py", total: 6, passed: 6, failed: 0, duration: "340ms" }
  ],
  liveLogs: [
    "[pytest] platform win32 -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0",
    "[pytest] rootdir: C:/SIH/DK/student-management-system",
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
  repo_id: "repo-student-mgmt",
  repo_name: "university-sys/student-management-system",
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
      connection_uris: ["mongodb://admin:<REDACTED>@127.0.0.1:27017/student_mgmt"],
      evidence: "12 discrete AST database operations detected across service layers (attendance_records, students).",
      classification: "[CODE VERIFIED]"
    },
    {
      name: "Supabase",
      category: "Managed Postgres / BaaS Platform",
      detected_in_config: true,
      detected_in_code: false,
      status: "CONFIGURED BUT UNUSED",
      driver_packages: ["@supabase/supabase-js"],
      connection_uris: ["https://xyz-university.supabase.co"],
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
      connection_uris: ["postgresql://postgres:<REDACTED>@localhost:5432/students_db"],
      evidence: "Connection string present in sample config; no active direct queries detected in current execution paths.",
      classification: "[CONFIG VERIFIED]"
    }
  ],
  entities: [
    {
      name: "Attendance Records",
      database: "MongoDB",
      collection_or_table: "attendance_records",
      inferred_schema: {
        _id: "ObjectId",
        session_id: "string (UUID)",
        date: "string (YYYY-MM-DD)",
        class_id: "string",
        subject: "string",
        students: "array[object] (Embedded student attendance records)",
        status: "string ('active' | 'closed')",
        created_at: "timestamp"
      },
      nested_arrays: ["students"],
      primary_key_or_id: "session_id",
      unique_constraints: ["_id"],
      missing_constraints: [
        "session_id + student_id composite unique index",
        "students.$.student_id unique constraint"
      ],
      storage_model: "one-document-per-session",
      historical_retention: "Preserved in storage, but truncated at read layer",
      evidence: "[CODE VERIFIED] Collection stores documents for all past sessions; however, read endpoints retrieve only the single most recent session via find_one()."
    },
    {
      name: "Students Roster",
      database: "MongoDB",
      collection_or_table: "students",
      inferred_schema: {
        _id: "ObjectId",
        student_id: "string",
        name: "string",
        face_encoding: "array[float] (128-d vector)",
        email: "string"
      },
      nested_arrays: ["face_encoding"],
      primary_key_or_id: "student_id",
      unique_constraints: ["student_id"],
      missing_constraints: [],
      storage_model: "one-document-per-user",
      historical_retention: "Full historical retention",
      evidence: "[CODE VERIFIED] Master student profile directory."
    }
  ],
  write_operations: [
    {
      id: "OP-MGO-001",
      file: "services/attendance_service.py",
      function: "mark_attendance",
      line: 78,
      database: "MongoDB",
      collection_or_table: "attendance_records",
      operation: "PUSH",
      filter_expr: "{'session_id': session_id}",
      fields_modified: ["students ($push)"],
      code_snippet: "77:     # Fallback push into embedded students array\n78:     db.attendance_records.update_one({'session_id': session_id}, {'$push': {'students': student_record}})",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    },
    {
      id: "OP-MGO-002",
      file: "services/attendance_service.py",
      function: "create_session",
      line: 34,
      database: "MongoDB",
      collection_or_table: "attendance_records",
      operation: "INSERT",
      filter_expr: null,
      fields_modified: ["session_id", "date", "class_id", "students", "status"],
      code_snippet: "33:     session_doc = {'session_id': session_id, 'date': today, 'class_id': class_id, 'students': [], 'status': 'active'}\n34:     db.attendance_records.insert_one(session_doc)",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    }
  ],
  read_operations: [
    {
      id: "OP-MGO-003",
      file: "services/attendance_service.py",
      function: "view_attendance",
      line: 112,
      database: "MongoDB",
      collection_or_table: "attendance_records",
      operation: "FIND_ONE",
      filter_expr: "{'class_id': class_id}",
      fields_modified: [],
      code_snippet: "111: def view_attendance(class_id: str):\n112:     record = db.attendance_records.find_one({'class_id': class_id})\n113:     return record",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    },
    {
      id: "OP-MGO-004",
      file: "services/student_service.py",
      function: "get_student_by_id",
      line: 45,
      database: "MongoDB",
      collection_or_table: "students",
      operation: "FIND_ONE",
      filter_expr: "{'student_id': student_id}",
      fields_modified: [],
      code_snippet: "44: def get_student_by_id(student_id: str):\n45:     return db.students.find_one({'student_id': student_id})",
      evidence_classification: "[CODE VERIFIED]",
      confidence: 1.0
    }
  ],
  flows: [
    {
      entity: "Attendance Record",
      frontend_trigger: "Camera Face Detection / Recognition Stream",
      api_endpoint: "POST /api/attendance/mark",
      controller_func: "mark_attendance()",
      database_target: "attendance_records (MongoDB)",
      read_path: "GET /api/attendance/records (find_one())",
      ui_display: "Attendance Table / Summary View",
      steps: [
        {
          layer: "Frontend",
          component: "CameraCapture.tsx / VideoStream.js",
          action: "Captures video frame, runs local face recognition, and transmits base64/student payload",
          file: "frontend/components/CameraCapture.tsx",
          line: 48
        },
        {
          layer: "API Gateway",
          component: "POST /api/attendance/mark",
          action: "Receives student identifier and session parameters, validates body, routes to handler",
          file: "backend/api/routes/attendance.py",
          line: 24
        },
        {
          layer: "Service Layer",
          component: "AttendanceService.mark_attendance()",
          action: "Performs check on active session document and executes $push into embedded students array",
          file: "backend/services/attendance_service.py",
          line: 65
        },
        {
          layer: "Database",
          component: "MongoDB: attendance_records",
          action: "Appends student entry into students array in matching session_id document",
          file: "backend/services/attendance_service.py",
          line: 78
        },
        {
          layer: "Read Path",
          component: "GET /api/attendance/records (view_attendance)",
          action: "Executes find_one() on attendance_records collection, returning single latest document",
          file: "backend/services/attendance_service.py",
          line: 112
        },
        {
          layer: "Frontend UI",
          component: "AttendanceHistoryView.tsx",
          action: "Renders single session response. Historical past sessions are omitted.",
          file: "frontend/views/AttendanceHistoryView.tsx",
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
      file: "services/attendance_service.py",
      function: "view_attendance",
      line: 112,
      evidence: "Function 'view_attendance' executes 'find_one()' on collection 'attendance_records'. In MongoDB, find_one() returns only the first matching document. All previous historical session documents exist in the database but are completely hidden from API consumers and UI views.",
      impact: "Only current/single session attendance is displayed. Historical records disappear from the application UI.",
      confidence: 1.0,
      code_snippet: "111: def view_attendance(class_id: str):\n112:     record = db.attendance_records.find_one({'class_id': class_id})\n113:     return record",
      suggested_fix: "Replace 'find_one()' with 'find()' returning a cursor of sessions, or accept a date/session_id filter parameter."
    },
    {
      id: "FRN-002",
      title: "Embedded Array Race Condition via $push",
      severity: "HIGH",
      category: "Race Condition",
      classification: "[CODE VERIFIED]",
      file: "services/attendance_service.py",
      function: "mark_attendance",
      line: 78,
      evidence: "Function 'mark_attendance' invokes update with '$push' on array field. Because this write is not atomic with the presence check and lacks a unique constraint, concurrent requests create duplicate entries for the same student in the session.",
      impact: "Duplicate student attendance entries within the same session document.",
      confidence: 1.0,
      concurrency_timeline: {
        trigger: "Two rapid concurrent face recognition events for the same student",
        step1: "Request A checks if student is in attendance array -> Returns false (not yet added)",
        step2: "Request B checks if student is in attendance array -> Returns false (before Request A completes write)",
        outcome: "Both requests execute $push, inserting duplicate student records into the embedded array.",
        code_references: ["services/attendance_service.py:78"]
      },
      code_snippet: "77:     # Non-atomic check-then-push\n78:     db.attendance_records.update_one({'session_id': session_id}, {'$push': {'students': student_record}})",
      suggested_fix: "Use MongoDB '$addToSet' with deterministic student identifier, or enforce compound uniqueness."
    },
    {
      id: "FRN-003",
      title: "Abandoned Session Lifecycle (Frontend Never Calls Finalize)",
      severity: "HIGH",
      category: "Missing Lifecycle",
      classification: "[CODE VERIFIED]",
      file: "api/routes/attendance.py",
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
      evidence: "Plaintext database credentials committed directly to source control: mongodb://admin:<REDACTED>@127.0.0.1:27017/student_mgmt",
      impact: "Unauthorized database access; risk of data exfiltration or tampering if repository is shared.",
      confidence: 1.0,
      code_snippet: "MONGO_URI = 'mongodb://admin:<REDACTED>@127.0.0.1:27017/student_mgmt'",
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
      code_snippet: "SUPABASE_URL=https://xyz-university.supabase.co  # UNUSED\nMONGO_URI=mongodb://admin:<REDACTED>@127.0.0.1:27017 # ACTUALLY USED",
      suggested_fix: "Remove obsolete Supabase configuration or implement database synchronization / migration adapter."
    },
    {
      id: "FRN-006",
      title: "Missing Unique Compound Constraint on attendance_records",
      severity: "MEDIUM",
      category: "Missing Constraint",
      classification: "[CODE VERIFIED]",
      file: "db/init.py",
      function: "collection_initialization",
      line: 12,
      evidence: "Collection 'attendance_records' does not define a unique compound index on (session_id, student_id) in code or migration scripts. Data deduplication relies entirely on application-level checks.",
      impact: "Database layer cannot prevent duplicate attendance insertions if application-level checks fail or race.",
      confidence: 0.95,
      code_snippet: "db.attendance_records.create_index([('session_id', 1), ('students.student_id', 1)], unique=True)  # Missing",
      suggested_fix: "Add compound unique index on (session_id, student_id) during database initialization."
    }
  ],
  root_causes: [
    {
      id: "RC-001",
      title: "Historical Attendance Invisibility",
      symptom: "Only current session attendance is visible; historical attendance records disappear from application UI.",
      direct_cause: "Read API endpoint calls db.attendance_records.find_one() instead of find().",
      underlying_cause: "Endpoint assumes only one session document is needed to represent all attendance records.",
      architectural_cause: "Lack of CQRS separation between real-time active session capture and multi-session historical reporting.",
      evidence_tag: "[CODE VERIFIED]"
    },
    {
      id: "RC-002",
      title: "Duplicate Student Attendance in Embedded Arrays",
      symptom: "Same student appears multiple times in attendance records for a single session.",
      direct_cause: "Non-atomic check-then-push array update pattern in mark_attendance() allows interleaved concurrent requests.",
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
      target: "Supabase External Project (https://xyz-university.supabase.co)",
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

