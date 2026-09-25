/**
 * RepoMind Sidebar Component
 * IDE-class engineering platform navigation matching Section 14:
 * REPOSITORY -> Overview, Repositories, Ask AI, Architecture
 * ANALYSIS -> Forensic Analysis, Code Health, Impact Analysis
 * IMPROVEMENT -> Refactor Studio, Diff Viewer
 * VERIFICATION -> Verification
 * ACCOUNT -> Settings
 * Footer -> User avatar, user email, Sign out
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderSidebar(state) {
  const currentRoute = state.currentRoute;
  const isCollapsed = state.sidebarCollapsed;
  const findingsCount = state.findings.length;
  const testsPassed = state.verificationData?.passedCount || 42;
  const user = state.user || { name: "Developer", email: "user@repomind.io", initials: "DV" };

  const isMatch = (target) => {
    return currentRoute === target || currentRoute === target.replace("app/", "");
  };

  const sections = [
    {
      title: "REPOSITORY",
      items: [
        { id: "app/overview", label: "Overview", icon: Icons.Overview(14) },
        { id: "app/repositories", label: "Repositories", icon: Icons.Repository(14) },
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
      title: "IMPROVEMENT",
      items: [
        { id: "app/refactor", label: "Refactor Studio", icon: Icons.Refactor(14) },
        { id: "app/diff", label: "Diff Viewer", icon: Icons.DiffViewer(14) },
      ]
    },
    {
      title: "VERIFICATION",
      items: [
        { id: "app/verification", label: "Verification", icon: Icons.Verification(14), badge: `${testsPassed} passed` },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { id: "app/settings", label: "Settings", icon: Icons.Settings(14) },
      ]
    }
  ];

  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" role="navigation" aria-label="Main Navigation">
      <div class="sidebar-nav">
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

      <!-- Authenticated User Profile & Sign Out Footer -->
      <div class="sidebar-footer" style="padding: 10px 12px; border-top: 1px solid var(--border-subtle); background: var(--bg-primary);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--brand-accent); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${user.initials || "DV"}
            </div>
            <div style="min-width: 0; line-height: 1.2;">
              <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${user.name || "Developer"}
              </div>
              <div style="font-size: 10px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--font-mono);">
                ${user.email || ""}
              </div>
            </div>
          </div>

          <button class="btn btn-ghost btn-xs" id="sidebar-signout-btn" title="Sign out" style="padding: 4px; color: var(--text-muted);">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
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

  const signoutBtn = document.getElementById("sidebar-signout-btn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      store.logout();
    });
  }
}
