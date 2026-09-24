# RepoMind

> **Autonomous Codebase Understanding & Safe Refactoring Agent**  
> *Understand your codebase. Refactor it safely.*

RepoMind has two clearly separated experiences:
1. **Public Website** (Product explanation, architecture, capabilities, trust/safety, and ingress)
2. **Authenticated Developer Workspace** (Calm repository home, connection, AST understanding, diagnostics, impact analysis, refactoring studio, diff review, and test verification)

```
PUBLIC WEBSITE
        ↓
      INTRO
        ↓
WHAT IS REPOMIND?
        ↓
  WHY REPOMIND?
        ↓
   HOW IT WORKS
        ↓
KEY CAPABILITIES
        ↓
   GET STARTED
        ↓
  LOGIN / SIGN UP
        ↓
  USER WORKSPACE (Calm Recent Repositories)
        ↓
REPOSITORY ANALYSIS (Overview, Ask AI, Architecture, Health, Impact, Refactor, Diff, Verify)
```

---

## Design Philosophy

RepoMind is designed with the rigor, usability, and typography standards of mature developer infrastructure products (Linear, GitHub, Sentry, Datadog, Raycast, and modern IDEs):
- **Calm, technical, information-dense:** Built on a neutral dark slate foundation (`#090d13`, `#0d1117`, `#161b22`) with a single controlled brand blue accent (`#1f6feb` / `#388bfd`).
- **Semantic colors strictly where necessary:** Crimson for `HIGH` risk, Amber for `MEDIUM` risk, Slate for `LOW` risk, and Emerald for `SUCCESS`.
- **Zero AI gimmicks:** No purple/blue AI gradients, no floating gradient blobs, no emoji clutter, no neon glow, and no fake statistics.
- **Typography:** Inter for clean UI hierarchy and JetBrains Mono for syntax-colored code, line gutters, and diff blocks.
- **Junior Mode Switch:** Dynamic global toggle between **Technical Engineering** terminology and **Junior-Friendly** mental models across all diagnostics, AST decompositions, and test verifications.

---

## Two Separated Experiences & Routes

### A. Public Website (`/`, `#product`, `#how-it-works`, `#why-repomind`, `#features`)
- **Public Navigation**: Simple, professional top bar with `Product`, `How It Works`, `Why RepoMind`, `Features`, and clear `Sign In` / `Get Started` actions.
- **Hero / Intro**: Confident, technical headline (*Understand your codebase. Refactor it safely.*) with subtle horizontal workflow diagram (`Repository → Understand → Detect → Refactor → Verify`).
- **What is RepoMind?**: Clear summary comparing traditional manual ramp-up with RepoMind's structured AST understanding.
- **Why RepoMind?**: Problem → Solution structure explaining large repository complexity and RepoMind's unified 5-step workflow.
- **How It Works**: 5 clean numbered steps (`01 CONNECT`, `02 UNDERSTAND`, `03 DETECT`, `04 REFACTOR`, `05 VERIFY`).
- **Key Capabilities**: Logically grouped under `UNDERSTAND`, `IMPROVE`, and `VERIFY`, plus Junior-Friendly Explanations.
- **Trust & Safety**: *Built for controlled changes* detailing the `Analyze → Propose → Review → Test → Approve` human sign-off pipeline.
- **Minimal Footer**: Links to Product, How It Works, Features, Security, Docs, Contact.

### B. Authentication (`/login`, `/signup`)
- Minimal developer authentication dialog with one-click `Continue as Alex Chen (Demo)`, `Continue with GitHub`, or work email login.

### C. Authenticated Developer Workspace
- **Workspace Home (`/app`)**: Calm first screen after login.
  - *"Welcome back, Alex. Analyze a repository to get started."*
  - Primary Action: `+ Analyze Repository`
  - Recent Repositories list (`university-sys/student-management-system`, `campus-portal/core-api`, `infra-tools/deploy-bot`).
