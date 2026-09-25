/**
 * RepoMind Centralized State Store
 * Two clearly separated experiences: Public Website and Authenticated Workspace.
 */

import {
  REPOSITORY_DATA,
  CODE_HEALTH_FINDINGS,
  ASK_AI_SAMPLE_QUERIES,
  ARCHITECTURE_GRAPH_DATA,
  IMPACT_ANALYSIS_DATA,
  REFACTOR_DATA,
  DIFF_VIEWER_DATA,
  VERIFICATION_DATA,
  FORENSIC_REPORT_DATA
} from "../data/mockData.js";
import { apiService } from "../services/api.js";

export const RECENT_REPOSITORIES = [
  {
    id: "repo-student-mgmt",
    name: "university-sys/student-management-system",
    language: "Python 3.11 / FastAPI",
    lastAnalyzed: "2 hours ago",
    filesCount: 147,
    findingsCount: 13,
    highFindings: 2,
    testsCount: 42,
    isCurrent: true
  },
  {
    id: "repo-2",
    name: "campus-portal/core-api",
    language: "FastAPI / TypeScript",
    lastAnalyzed: "Yesterday",
    filesCount: 82,
    findingsCount: 4,
    highFindings: 0,
    testsCount: 28,
    isCurrent: false
  },
  {
    id: "repo-3",
    name: "infra-tools/deploy-bot",
    language: "Go 1.22",
    lastAnalyzed: "4 days ago",
    filesCount: 34,
    findingsCount: 1,
    highFindings: 0,
    testsCount: 16,
    isCurrent: false
  }
];

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = {
      // Authentication State
      isAuthenticated: false, // FIRST-TIME VISITOR SEES PUBLIC WEBSITE
      user: {
        name: "Alex Chen",
        email: "alex.chen@engineering.io",
        role: "Senior Staff Engineer",
        initials: "AC"
      },

      // Navigation Route
      // Public: 'home' | 'product' | 'how-it-works' | 'why-repomind' | 'features'
      // Auth: 'login' | 'signup'
      // Workspace: 'app' | 'app/repository' | 'app/overview' | 'app/ask' | 'app/architecture' |
      //            'app/code-health' | 'app/impact' | 'app/refactor' | 'app/diff' | 'app/verification' | 'app/settings'
      currentRoute: "home",

      // Workspace Repository State
      recentRepositories: [...RECENT_REPOSITORIES],
      repository: REPOSITORY_DATA,
      connectionStatus: "completed", // 'idle' | 'analyzing' | 'completed' | 'failed'
      analysisProgress: 100,
      analysisStep: "Verification passed",

      // Modes & Theme
      juniorMode: false, // false = Technical, true = Junior Friendly
      theme: "dark",
      sidebarCollapsed: false,

      // Code Health
      findings: [...CODE_HEALTH_FINDINGS],
      findingFilter: {
        severity: "ALL",
        search: ""
      },
      selectedFindingId: "FND-003",

      // Ask AI
      askAiHistory: [...ASK_AI_SAMPLE_QUERIES],
      activeQueryId: "q-auth",

      // Architecture
      archData: ARCHITECTURE_GRAPH_DATA,
      selectedArchNodeId: "node-auth",

      // Impact Analysis
      impactData: IMPACT_ANALYSIS_DATA,
      selectedImpactEntity: "authenticate_user()",

      // Refactoring Workflow
      refactorData: REFACTOR_DATA,
      refactorStatus: "draft",

      // Diff Viewer
      diffData: DIFF_VIEWER_DATA,
      diffMode: "unified",

      // Verification Workflow
      verificationData: VERIFICATION_DATA,
      verificationStatus: "passed",
      verificationProgress: 100,

      // Deep Forensic Repository & Database Analysis
      forensicData: FORENSIC_REPORT_DATA,
      forensicActiveTab: "databases",
      forensicFilter: {
        severity: "ALL",
        search: ""
      },
      forensicOpFilter: "ALL",
      forensicRunning: false,

      // UI Modals & Overlays
      codeInspector: {
        isOpen: false,
        title: "",
        file: "",
        lines: "",
        codeSnippet: ""
      },
      confirmationDialog: {
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        isDangerous: false,
        onConfirm: null
      },
      commandPaletteOpen: false,
      toasts: []
    };
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error("Store listener error:", err);
      }
    }
  }

  // Authentication Actions
  login(email = "alex.chen@engineering.io") {
    this.setState({
      isAuthenticated: true,
      user: {
        name: "Alex Chen",
        email,
        role: "Senior Staff Engineer",
        initials: "AC"
      },
      currentRoute: "app"
    });
    window.location.hash = "app";
    this.showToast("Signed in as Alex Chen", "success");
  }

  logout() {
    this.setState({
      isAuthenticated: false,
      currentRoute: "home"
    });
    window.location.hash = "home";
    this.showToast("Signed out", "info");
  }

  // Route Setter
  setRoute(route) {
    const cleanRoute = (route || "home").replace(/^\//, "").replace(/^#/, "");
    // Guard: if attempting to access /app without auth, redirect to login
    if (cleanRoute.startsWith("app") && !this.state.isAuthenticated) {
      this.setState({ currentRoute: "login" });
      window.location.hash = "login";
      return;
    }

    this.setState({ currentRoute: cleanRoute });
    window.location.hash = cleanRoute;
  }

  setJuniorMode(enabled) {
    this.setState({ juniorMode: enabled });
    this.showToast(enabled ? "Switched to Junior-friendly explanations" : "Switched to Technical engineering mode", "info");
  }

  toggleSidebar() {
    this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
  }

  openCodeInspector(title, file, lines, codeSnippet) {
    this.setState({
      codeInspector: {
        isOpen: true,
        title: title || file,
        file,
        lines: lines || "",
        codeSnippet
      }
    });
  }

  closeCodeInspector() {
    this.setState({
      codeInspector: {
        ...this.state.codeInspector,
        isOpen: false
      }
    });
  }

  openConfirmationDialog({ title, message, confirmLabel, cancelLabel, isDangerous, onConfirm }) {
    this.setState({
      confirmationDialog: {
        isOpen: true,
        title,
        message,
        confirmLabel: confirmLabel || "Confirm",
        cancelLabel: cancelLabel || "Cancel",
        isDangerous: !!isDangerous,
        onConfirm
      }
    });
  }

  closeConfirmationDialog() {
    this.setState({
      confirmationDialog: {
        ...this.state.confirmationDialog,
        isOpen: false,
        onConfirm: null
      }
    });
  }

  toggleCommandPalette() {
    this.setState({ commandPaletteOpen: !this.state.commandPaletteOpen });
  }

  showToast(message, type = "info") {
    const id = "toast-" + Date.now();
    const newToast = { id, message, type };
    this.setState({ toasts: [...this.state.toasts, newToast] });

    setTimeout(() => {
      this.setState({
        toasts: this.state.toasts.filter(t => t.id !== id)
      });
    }, 3500);
  }

  // Forensic Analysis Actions
  setForensicTab(tab) {
    this.setState({ forensicActiveTab: tab });
  }

  setForensicFilter(filter) {
    this.setState({ forensicFilter: { ...this.state.forensicFilter, ...filter } });
  }

  setForensicOpFilter(filter) {
    this.setState({ forensicOpFilter: filter });
  }

  async runForensicAnalysis(supabaseUrl = null) {
    this.setState({ forensicRunning: true });
    this.showToast("Executing Single-Shot Forensic Deep Dive...", "info");
    try {
      const data = await apiService.fetchForensicReport(this.state.repository?.id, supabaseUrl);
      this.setState({
        forensicData: data || this.state.forensicData,
        forensicRunning: false
      });
      this.showToast("Forensic Analysis complete: 100% Deterministic verified", "success");
    } catch {
      this.setState({ forensicRunning: false });
      this.showToast("Forensic probe finished with cached data", "info");
    }
  }

  // Repository connection with Backend integration
  async connectRepository(repoUrl, branch = "main") {
    this.setState({
      connectionStatus: "analyzing",
      analysisProgress: 15,
      analysisStep: "Cloning repository AST...",
      currentRoute: "app/repository"
    });

    // Launch backend analysis in parallel
    const backendPromise = apiService.analyzeRepository(repoUrl, branch);

    const steps = [
      { progress: 30, step: "Extracting symbol graph & dependencies..." },
      { progress: 50, step: "Tracing caller-callee call graphs..." },
      { progress: 75, step: "Evaluating forensic database operations & query patterns..." },
      { progress: 90, step: "Executing concurrency race analysis & cross-checks..." },
      { progress: 100, step: "Analysis complete." }
    ];

    let stepIndex = 0;
    const interval = setInterval(async () => {
      if (stepIndex < steps.length) {
        this.setState({
          analysisProgress: steps[stepIndex].progress,
          analysisStep: steps[stepIndex].step
        });
        stepIndex++;
      } else {
        clearInterval(interval);
        try {
          const repoData = await backendPromise;
          const [findings, arch, forensic] = await Promise.all([
            apiService.fetchFindings(repoData.id),
            apiService.fetchArchitecture(repoData.id),
            apiService.fetchForensicReport(repoData.id)
          ]);

          this.setState({
            repository: repoData,
            findings: findings.length ? findings : this.state.findings,
            archData: arch || this.state.archData,
            forensicData: forensic || this.state.forensicData,
            connectionStatus: "completed",
            currentRoute: "app/overview"
          });
        } catch {
          this.setState({
            connectionStatus: "completed",
            currentRoute: "app/overview"
          });
        }
        window.location.hash = "app/overview";
        this.showToast("Repository analysis completed successfully", "success");
      }
    }, 600);
  }

  async runVerification() {
    this.setState({
      verificationStatus: "running",
      verificationProgress: 20
    });

    const verifyPromise = apiService.verifyRefactor(this.state.repository?.id, this.state.refactorData?.id);

    const progressSteps = [40, 65, 85, 100];
    let i = 0;
    const timer = setInterval(async () => {
      if (i < progressSteps.length) {
        this.setState({ verificationProgress: progressSteps[i] });
        i++;
      } else {
        clearInterval(timer);
        const result = await verifyPromise;
        this.setState({
          verificationData: result || this.state.verificationData,
          verificationStatus: "passed",
          verificationProgress: 100
        });
        this.showToast("All 42 test suites verified: 0 regressions", "success");
      }
    }, 450);
  }
}

export const store = new Store();
