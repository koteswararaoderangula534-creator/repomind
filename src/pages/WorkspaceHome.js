/**
 * Workspace Home Component (/app)
 * First screen after login. Calm, uncluttered developer home:
 * "Welcome back. Analyze a repository to get started."
 * Primary action: "+ Analyze Repository"
 * Real user isolation and clean empty states.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderWorkspaceHome(state) {
  const user = state.user || { name: "Developer" };
  const recentRepos = state.recentRepositories || [];

  return `
    <div class="workspace-content" style="max-width: 960px; padding-top: var(--space-6);">
      <!-- Calm Welcome Header -->
      <div class="workspace-home-header" style="margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 12px;">
          <span>RepoMind Workspace</span>
          <span style="color: var(--text-muted);">/</span>
          <span>Home</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <h1 class="workspace-welcome-title" style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">
              Welcome back, ${(user.name || "Developer").split(" ")[0]}.
            </h1>
            <p class="workspace-welcome-sub" style="font-size: 13px; color: var(--text-secondary); margin: 0;">
              Analyze a repository to begin or select a connected codebase below.
            </p>
          </div>

          <button class="btn btn-primary" id="home-analyze-new-btn" style="padding: 8px 16px; font-size: 13px;">
            <span style="font-weight: 700; font-size: 14px;">+</span>
            <span>Analyze Repository</span>
          </button>
        </div>
      </div>

      <!-- Recent Repositories Section -->
      ${recentRepos.length === 0 ? `
        <div class="panel" style="margin-bottom: var(--space-6); text-align: center; padding: 48px 20px; background: var(--bg-primary); border: 1px dashed var(--border-default);">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-default); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px; color: var(--brand-accent-text);">
            ${Icons.Repository(22)}
          </div>
          <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">
            Start by connecting a repository.
          </h2>
          <p style="font-size: 13px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 20px auto; line-height: 1.5;">
            Your engineering workspace is ready. Connect a GitHub repository to understand its architecture, identify risks, and explore AI insights.
          </p>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-home-empty-connect" style="padding: 8px 18px; font-size: 13px;">
              ${Icons.Repository(14)}
              <span>Connect GitHub Repository</span>
            </button>
            <button class="btn btn-secondary" id="btn-home-empty-demo" style="padding: 8px 16px; font-size: 13px;">
              <span>Try Demo Repository</span>
            </button>
          </div>
        </div>
      ` : `
        <div class="panel" style="margin-bottom: var(--space-6); background: var(--bg-primary);">
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
                <div class="recent-repo-item open-repo-item" data-repo-id="${repo.id}" data-repo-name="${repo.name}" style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); cursor: pointer;">
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
                        ${repo.isDemo ? `<span class="badge badge-outline" style="font-size: 9px; color: var(--brand-accent-text);">Demo</span>` : ""}
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 10px; margin-top: 2px;">
                        <span>${repo.language || 'Python / TypeScript'}</span>
                        <span>•</span>
                        <span>Analyzed ${repo.lastAnalyzed || 'Recently'}</span>
                        <span>•</span>
                        <span>${repo.filesCount || 147} files</span>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${(repo.highFindings || 0) > 0 ? `
                        <span class="badge badge-high" style="font-size: 10px;">${repo.highFindings} High</span>
                      ` : ""}
                      <span class="badge badge-outline" style="font-size: 10px;">${repo.findingsCount || 13} findings</span>
                      <span class="badge badge-success" style="font-size: 10px;">✓ ${repo.testsCount || 42} tests</span>
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
      `}

      <!-- Quick Guidance & Workflow Reminder -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
        <div style="padding: var(--space-4); background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--brand-accent-text); margin-bottom: 4px;">STEP 1</div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">Connect & Ingress</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">Provide a GitHub repository URL and branch to extract AST topology.</div>
        </div>

        <div style="padding: var(--space-4); background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--brand-accent-text); margin-bottom: 4px;">STEP 2</div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">Inspect Hazards</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">Evaluate concurrency race conditions and query truncation before refactoring.</div>
        </div>

        <div style="padding: var(--space-4); background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--brand-accent-text); margin-bottom: 4px;">STEP 3</div>
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-bottom: 2px;">Verify Changes</div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">Review side-by-side diffs and run automated regression verification suites.</div>
        </div>
      </div>
    </div>
  `;
}

export function attachWorkspaceHomeEvents() {
  const newBtn = document.getElementById("home-analyze-new-btn");
  const emptyConnectBtn = document.getElementById("btn-home-empty-connect");
  const emptyDemoBtn = document.getElementById("btn-home-empty-demo");
  const repoItems = document.querySelectorAll(".open-repo-item");

  if (newBtn) {
    newBtn.addEventListener("click", () => {
      store.setRoute("app/repository");
    });
  }

  if (emptyConnectBtn) {
    emptyConnectBtn.addEventListener("click", () => {
      store.setRoute("app/repository");
    });
  }

  if (emptyDemoBtn) {
    emptyDemoBtn.addEventListener("click", () => {
      store.exploreDemo();
    });
  }

  repoItems.forEach(item => {
    item.addEventListener("click", () => {
      const repoId = item.getAttribute("data-repo-id");
      const repoName = item.getAttribute("data-repo-name");
      if (repoId) {
        store.selectRepository(repoId);
      } else {
        store.setRoute("app/overview");
      }
      if (repoName) {
        store.showToast(`Loaded repository: ${repoName}`, "info");
      }
    });
  });
}
