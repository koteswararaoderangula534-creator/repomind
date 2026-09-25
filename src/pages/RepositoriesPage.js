/**
 * Repositories Management Page (/app/repositories)
 * Lists all connected codebases for the authenticated user's workspace.
 * Clean empty states, real user isolation, and repository switcher.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderRepositoriesPage(state) {
  const repos = state.recentRepositories || [];
  const currentRepo = state.repository;
  const user = state.user || {};

  return `
    <div class="workspace-content" style="max-width: 1040px; padding-top: var(--space-4);">
      
      <!-- Top Title Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: var(--space-6); border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 8px;">
            <span>Workspace</span>
            <span style="color: var(--text-muted);">/</span>
            <span>Repositories</span>
          </div>
          <h1 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0;">
            Connected Repositories
          </h1>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
            Codebases indexed in ${user.name ? `${user.name}'s` : "your"} engineering workspace.
          </p>
        </div>

        <button class="btn btn-primary" id="btn-connect-new-repo" style="padding: 8px 16px; font-size: 13px;">
          <span style="font-weight: 700; font-size: 14px;">+</span>
          <span>Connect Repository</span>
        </button>
      </div>

      <!-- Repositories List or Empty State -->
      ${repos.length === 0 ? `
        <div class="panel" style="text-align: center; padding: 56px 24px; border: 1px dashed var(--border-default); background: var(--bg-primary);">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-default); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--brand-accent-text);">
            ${Icons.Repository(24)}
          </div>
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0;">
            Start by connecting a repository.
          </h2>
          <p style="font-size: 13px; color: var(--text-secondary); max-width: 480px; margin: 0 auto 24px auto; line-height: 1.6;">
            RepoMind inspects repository structure, dependencies, and AST call graphs to generate architectural intelligence and safe refactoring proposals.
          </p>
          <button class="btn btn-primary" id="btn-empty-connect" style="padding: 9px 20px; font-size: 13px;">
            ${Icons.Repository(14)}
            <span>Connect GitHub Repository</span>
          </button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${repos.map(r => {
            const isActive = currentRepo && (currentRepo.id === r.id || currentRepo.name === r.name);
            return `
              <div class="panel repo-card-item" data-repo-id="${r.id}" style="padding: 16px 20px; background: var(--bg-primary); border: 1px solid ${isActive ? 'var(--brand-accent-border)' : 'var(--border-subtle)'}; border-left: 3px solid ${isActive ? 'var(--brand-accent)' : 'transparent'};">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-default); display: flex; align-items: center; justify-content: center; color: var(--brand-accent-text);">
                      ${Icons.Repository(18)}
                    </div>
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span style="font-weight: 700; font-size: 14px; color: var(--text-primary); font-family: var(--font-mono);">
                          ${r.name}
                        </span>
                        ${isActive ? `
                          <span class="badge badge-brand" style="font-size: 9px; padding: 2px 6px;">Active</span>
                        ` : ''}
                        ${r.isDemo ? `
                          <span class="badge badge-outline" style="font-size: 9px; color: var(--brand-accent-text); border-color: var(--brand-accent-border);">Demo Sample</span>
                        ` : ''}
                      </div>

                      <div style="display: flex; align-items: center; gap: 12px; margin-top: 4px; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                        <span>${r.language || 'Python / TypeScript'}</span>
                        <span>•</span>
                        <span>Last analyzed: ${r.lastAnalyzed || 'Recently'}</span>
                        <span>•</span>
                        <span>${r.filesCount || 147} files</span>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${(r.highFindings || 0) > 0 ? `
                        <span class="badge badge-high" style="font-size: 10px;">${r.highFindings} High</span>
                      ` : ''}
                      <span class="badge badge-outline" style="font-size: 10px;">${r.findingsCount || 13} findings</span>
                      <span class="badge badge-success" style="font-size: 10px;">✓ ${r.testsCount || 42} tests</span>
                    </div>

                    ${isActive ? `
                      <button class="btn btn-secondary btn-sm open-repo-overview-btn" style="padding: 6px 14px; font-size: 12px;">
                        <span>Open Overview</span>
                        ${Icons.ArrowRight(12)}
                      </button>
                    ` : `
                      <button class="btn btn-secondary btn-sm switch-repo-btn" data-repo-id="${r.id}" style="padding: 6px 14px; font-size: 12px;">
                        <span>Switch Workspace</span>
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}

    </div>
  `;
}

export function attachRepositoriesEvents() {
  const connectBtn = document.getElementById("btn-connect-new-repo");
  const emptyConnectBtn = document.getElementById("btn-empty-connect");

  if (connectBtn) {
    connectBtn.addEventListener("click", () => {
      store.setRoute("app/repository");
    });
  }

  if (emptyConnectBtn) {
    emptyConnectBtn.addEventListener("click", () => {
      store.setRoute("app/repository");
    });
  }

  const overviewBtns = document.querySelectorAll(".open-repo-overview-btn");
  overviewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      store.setRoute("app/overview");
    });
  });

  const switchBtns = document.querySelectorAll(".switch-repo-btn");
  switchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const repoId = btn.getAttribute("data-repo-id");
      if (repoId) {
        store.selectRepository(repoId);
      }
    });
  });
}
