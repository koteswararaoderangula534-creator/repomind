/**
 * Repository Connection Component (/app/repository)
 * Minimal, clean repository connection screen matching Section 15:
 * GitHub Repository URL [ https://github.com/... ]
 * Branch [ main ]
 * Analyze Repository action.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderRepositoryConnection(state) {
  const isAnalyzing = state.connectionStatus === "analyzing";
  const progress = state.analysisProgress;
  const currentStep = state.analysisStep;
  const repo = state.repository;

  return `
    <div class="workspace-content" style="max-width: 820px; padding-top: var(--space-6);">
      <!-- Back Link to Workspace Home -->
      <div style="margin-bottom: var(--space-4);">
        <a href="#app" id="back-to-home-link" class="btn btn-ghost btn-xs" style="padding: 2px 6px; text-decoration: none;">
          ${Icons.ArrowRight ? `<span style="transform: rotate(180deg); display: inline-flex;">${Icons.ArrowRight(11)}</span>` : "←"}
          <span>Back to All Repositories</span>
        </a>
      </div>

      <div style="margin-bottom: var(--space-5);">
        <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: var(--text-primary); margin-bottom: 4px;">
          Analyze Repository
        </h1>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
          Connect a GitHub repository to extract AST structure, map service dependencies, and detect engineering risks.
        </p>
      </div>

      <!-- Clean Repository Connection Panel -->
      <div class="panel" style="margin-bottom: var(--space-5);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Repository(14)}
            <span>Repository Ingress</span>
          </div>
          <span class="badge badge-outline">Public or Authenticated</span>
        </div>

        <div class="panel-body">
          <form id="repo-connect-form" onsubmit="return false;">
            <!-- GitHub Repository URL -->
            <div class="form-group">
              <label class="form-label" for="repo-url-input">GitHub Repository URL</label>
              <input 
                type="url" 
                id="repo-url-input" 
                class="input-text" 
                placeholder="https://github.com/example/project"
                value="${repo ? repo.url : 'https://github.com/university-sys/student-management-system'}"
                ${isAnalyzing ? 'disabled' : ''}
                required
              />
            </div>

            <!-- Branch -->
            <div class="form-group">
              <label class="form-label" for="repo-branch-input">Branch</label>
              <input 
                type="text" 
                id="repo-branch-input" 
                class="input-text" 
                placeholder="main"
                value="${repo ? repo.branch : 'main'}"
                ${isAnalyzing ? 'disabled' : ''}
                required
              />
            </div>

            <!-- Primary Action Button -->
            <div style="margin-top: var(--space-4); display: flex; align-items: center; justify-content: space-between;">
              <button 
                type="submit" 
                class="btn btn-primary" 
                id="btn-analyze-repo"
                ${isAnalyzing ? 'disabled' : ''}
                style="padding: 8px 18px; font-size: 13px;"
              >
                ${isAnalyzing ? Icons.ImpactAnalysis(13) : Icons.Play(11)}
                <span>${isAnalyzing ? "Analyzing Repository..." : "Analyze Repository"}</span>
              </button>

              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
                <span>Quick demo:</span>
                <button type="button" class="btn btn-ghost btn-xs sample-repo-btn" data-url="https://github.com/university-sys/student-management-system" data-branch="main">
                  student-management-system
                </button>
              </div>
            </div>
          </form>

          ${isAnalyzing ? `
            <div style="margin-top: 20px; padding: 14px 16px; background-color: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); margin-bottom: 6px;">
                <span style="color: var(--text-primary); font-weight: 500;">${currentStep}</span>
                <span style="color: var(--brand-accent-text); font-weight: 600;">${progress}%</span>
              </div>
              <div style="width: 100%; height: 4px; background-color: var(--bg-tertiary); border-radius: 2px; overflow: hidden;">
                <div style="width: ${progress}%; height: 100%; background-color: var(--brand-accent); transition: width 0.3s ease;"></div>
              </div>
            </div>
          ` : ""}
        </div>
      </div>

      <!-- Core Workflow Reminder -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background-color: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 11px;">
        <span style="font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Engine Pipeline:</span>
        <span style="color: var(--text-secondary);">Understand → Detect → Impact → Refactor → Verify</span>
        <span class="badge badge-outline" style="font-size: 10px;">AST v2.4</span>
      </div>
    </div>
  `;
}

export function attachRepositoryConnectionEvents() {
  const form = document.getElementById("repo-connect-form");
  const inputUrl = document.getElementById("repo-url-input");
  const inputBranch = document.getElementById("repo-branch-input");
  const sampleBtns = document.querySelectorAll(".sample-repo-btn");
  const backLink = document.getElementById("back-to-home-link");

  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      store.setRoute("app");
    });
  }

  sampleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (inputUrl) inputUrl.value = btn.getAttribute("data-url");
      if (inputBranch) inputBranch.value = btn.getAttribute("data-branch") || "main";
    });
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = inputUrl ? inputUrl.value.trim() : "";
      const branch = inputBranch ? inputBranch.value.trim() : "main";
      if (url) {
        store.connectRepository(url, branch);
      }
    });
  }
}
