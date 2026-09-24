/**
 * Page 5 — Code Health
 * High-density engineering findings table (Sentry / Datadog style).
 * 13 Findings (HIGH: 2, MEDIUM: 7, LOW: 4) with interactive filters and targeted action buttons.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderCodeHealthPage(state) {
  const isJunior = state.juniorMode;
  const filter = state.findingFilter;
  let findings = state.findings;

  // Filter findings
  if (filter.severity !== "ALL") {
    findings = findings.filter(f => f.severity === filter.severity);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    findings = findings.filter(f => 
      f.title.toLowerCase().includes(q) || 
      f.file.toLowerCase().includes(q) || 
      f.rule.toLowerCase().includes(q)
    );
  }

  const counts = {
    total: state.findings.length,
    high: state.findings.filter(f => f.severity === "HIGH").length,
    medium: state.findings.filter(f => f.severity === "MEDIUM").length,
    low: state.findings.filter(f => f.severity === "LOW").length
  };

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.CodeHealth(18)}
            <span>Code Health & Diagnostics</span>
          </h1>
          <p class="page-subtitle">
            Diagnostic rule evaluations across security boundaries, maintainability metrics, and architectural smells.
          </p>
        </div>

        <div class="page-actions">
          <span class="badge badge-high">${counts.high} HIGH</span>
          <span class="badge badge-medium">${counts.medium} MEDIUM</span>
          <span class="badge badge-low">${counts.low} LOW</span>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Code Health Findings (Junior Mode)</div>
            <div class="junior-callout-text">
              These are issues RepoMind found in the code. <strong>HIGH</strong> items are security or crash risks that should be fixed immediately. <strong>MEDIUM</strong> items are messy code structures that cause bugs later. <strong>LOW</strong> items are minor cleanups like formatting or unused imports.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Filter Controls Bar -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-body" style="padding: 10px 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
          <!-- Severity Pills -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn-xs filter-sev-btn ${filter.severity === 'ALL' ? 'btn-primary' : 'btn-secondary'}" data-sev="ALL">
              All (${counts.total})
            </button>
            <button class="btn btn-xs filter-sev-btn ${filter.severity === 'HIGH' ? 'btn-primary' : 'btn-secondary'}" data-sev="HIGH">
              HIGH (${counts.high})
            </button>
            <button class="btn btn-xs filter-sev-btn ${filter.severity === 'MEDIUM' ? 'btn-primary' : 'btn-secondary'}" data-sev="MEDIUM">
              MEDIUM (${counts.medium})
            </button>
            <button class="btn btn-xs filter-sev-btn ${filter.severity === 'LOW' ? 'btn-primary' : 'btn-secondary'}" data-sev="LOW">
              LOW (${counts.low})
            </button>
          </div>

          <!-- Search Input -->
          <div style="display: flex; align-items: center; gap: 8px; width: 280px;">
            <input 
              type="text" 
              id="findings-search" 
              class="input-text" 
              placeholder="Filter by file, rule, or title..."
              value="${filter.search || ''}"
              style="padding: 4px 8px; font-size: 11px;"
            />
          </div>
        </div>
      </div>

      <!-- Professional Findings Table -->
      <div class="panel">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 90px;">Severity</th>
                <th>Finding</th>
                <th style="width: 90px;">Rule</th>
                <th style="width: 200px;">File : Line</th>
                <th style="width: 80px;">Status</th>
                <th style="width: 290px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${findings.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">
                    No findings match the current filter criteria.
                  </td>
                </tr>
              ` : findings.map(fnd => {
                const sevBadgeClass = fnd.severity === 'HIGH' ? 'badge-high' : fnd.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low';
                const descriptionText = isJunior ? fnd.juniorDescription : fnd.description;

                return `
                  <tr data-finding-id="${fnd.id}">
                    <td>
                      <span class="badge ${sevBadgeClass}">${fnd.severity}</span>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
                        ${fnd.title}
                      </div>
                      <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.35; max-width: 580px;">
                        ${descriptionText}
                      </div>
                    </td>
                    <td class="mono">
                      <span>${fnd.rule}</span>
                    </td>
                    <td class="mono">
                      <a href="javascript:void(0)" class="view-code-btn" data-fnd-id="${fnd.id}" style="color: var(--text-link); text-decoration: none;">
                        ${fnd.file}:${fnd.line}
                      </a>
                    </td>
                    <td>
                      <span class="badge badge-outline">${fnd.status}</span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button class="btn btn-secondary btn-xs view-code-btn" data-fnd-id="${fnd.id}" title="View snippet">
                          ${Icons.FileCode(11)}
                          <span>View Code</span>
                        </button>
                        <button class="btn btn-secondary btn-xs analyze-impact-btn" data-fnd-id="${fnd.id}" title="Analyze caller impact">
                          ${Icons.ImpactAnalysis(11)}
                          <span>Impact</span>
                        </button>
                        <button class="btn btn-primary btn-xs refactor-fnd-btn" data-fnd-id="${fnd.id}" title="Refactor finding">
                          ${Icons.Refactor(11)}
                          <span>Refactor</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="panel-footer">
          <span>Showing ${findings.length} of ${counts.total} findings</span>
          <span style="font-family: var(--font-mono); font-size: 11px;">RepoMind AST Engine v2.4</span>
        </div>
      </div>
    </div>
  `;
}

export function attachCodeHealthEvents() {
  const sevBtns = document.querySelectorAll(".filter-sev-btn");
  const searchInput = document.getElementById("findings-search");
  const viewCodeBtns = document.querySelectorAll(".view-code-btn");
  const impactBtns = document.querySelectorAll(".analyze-impact-btn");
  const refactorBtns = document.querySelectorAll(".refactor-fnd-btn");

  sevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const sev = btn.getAttribute("data-sev");
      store.setState({
        findingFilter: {
          ...store.getState().findingFilter,
          severity: sev
        }
      });
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      store.setState({
        findingFilter: {
          ...store.getState().findingFilter,
          search: e.target.value
        }
      });
    });
  }

  viewCodeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const fndId = btn.getAttribute("data-fnd-id");
      const fnd = store.getState().findings.find(f => f.id === fndId);
      if (fnd) {
        store.openCodeInspector(
          `${fnd.title} [${fnd.rule}]`,
          fnd.file,
          `Line ${fnd.line}`,
          fnd.codeSnippet
        );
      }
    });
  });

  impactBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const fndId = btn.getAttribute("data-fnd-id");
      const fnd = store.getState().findings.find(f => f.id === fndId);
      if (fnd) {
        store.setState({ selectedImpactEntity: fnd.impactEntity || "authenticate_user()" });
        store.setRoute("app/impact");
      }
    });
  });

  refactorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const fndId = btn.getAttribute("data-fnd-id");
      store.setState({ selectedFindingId: fndId });
      store.setRoute("app/refactor");
    });
  });
}
