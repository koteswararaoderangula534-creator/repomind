/**
 * RepoMind Sidebar Component
 * Streamlined, developer-focused navigation for engineering workflows.
 * Supports clean workspace routing (Section 13).
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderSidebar(state) {
  const currentRoute = state.currentRoute;
  const isCollapsed = state.sidebarCollapsed;
  const findingsCount = state.findings.length;
  const testsPassed = state.verificationData.passedCount;

  // Normalized route matching
  const isMatch = (target) => {
    return currentRoute === target || currentRoute === target.replace("app/", "");
  };

  const navItems = [
    { id: "app/overview", label: "Overview", icon: Icons.Overview(15) },
    { id: "app/repository", label: "Repository", icon: Icons.Repository(15) },
    { id: "app/ask", label: "Ask AI", icon: Icons.AskAI(15) },
    { id: "app/architecture", label: "Architecture", icon: Icons.Architecture(15) },
    { id: "app/forensic", label: "Forensic Analysis", icon: Icons.ForensicAnalysis(15), badge: "Deep", isAlert: false },
    { id: "app/code-health", label: "Code Health", icon: Icons.CodeHealth(15), badge: findingsCount, isAlert: findingsCount > 0 },
    { id: "app/impact", label: "Impact Analysis", icon: Icons.ImpactAnalysis(15) },
    { id: "app/refactor", label: "Refactor", icon: Icons.Refactor(15) },
    { id: "app/diff", label: "Diff Viewer", icon: Icons.DiffViewer(15) },
    { id: "app/verification", label: "Verification", icon: Icons.Verification(15), badge: `${testsPassed} passed`, isAlert: false }
  ];

  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" role="navigation" aria-label="Main Navigation">
      <div class="sidebar-nav">
        <!-- Return to Workspace Home (All Repositories) -->
        <a 
          href="#app" 
          class="nav-item ${currentRoute === 'app' ? 'active' : ''}" 
          data-route="app"
          title="All Repositories"
          style="margin-bottom: 6px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;"
        >
          <span class="nav-item-icon" style="color: var(--brand-accent-text);">
            ${Icons.Repository(14)}
          </span>
          <span class="nav-item-text" style="font-weight: 600;">All Repositories</span>
        </a>

        <div class="sidebar-section-title">Workflow</div>
        ${navItems.map(item => `
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
      </div>

      <div class="sidebar-footer">
        <a 
          href="#app/settings" 
          class="nav-item ${isMatch('app/settings') ? 'active' : ''}" 
          data-route="app/settings"
          title="Settings"
        >
          <span class="nav-item-icon">${Icons.Settings(15)}</span>
          <span class="nav-item-text">Settings</span>
        </a>
        <a 
          href="#help" 
          class="nav-item" 
          id="sidebar-help-link"
          title="Engineering Documentation & Guidelines"
        >
          <span class="nav-item-icon">${Icons.Help(15)}</span>
          <span class="nav-item-text">Help & Docs</span>
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
        `# RepoMind: Engineering Intelligence Workflow

RepoMind turns unfamiliar codebases into structured engineering workflows:
1. UNDERSTAND: AST parsing, architectural layering, and symbol extraction.
2. DETECT: Security vulnerabilities, structural debt, and anti-patterns.
3. IMPACT: Call graph dependency tracing to measure change blast radius.
4. REFACTOR: Evidence-backed decomposition adhering to SRP and clean design.
5. DIFF: High-density unified and side-by-side verification review.
6. VERIFY: Regression test suite execution before changes touch disk.
7. HUMAN APPROVAL: Explicit developer approval with full audit trail.`
      );
    });
  }
}
