/**
 * Settings Page
 * Configuration for GitHub credentials, verification runner preferences, and explanation mode.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderSettingsPage(state) {
  const isJunior = state.juniorMode;

  return `
    <div class="workspace-content" style="max-width: 800px;">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.Settings(18)}
            <span>Engine & Workspace Settings</span>
          </h1>
          <p class="page-subtitle">
            Configure repository analysis engine, GitHub authentication tokens, and explanation modes.
          </p>
        </div>
      </div>

      <!-- Explanation Mode Settings -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Info(13)}
            <span>Explanation Complexity (Junior Mode)</span>
          </div>
        </div>

        <div class="panel-body">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Junior-Friendly Explanations</div>
              <div style="font-size: 11px; color: var(--text-secondary); max-width: 500px; margin-top: 2px;">
                Translates AST and architectural terms into accessible, intuitive analogies across Ask AI, Code Health, Refactor, and Verification.
              </div>
            </div>

            <div class="mode-toggle-container">
              <button class="mode-toggle-btn ${!isJunior ? 'active' : ''}" id="settings-tech-btn">Technical</button>
              <button class="mode-toggle-btn ${isJunior ? 'active' : ''}" id="settings-junior-btn">Junior Friendly</button>
            </div>
          </div>
        </div>
      </div>

      <!-- GitHub Credentials -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Repository(13)}
            <span>GitHub Authentication</span>
          </div>
          <span class="badge badge-success">Connected</span>
        </div>

        <div class="panel-body">
          <div class="form-group">
            <label class="form-label" for="settings-gh-token">Personal Access Token (read:packages, repo)</label>
            <input 
              type="password" 
              id="settings-gh-token" 
              class="input-text" 
              value="ghp_914872bcae9182371982739182738912"
              placeholder="ghp_..."
            />
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Used strictly for AST parsing, reading private repository commits, and creating verified pull requests.
            </span>
          </div>
        </div>

        <div class="panel-footer" style="justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" id="btn-save-token">
            <span>Update Token</span>
          </button>
        </div>
      </div>

      <!-- Test Verification Runner Command -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Verification(13)}
            <span>Verification Test Engine</span>
          </div>
        </div>

        <div class="panel-body">
          <div class="form-group">
            <label class="form-label" for="settings-test-cmd">Verification Command</label>
            <input 
              type="text" 
              id="settings-test-cmd" 
              class="input-text" 
              value="pytest -v --cov=services --cov=api tests/"
            />
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Executed inside the isolated sandbox to prove behavioral equivalence before applying diffs.
            </span>
          </div>
        </div>
      </div>

      <!-- Reset Cache -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.AlertTriangle(13)}
            <span>Diagnostics Cache</span>
          </div>
        </div>

        <div class="panel-body" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Clear AST & Call Graph Cache</div>
            <div style="font-size: 11px; color: var(--text-secondary);">
              Purges local index for <code>university-sys/student-management-system</code> and forces fresh analysis on next run.
            </div>
          </div>

          <button class="btn btn-danger btn-sm" id="btn-clear-cache">
            <span>Purge Cache</span>
          </button>
        </div>
      </div>

    </div>
  `;
}

export function attachSettingsEvents() {
  const techBtn = document.getElementById("settings-tech-btn");
  const juniorBtn = document.getElementById("settings-junior-btn");
  const saveTokenBtn = document.getElementById("btn-save-token");
  const clearCacheBtn = document.getElementById("btn-clear-cache");

  if (techBtn) {
    techBtn.addEventListener("click", () => store.setJuniorMode(false));
  }
  if (juniorBtn) {
    juniorBtn.addEventListener("click", () => store.setJuniorMode(true));
  }
  if (saveTokenBtn) {
    saveTokenBtn.addEventListener("click", () => {
      store.showToast("GitHub token saved successfully", "success");
    });
  }
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", () => {
      store.openConfirmationDialog({
        title: "Purge Repository Cache?",
        message: "This will reset all cached AST and impact graphs. Repository will be re-analyzed on next visit.",
        confirmLabel: "Purge Cache",
        isDangerous: true,
        onConfirm: () => {
          store.showToast("Cache purged successfully", "info");
        }
      });
    });
  }
}