- **Repository Connection (`/app/repository`)**: Minimal, clean repository connection:
  - GitHub Repository URL (`https://github.com/...`)
  - Branch (`main`)
  - `Analyze Repository` action.
- **Repository Deep Dive Workspace**:
  - `Overview` (`/app/overview`): Engineering metrics (147 Files, 18 Modules, 42 Tests, 13 Findings).
  - `Ask AI` (`/app/ask`): Codebase intelligence with clickable line citations (`login.py:24-41`, `auth_service.py:51-79`).
  - `Architecture` (`/app/architecture`): Interactive "What talks to what?" node inspector.
  - `Forensic Analysis` (`/app/forensic`): Single-shot AST database detection (configured vs actually used), query truncation analysis, array race condition tracing, and root-cause hierarchy.
  - `Code Health` (`/app/code-health`): 13 findings table (2 HIGH, 7 MEDIUM, 4 LOW) with filters and actions.
  - `Impact Analysis` (`/app/impact`): Static caller blast radius for `authenticate_user()`.
  - `Refactor Studio` (`/app/refactor`): 3-column decomposition of `process_order()` into 4 SRP functions.
  - `Diff Viewer` (`/app/diff`): Unified and Side-by-Side before/after diff review.
  - `Verification` (`/app/verification`): Automated test matrix (42/42 passed) with safe `Approve & Apply` dialog.
  - `Settings` (`/app/settings`): Engine, GitHub token, and mode preferences.

---

## Directory Architecture

```
c:\SIH\DK\
├── index.html                   # HTML entry point (fonts, meta, semantic root)
├── server.py                    # Local zero-dependency dev server (port 5173)
├── package.json                 # Standard manifest
├── README.md                    # System architecture & documentation
├── styles/
│   ├── design-system.css        # Color tokens, typography, dark/light theme, reset
│   ├── public.css               # Public website layout, hero, capabilities & auth
│   ├── layout.css               # Topbar, sidebar, workspace, statusbar, breakpoints
│   ├── components.css           # Buttons, badges, tables, panels, dialogs, drawers
│   └── code.css                 # Code viewer, gutter numbers, unified & split diff
└── src/
    ├── main.js                  # Application orchestrator, router, keyboard shortcuts
    ├── state/
    │   └── store.js             # Centralized reactive pub/sub state store & auth
    ├── data/
    │   └── mockData.js          # Decoupled realistic mock repository datasets
    ├── components/
    │   ├── Icons.js             # Pixel-aligned developer SVG icon library
    │   ├── Topbar.js            # Workspace topbar, breadcrumb, Junior Mode toggle, search
    │   ├── Sidebar.js           # Workflow navigation & active indicators
    │   ├── CodeInspectorModal.js# Code inspection drawer for source citations
    │   ├── ConfirmationDialog.js# Safe human approval dialog
    │   └── CommandPalette.js    # Ctrl+K modal switcher
    └── pages/
        ├── PublicWebsite.js     # Public landing page (Sections 1-11)
        ├── AuthPage.js          # Clean developer login/signup (Section 12)
        ├── WorkspaceHome.js     # Calm first screen after login (Section 14)
        ├── RepositoryConnection.js # Minimal repository connection (Section 15)
        ├── RepositoryOverview.js
        ├── AskAI.js
        ├── ArchitecturePage.js
        ├── ForensicPage.js      # Deep database & runtime forensic analysis studio
        ├── CodeHealthPage.js
        ├── ImpactAnalysisPage.js
        ├── RefactorPage.js
        ├── DiffViewerPage.js
        ├── VerificationPage.js
        └── SettingsPage.js
```

---

## Running the Application

To run the application locally:

```bash
python server.py
```

Then navigate to:
```
http://localhost:5173
```
- First-time visitors arrive at the **Public Website**.
- Clicking **Get Started** or **Sign In** opens the clean authentication screen.
- Clicking **Continue as Alex Chen (Demo)** takes you into the calm **Developer Workspace**.
- Clicking **Sign Out** returns to the Public Website.
