/**
 * RepoMind Topbar Component
 * Professional developer tool header: Brand wordmark, repository context,
 * command palette launcher, Junior/Technical mode toggle, and User profile/Sign Out.
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderTopbar(state) {
  const isJunior = state.juniorMode;
  const repo = state.repository;
  const user = state.user || { name: "Alex Chen", initials: "AC" };

  return `
    <header class="topbar" role="banner">
      <div class="topbar-left">
        <a href="#app" class="brand" title="RepoMind Workspace Home">
          <div class="brand-icon">
            ${Icons.Logo(16)}
          </div>
          <span class="brand-name">RepoMind</span>
        </a>

        <div class="brand-divider"></div>

        <div class="repo-breadcrumb">
          <a href="#app" style="color: var(--text-secondary); text-decoration: none; display: flex; align-items: center; gap: 4px;" title="View all repositories">
            <span>Repositories</span>
          </a>
          <span style="color: var(--border-default);">/</span>
          <span class="repo-breadcrumb-name">${repo ? repo.name : "Select Repository"}</span>
          ${repo ? `
            <span class="repo-breadcrumb-branch" title="Active Branch">
              ${Icons.Branch(10)}
              ${repo.branch}
            </span>
          ` : ""}
        </div>
      </div>

      <div class="topbar-center">
        <button class="cmd-k-search" id="cmd-k-trigger" type="button" aria-label="Open command palette (Ctrl+K)">
          ${Icons.Search(13)}
          <span>Jump to file, finding, or tool...</span>
          <span class="kbd-shortcut">Ctrl K</span>
        </button>
      </div>

      <div class="topbar-right">
        <!-- Junior / Technical Mode Toggle -->
        <div class="mode-toggle-container" role="radiogroup" aria-label="Explanation Complexity Mode">
          <button 
            type="button" 
            class="mode-toggle-btn ${!isJunior ? 'active' : ''}" 
            id="toggle-mode-technical"
            title="Senior developer mode with technical architecture terms"
          >
            Technical
          </button>
          <button 
            type="button" 
            class="mode-toggle-btn ${isJunior ? 'active' : ''}" 
            id="toggle-mode-junior"
            title="Junior-friendly mode with plain-English analogies"
          >
            Junior Friendly
          </button>
        </div>

        <button class="btn btn-secondary btn-sm" id="topbar-refresh-btn" title="Re-run Diagnostics">
          ${Icons.ImpactAnalysis(13)}
          <span>Re-Analyze</span>
        </button>

        <button class="btn btn-ghost btn-icon" id="topbar-settings-btn" title="Settings" aria-label="Settings">
          ${Icons.Settings(15)}
        </button>

        <!-- User Profile & Sign Out -->
        <div style="display: flex; align-items: center; gap: 8px; margin-left: 4px; padding-left: 8px; border-left: 1px solid var(--border-subtle);">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border-default); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--brand-accent-text);" title="${user.name} (${user.email})">
            ${user.initials || "AC"}
          </div>
          <button class="btn btn-ghost btn-xs" id="topbar-signout-btn" title="Sign out to public website" style="color: var(--text-muted);">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  `;
}

export function attachTopbarEvents() {
  const btnTech = document.getElementById("toggle-mode-technical");
  const btnJunior = document.getElementById("toggle-mode-junior");
  const cmdTrigger = document.getElementById("cmd-k-trigger");
  const refreshBtn = document.getElementById("topbar-refresh-btn");
  const settingsBtn = document.getElementById("topbar-settings-btn");
  const signoutBtn = document.getElementById("topbar-signout-btn");

  if (btnTech) {
    btnTech.addEventListener("click", () => store.setJuniorMode(false));
  }
  if (btnJunior) {
    btnJunior.addEventListener("click", () => store.setJuniorMode(true));
  }
  if (cmdTrigger) {
    cmdTrigger.addEventListener("click", () => store.toggleCommandPalette());
  }
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      store.connectRepository(store.getState().repository.url);
    });
  }
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => store.setRoute("app/settings"));
  }
  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      store.logout();
    });
  }
}
