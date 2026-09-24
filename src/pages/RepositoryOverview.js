/**
 * Page 2 — Repository Overview
 * High-density engineering dashboard: repo metadata, technical metrics,
 * compact architecture topology, and code health status breakdown.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderRepositoryOverview(state) {
  const repo = state.repository;
  const isJunior = state.juniorMode;
  const metrics = repo.metrics;

  return `
    <div class="workspace-content">
      <!-- Return to All Repositories Link -->
      <div style="margin-bottom: var(--space-3);">
        <a href="#app" id="overview-back-home" class="btn btn-ghost btn-xs" style="padding: 2px 6px; text-decoration: none;">
          ${Icons.ArrowRight ? `<span style="transform: rotate(180deg); display: inline-flex;">${Icons.ArrowRight(11)}</span>` : "←"}
          <span>Back to All Repositories</span>
        </a>
      </div>

      <!-- Page Header with Repository Identity -->
      <div class="page-header">
        <div class="page-title-group">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 class="page-title">
              ${Icons.Repository(18)}
              <span>${repo.name}</span>
            </h1>
            <span class="badge badge-success" title="Analysis Status">
              ${Icons.Check(10)}
              ${repo.status}
            </span>
          </div>
          <div class="page-subtitle" style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px; font-family: var(--font-mono); font-size: 11px;">
            <span>URL: <a href="${repo.url}" target="_blank" rel="noopener" style="color: var(--text-link);">${repo.url}</a></span>
            <span>Branch: <span style="color: var(--text-primary);">${repo.branch}</span></span>
            <span>Commit: <span style="color: var(--text-muted);">${repo.commit}</span></span>
            <span>Language: <span style="color: var(--text-primary);">${repo.primaryLanguage}</span></span>
            <span>Last Analyzed: <span style="color: var(--text-muted);">${repo.lastAnalyzed}</span></span>
          </div>
        </div>

        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="overview-ask-btn">
            ${Icons.AskAI(13)}
            <span>Ask AI</span>
          </button>
          <button class="btn btn-primary btn-sm" id="overview-refactor-btn">
            ${Icons.Refactor(13)}
            <span>Open Refactor Studio</span>
          </button>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Repository Health Snapshot (Junior Mode)</div>
            <div class="junior-callout-text">
              This overview shows how this project is structured. It has 147 files split into 18 modules. All 42 automated tests are currently passing, but there are 13 areas flagged for cleanup or security improvements.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Engineering Metrics Grid -->
      <div class="metric-grid">
        <div class="metric-card" id="card-files" style="cursor: pointer;" title="Inspect repository modules">
          <div class="metric-header">
            <span>Codebase Size</span>
            ${Icons.FileCode(13)}
          </div>
          <div class="metric-val">147 Files</div>
          <div class="metric-meta">
            <span>12,480 lines of code</span>
          </div>
        </div>

        <div class="metric-card" id="card-modules" style="cursor: pointer;" title="View system architecture">
          <div class="metric-header">
            <span>Modularity</span>
            ${Icons.Architecture(13)}
          </div>
          <div class="metric-val">18 Modules</div>
          <div class="metric-meta">
            <span>FastAPI & Core Services</span>
          </div>
        </div>

        <div class="metric-card" id="card-tests" style="cursor: pointer;" title="View verification test results">
          <div class="metric-header">
            <span>Test Suite</span>
            ${Icons.Verification(13)}
          </div>
          <div class="metric-val" style="color: var(--color-success-light);">42 Tests</div>
          <div class="metric-meta">
            <span style="color: var(--color-success-light);">✓ 42 / 42 passed (88.4% cov)</span>
          </div>
        </div>

        <div class="metric-card" id="card-findings" style="cursor: pointer;" title="View code health findings">
          <div class="metric-header">
            <span>Code Health</span>
            ${Icons.CodeHealth(13)}
          </div>
          <div class="metric-val" style="color: var(--color-high);">13 Findings</div>
          <div class="metric-meta">
            <span class="badge badge-high" style="font-size: 10px;">2 HIGH</span>
            <span class="badge badge-medium" style="font-size: 10px;">7 MED</span>
            <span class="badge badge-low" style="font-size: 10px;">4 LOW</span>
          </div>
        </div>
      </div>

      <!-- Two-Column Technical Sections: Architecture & Code Health Breakdown -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
        
        <!-- Architecture Topology Section -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.Architecture(13)}
              <span>System Topology</span>
            </div>
            <button class="btn btn-ghost btn-xs" id="view-full-arch-btn">
              <span>Full Graph</span>
              ${Icons.ArrowRight(11)}
            </button>
          </div>

          <div class="panel-body">
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 14px;">
              Tiered architectural flow detected across 18 modules:
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">Frontend</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Next.js / TypeScript • 48 files</div>
                </div>
                <span class="badge badge-outline">Client UI</span>
              </div>

              <div style="text-align: center; color: var(--text-muted); line-height: 1;">↓</div>

              <div style="padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">API Gateway</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">FastAPI / Uvicorn • 22 routes</div>
                </div>
                <span class="badge badge-info">Port :8000</span>
              </div>

              <div style="text-align: center; color: var(--text-muted); line-height: 1;">↓</div>

              <div style="padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">Core Services</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Auth, Orders, Billing, Students, Workers</div>
                </div>
                <span class="badge badge-medium">10 Findings</span>
              </div>

              <div style="text-align: center; color: var(--text-muted); line-height: 1;">↓</div>

              <div style="padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">Database & External</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">PostgreSQL 15, Redis, Stripe, SendGrid</div>
                </div>
                <span class="badge badge-outline">Storage & APIs</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Code Health Summary Section -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.CodeHealth(13)}
              <span>Code Health Breakdown</span>
            </div>
            <button class="btn btn-ghost btn-xs" id="view-full-health-btn">
              <span>View All 13</span>
              ${Icons.ArrowRight(11)}
            </button>
          </div>

          <div class="panel-body">
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Security Issues</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Hardcoded secret in config.py, SQL injection risk in search</div>
                </div>
                <span class="badge badge-high">2 High Risk</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Code Smells</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Large monolithic function (orders.py), magic numbers, dead imports</div>
                </div>
                <span class="badge badge-medium">7 Smells</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Outdated Patterns</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Deprecated Pydantic .dict() syntax, unhandled async task group</div>
                </div>
                <span class="badge badge-low">4 Items</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                <div>
                  <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Test Status</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Unit, integration, and auth authorization test suites</div>
                </div>
                <span class="badge badge-success">42 / 42 Passing</span>
              </div>
            </div>

            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: var(--text-muted);">Top Priority:</span>
              <button class="btn btn-secondary btn-xs" id="quick-fix-secret-btn">
                <span>Inspect FND-001 (config.py:27)</span>
                ${Icons.ArrowRight(10)}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function attachRepositoryOverviewEvents() {
  const cardFindings = document.getElementById("card-findings");
  const cardModules = document.getElementById("card-modules");
  const cardTests = document.getElementById("card-tests");
  const viewFullArch = document.getElementById("view-full-arch-btn");
  const viewFullHealth = document.getElementById("view-full-health-btn");
  const askBtn = document.getElementById("overview-ask-btn");
  const refactorBtn = document.getElementById("overview-refactor-btn");
  const quickFixSecret = document.getElementById("quick-fix-secret-btn");
  const backHomeLink = document.getElementById("overview-back-home");

  if (backHomeLink) {
    backHomeLink.addEventListener("click", (e) => {
      e.preventDefault();
      store.setRoute("app");
    });
  }

  if (cardFindings || viewFullHealth) {
    [cardFindings, viewFullHealth].forEach(el => {
      el?.addEventListener("click", () => store.setRoute("app/code-health"));
    });
  }

  if (cardModules || viewFullArch) {
    [cardModules, viewFullArch].forEach(el => {
      el?.addEventListener("click", () => store.setRoute("app/architecture"));
    });
  }

  if (cardTests) {
    cardTests.addEventListener("click", () => store.setRoute("app/verification"));
  }

  if (askBtn) {
    askBtn.addEventListener("click", () => store.setRoute("app/ask"));
  }

  if (refactorBtn) {
    refactorBtn.addEventListener("click", () => store.setRoute("app/refactor"));
  }

  if (quickFixSecret) {
    quickFixSecret.addEventListener("click", () => {
      const fnd = store.getState().findings.find(f => f.id === "FND-001");
      if (fnd) {
        store.openCodeInspector(fnd.title, fnd.file, `Line ${fnd.line}`, fnd.codeSnippet);
      }
    });
  }
}
