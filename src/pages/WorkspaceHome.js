/**
 * Workspace Home Component (/app)
 * First screen after login. Calm, uncluttered developer home:
 * "Welcome back. Analyze a repository to get started."
 * Primary action: "+ Analyze Repository"
 * Recent Repositories list.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderWorkspaceHome(state) {
  const user = state.user || { name: "Alex Chen" };
  const recentRepos = state.recentRepositories || [];

  return `
    <div class="workspace-content" style="max-width: 960px; padding-top: var(--space-8);">
      <!-- Calm Welcome Header -->
      <div class="workspace-home-header">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 12px;">
          <span>RepoMind Workspace</span>
          <span style="color: var(--text-muted);">/</span>
          <span>Home</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <h1 class="workspace-welcome-title">Welcome back, ${user.name.split(" ")[0]}.</h1>
            <p class="workspace-welcome-sub">Analyze a repository to get started or resume a previous engineering session.</p>
          </div>

          <button class="btn btn-primary" id="home-analyze-new-btn" style="padding: 8px 16px; font-size: 13px;">
            <span style="font-weight: 700; font-size: 14px;">+</span>
            <span>Analyze Repository</span>
          </button>
        </div>
      </div>

      <!-- Recent Repositories Section -->
      <div class="panel" style="margin-bottom: var(--space-6);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Repository(14)}
            <span>Recent Repositories</span>
          </div>
          <span class="badge badge-outline">${recentRepos.length} Connected</span>
        </div>

        <div class="panel-body no-padding">
          <div class="recent-repos-list">
            ${recentRepos.map(repo => `
              <div class="recent-repo-item open-repo-item" data-repo-id="${repo.id}" data-repo-name="${repo.name}">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-default); display: flex; align-items: center; justify-content: center; color: var(--brand-accent-text);">
                    ${Icons.Repository(16)}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 600; font-size: 13px; color: var(--text-primary); font-family: var(--font-mono);">
                        ${repo.name}
                      </span>
                      ${repo.isCurrent ? `<span class="badge badge-info" style="font-size: 9px;">Active</span>` : ""}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 10px; margin-top: 2px;">
                      <span>${repo.language}</span>
                      <span>•</span>
                      <span>Analyzed ${repo.lastAnalyzed}</span>
                      <span>•</span>
                      <span>${repo.filesCount} files</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    ${repo.highFindings > 0 ? `
                      <span class="badge badge-high" style="font-size: 10px;">${repo.highFindings} High</span>
                    ` : ""}
                    <span class="badge badge-outline" style="font-size: 10px;">${repo.findingsCount} findings</span>
                    <span class="badge badge-success" style="font-size: 10px;">✓ ${repo.testsCount} tests</span>
                  </div>

                  <button class="btn btn-secondary btn-xs open-repo-btn" data-repo-id="${repo.id}">
                    <span>Open Workspace</span>
                    ${Icons.ArrowRight(11)}
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Quick Guidance & Workflow Reminder -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
        <div style="padding: var(--space-4); background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--brand-accent-text); margin-bottom: 4px;">STEP 1</div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">Connect & Ingress</div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">Provide a GitHub repository URL and branch to extract AST topology.</div>
        </div>

        <div style="padding: var(--space-4); background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--color-medium); margin-bottom: 4px;">STEP 2</div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">Diagnose & Measure</div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">Review code smells, security items, and caller blast radius.</div>
        </div>

        <div style="padding: var(--space-4); background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--color-success-light); margin-bottom: 4px;">STEP 3</div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">Refactor & Verify</div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">Inspect generated diffs and run regression tests before human approval.</div>
        </div>
      </div>
    </div>
  `;
}

export function attachWorkspaceHomeEvents() {
  const newRepoBtn = document.getElementById("home-analyze-new-btn");
  const repoItems = document.querySelectorAll(".open-repo-item, .open-repo-btn");

  if (newRepoBtn) {
    newRepoBtn.addEventListener("click", () => {
      store.setRoute("app/repository");
    });
  }

  repoItems.forEach(item => {
    item.addEventListener("click", (e) => {
      // If clicking child button or parent card
      const repoId = item.getAttribute("data-repo-id");
      store.setRoute("app/overview");
      store.showToast("Loaded repository: university-sys/student-management-system", "info");
    });
  });
}
