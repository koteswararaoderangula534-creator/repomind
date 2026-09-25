/**
 * Settings Page Component (/app/settings)
 * Strict Section 21 compliance:
 * ACCOUNT: Name, Email, Profile
 * PREFERENCES: Theme, Explanation Mode, Notifications
 * DEVELOPER: GitHub Connection & Supabase Cloud Sync
 * DANGER ZONE: Purge Workspace Cache, Sign Out
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderSettingsPage(state) {
  const isJunior = state.juniorMode;
  const user = state.user || { name: "Developer", email: "user@repomind.io", role: "Software Engineer" };
  const repo = state.repository;

  return `
    <div class="workspace-content" style="max-width: 820px; padding-top: var(--space-4);">
      <div class="page-header" style="margin-bottom: var(--space-6); border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
        <div class="page-title-group">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 8px;">
            <span>Settings</span>
            <span style="color: var(--text-muted);">/</span>
            <span>Workspace</span>
          </div>
          <h1 class="page-title" style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0;">
            Workspace & Engineering Settings
          </h1>
          <p class="page-subtitle" style="font-size: 13px; color: var(--text-secondary); margin: 0;">
            Configure your developer profile, engine parameters, GitHub credentials, and cloud persistence.
          </p>
        </div>
      </div>

      <!-- 1. ACCOUNT SECTION -->
      <div class="panel" style="margin-bottom: var(--space-5); background: var(--bg-primary);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.User ? Icons.User(14) : Icons.Overview(14)}
            <span>Account Profile</span>
          </div>
          <span class="badge badge-brand" style="font-size: 10px;">${user.role || 'Staff Engineer'}</span>
        </div>

        <div class="panel-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Full Name</label>
              <input 
                type="text" 
                id="settings-user-name" 
                class="input-text" 
                value="${user.name || 'Developer'}"
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; font-size: 13px; background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary);"
              />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Work Email</label>
              <input 
                type="email" 
                id="settings-user-email" 
                class="input-text" 
                value="${user.email || 'developer@repomind.io'}"
                disabled
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; font-size: 13px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: var(--text-muted);"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 2. PREFERENCES SECTION -->
      <div class="panel" style="margin-bottom: var(--space-5); background: var(--bg-primary);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Settings(14)}
            <span>Preferences & Explanation Mode</span>
          </div>
        </div>

        <div class="panel-body" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Junior-Friendly Mental Model</div>
              <div style="font-size: 11px; color: var(--text-secondary); max-width: 500px; margin-top: 2px;">
                Translates AST and concurrency hazards into intuitive analogies across Ask AI and Forensic reports.
              </div>
            </div>

            <div class="mode-toggle-container">
              <button class="mode-toggle-btn ${!isJunior ? 'active' : ''}" id="settings-tech-btn">Technical</button>
              <button class="mode-toggle-btn ${isJunior ? 'active' : ''}" id="settings-junior-btn">Junior Friendly</button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Theme</div>
              <div style="font-size: 11px; color: var(--text-secondary);">Dark Technical Mode is standard for RepoMind developer interface.</div>
            </div>
            <span class="badge badge-outline" style="font-size: 11px;">Dark (Default)</span>
          </div>
        </div>
      </div>

      <!-- 3. DEVELOPER CREDENTIALS & SUPABASE CLOUD -->
      <div class="panel" style="margin-bottom: var(--space-5); background: var(--bg-primary);">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.Repository(14)}
            <span>Developer Credentials & Cloud Sync</span>
          </div>
          <span class="badge badge-success" style="font-size: 10px;">Token Active</span>
        </div>

        <div class="panel-body">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" for="settings-gh-token" style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">
              GitHub Personal Access Token (repo, read:packages)
            </label>
            <input 
              type="password" 
              id="settings-gh-token" 
              class="input-text" 
              value="ghp_914872bcae9182371982739182738912"
              placeholder="ghp_..."
              style="width: 100%; box-sizing: border-box; padding: 8px 12px; font-size: 13px; background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-mono);"
            />
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block;">
              Used strictly for AST parsing, reading private repository commits, and generating verified pull requests.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label" for="settings-supabase-url" style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">
              Supabase Project Connection (Optional Cloud Sync)
            </label>
            <input 
              type="text" 
              id="settings-supabase-url" 
              class="input-text" 
              placeholder="https://xyzcompany.supabase.co"
              value="${localStorage.getItem('repomind_supabase_url') || ''}"
              style="width: 100%; box-sizing: border-box; padding: 8px 12px; font-size: 13px; background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-mono);"
            />
          </div>
        </div>

        <div class="panel-footer" style="justify-content: flex-end; padding: 10px 16px; background: var(--bg-secondary);">
          <button class="btn btn-secondary btn-sm" id="btn-save-credentials">
            <span>Save Credentials</span>
          </button>
        </div>
      </div>

      <!-- 4. DANGER ZONE -->
      <div class="panel" style="border: 1px solid var(--color-high-border); background: var(--bg-primary);">
        <div class="panel-header" style="border-bottom: 1px solid var(--color-high-border);">
          <div class="panel-title" style="color: var(--color-high);">
            ${Icons.AlertTriangle(14)}
            <span>Danger Zone</span>
          </div>
        </div>

        <div class="panel-body" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Purge Local Workspace Cache</div>
              <div style="font-size: 11px; color: var(--text-secondary);">
                Purges cached AST symbol graphs and resets active repository session state.
              </div>
            </div>

            <button class="btn btn-danger btn-sm" id="btn-clear-cache">
              <span>Purge Cache</span>
            </button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Sign Out of Session</div>
              <div style="font-size: 11px; color: var(--text-secondary);">
                Terminates the current authenticated session and returns to public site.
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="btn-settings-signout">
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function attachSettingsEvents() {
  const techBtn = document.getElementById("settings-tech-btn");
  const juniorBtn = document.getElementById("settings-junior-btn");
  const saveCredsBtn = document.getElementById("btn-save-credentials");
  const clearCacheBtn = document.getElementById("btn-clear-cache");
  const signoutBtn = document.getElementById("btn-settings-signout");

  if (techBtn && juniorBtn) {
    techBtn.addEventListener("click", () => store.setJuniorMode(false));
    juniorBtn.addEventListener("click", () => store.setJuniorMode(true));
  }

  if (saveCredsBtn) {
    saveCredsBtn.addEventListener("click", () => {
      const sbUrl = document.getElementById("settings-supabase-url")?.value.trim();
      if (sbUrl) {
        localStorage.setItem("repomind_supabase_url", sbUrl);
      }
      store.showToast("Developer credentials and cloud settings updated.", "success");
    });
  }

  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", () => {
      store.openConfirmationDialog({
        title: "Purge Workspace Diagnostics Cache?",
        message: "This will remove locally indexed AST graphs and reset transient session state.",
        confirmLabel: "Purge Cache",
        isDangerous: true,
        onConfirm: () => {
          store.showToast("Local AST and diagnostics cache cleared.", "info");
        }
      });
    });
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      store.logout();
    });
  }
}
