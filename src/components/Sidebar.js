/**
 * RepoMind Sidebar Component
 * IDE-class engineering platform navigation matching Section 11:
 * REPOSITORY -> Overview, Ask AI, Architecture
 * ANALYSIS -> Forensic Analysis, Code Health, Impact Analysis
 * IMPROVE -> Refactor Studio, Diff Viewer
 * VERIFY -> Verification
 * SYSTEM -> Settings, Help & Docs
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderSidebar(state) {
  const currentRoute = state.currentRoute;
  const isCollapsed = state.sidebarCollapsed;
  const findingsCount = state.findings.length;
  const testsPassed = state.verificationData.passedCount;

  const isMatch = (target) => {
    return currentRoute === target || currentRoute === target.replace("app/", "");
  };

  const sections = [
    {
      title: "REPOSITORY",
      items: [
        { id: "app/overview", label: "Overview", icon: Icons.Overview(14) },
        { id: "app/ask", label: "Ask AI", icon: Icons.AskAI(14), badge: "AI" },
        { id: "app/architecture", label: "Architecture", icon: Icons.Architecture(14) },
      ]
    },
    {
      title: "ANALYSIS",
      items: [
        { id: "app/forensic", label: "Forensic Analysis", icon: Icons.ForensicAnalysis(14), badge: "Deep" },
        { id: "app/code-health", label: "Code Health", icon: Icons.CodeHealth(14), badge: findingsCount, isAlert: findingsCount > 0 },
        { id: "app/impact", label: "Impact Analysis", icon: Icons.ImpactAnalysis(14) },
      ]
    },
    {
      title: "IMPROVE",
      items: [
        { id: "app/refactor", label: "Refactor Studio", icon: Icons.Refactor(14) },
        { id: "app/diff", label: "Diff Viewer", icon: Icons.DiffViewer(14) },
      ]
    },
    {
      title: "VERIFY",
      items: [
        { id: "app/verification", label: "Verification", icon: Icons.Verification(14), badge: `${testsPassed} passed` },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: "app/settings", label: "Settings", icon: Icons.Settings(14) },
      ]
    }
  ];

  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" role="navigation" aria-label="Main Navigation">
      <div class="sidebar-nav">
        <!-- Switch Repository Context -->
        <a 
          href="#app" 
          class="nav-item ${currentRoute === 'app' ? 'active' : ''}" 
          data-route="app"
          title="All Repositories"
          style="margin-bottom: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;"
        >
          <span class="nav-item-icon" style="color: var(--brand-accent-text);">
            ${Icons.Repository(14)}
          </span>
          <span class="nav-item-text" style="font-weight: 600;">All Repositories</span>
        </a>

        ${sections.map(sec => `
          <div class="sidebar-section-title" style="margin-top: 10px; margin-bottom: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.6px; color: var(--text-muted); text-transform: uppercase;">
            ${sec.title}
          </div>
          ${sec.items.map(item => `
            <a 
              href="#${item.id}" 
              class="nav-item ${isMatch(item.id) ? 'active' : ''}" 
              data-route="${item.id}"
              title="${item.label}"
            >
              <span class="nav-item-icon">${item.icon}</span>
              <span class="nav-item-text">${item.label}</span>
              ${item.badge !== undefined ? `
                <span class="nav-item-badge ${item.isAlert ? 'alert' : ''}">${item.badge}</span>
              ` : ""}
            </a>
          `).join("")}
        `).join("")}
      </div>

      <div class="sidebar-footer">
        <a 
          href="#help" 
          class="nav-item" 
          id="sidebar-help-link"
          title="Engineering Documentation & Guidelines"
        >
          <span class="nav-item-icon">${Icons.Help(14)}</span>
          <span class="nav-item-text">Docs & Workflow</span>
        </a>
      </div>
    </aside>
  `;
}

export function attachSidebarEvents() {
  const navLinks = document.querySelectorAll(".sidebar .nav-item[data-route]");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const route = link.getAttribute("data-route");
      if (route) {
        store.setRoute(route);
        window.location.hash = route;
      }
    });
  });

  const helpLink = document.getElementById("sidebar-help-link");
  if (helpLink) {
    helpLink.addEventListener("click", (e) => {
      e.preventDefault();
      store.openCodeInspector(
        "RepoMind Engineering Philosophy",
        "PHILOSOPHY.md",
        "1-30",
        `# RepoMind: Autonomous Codebase Understanding & Safe Refactoring

Core Promise:
"Understand your codebase. Refactor it safely."

Continuous Engineering Workflow:
1. UNDERSTAND: AST parsing, architectural topology, and symbol dependencies.
2. DETECT: Concurrency hazards, historical data truncation, security and quality smells.
3. IMPACT: Caller-callee call graph tracing to evaluate blast radius before changes.
4. REFACTOR: Evidence-backed decomposition adhering to SRP and clean design.
5. DIFF: Unified and split diff review with explicit human approval.
6. VERIFY: Automated test suites verify 0 regressions before committing.
`
      );
    });
  }
}
