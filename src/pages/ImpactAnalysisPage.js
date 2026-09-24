/**
 * Page 6 — Impact Analysis
 * Key RepoMind feature: Evaluates symbol blast radius, caller-callee chains,
 * potentially affected files, and regression test suites.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderImpactAnalysisPage(state) {
  const isJunior = state.juniorMode;
  const impact = state.impactData;
  const entity = state.selectedImpactEntity || impact.selectedEntity;

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.ImpactAnalysis(18)}
            <span>Impact Analysis & Blast Radius</span>
          </h1>
          <p class="page-subtitle">
            Static call-graph propagation tracing downstream effects, dependent test suites, and operational risks.
          </p>
        </div>

        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="impact-refactor-cta">
            ${Icons.Refactor(13)}
            <span>Refactor Safely</span>
          </button>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Blast Radius Analysis (Junior Mode)</div>
            <div class="junior-callout-text">
              Before changing a line of code, RepoMind checks: "If we touch this function, what might break?" It traces all callers and identifies exactly which 4 test suites will prove the change is safe.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Entity Selector & Metrics Bar -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-body" style="padding: 12px 16px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">
              Selected Target:
            </span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <code style="font-size: 13px; font-weight: 700; color: var(--brand-accent-text); background: var(--brand-accent-subtle); padding: 3px 8px; border-radius: var(--radius-sm); border: 1px solid var(--brand-accent-border);">
                ${entity}
              </code>
              <span class="badge badge-outline" style="font-size: 11px;">${impact.file}:${impact.lineRange}</span>
            </div>
          </div>

          <!-- Quick switcher between key functions -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: var(--text-muted);">Inspect target:</span>
            <button class="btn btn-xs ${entity === 'authenticate_user()' ? 'btn-primary' : 'btn-secondary'} switch-entity-btn" data-entity="authenticate_user()">
              authenticate_user()
            </button>
            <button class="btn btn-xs ${entity === 'process_order()' ? 'btn-primary' : 'btn-secondary'} switch-entity-btn" data-entity="process_order()">
              process_order()
            </button>
          </div>
        </div>
      </div>

      <!-- Engineering Blast Radius Metrics -->
      <div class="metric-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: var(--space-4);">
        <div class="metric-card">
          <div class="metric-header">
            <span>Affected Files</span>
            ${Icons.FileCode(13)}
          </div>
          <div class="metric-val">${impact.summary.affectedFilesCount} Files</div>
          <div class="metric-meta">Across 3 architectural layers</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span>Affected Functions</span>
            ${Icons.ImpactAnalysis(13)}
          </div>
          <div class="metric-val">${impact.summary.affectedFunctionsCount} Callers</div>
          <div class="metric-meta">Inbound & downstream call chain</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span>Related Tests</span>
            ${Icons.Verification(13)}
          </div>
          <div class="metric-val" style="color: var(--color-success-light);">${impact.summary.relatedTestsCount} Tests</div>
          <div class="metric-meta">Verification coverage ready</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span>Risk Rating</span>
            ${Icons.AlertTriangle(13)}
          </div>
          <div class="metric-val" style="color: var(--color-high);">${impact.summary.riskRating}</div>
          <div class="metric-meta">${impact.summary.blastRadiusScore}</div>
        </div>
      </div>

      <!-- Main Layout: Clean Dependency Flow + Risk Areas & Affected Files -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
        
        <!-- Left: Clean Dependency Flow Chain -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.ImpactAnalysis(13)}
              <span>Dependency Flow Chain</span>
            </div>
            <span class="badge badge-outline">Caller → Callee</span>
          </div>

          <div class="panel-body">
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 16px;">
              Direct and transitively dependent modules invoking or invoked by <code>${entity}</code>:
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${impact.dependencyFlow.map((step, idx) => `
                <div style="
                  padding: 10px 14px;
                  background-color: ${step.isTarget ? 'rgba(56, 139, 253, 0.08)' : 'var(--bg-secondary)'};
                  border: 1px solid ${step.isTarget ? 'var(--brand-accent)' : 'var(--border-subtle)'};
                  border-radius: var(--radius-sm);
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--text-muted);">
                        0${step.step}
                      </span>
                      <span style="font-weight: 600; font-size: 12px; color: var(--text-primary); font-family: var(--font-mono);">
                        ${step.file}
                      </span>
                      ${step.isTarget ? `<span class="badge badge-info" style="font-size: 9px;">Target Focus</span>` : ""}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; font-family: var(--font-mono);">
                      <code>${step.entity}</code>
                    </div>
                  </div>

                  <span class="badge badge-outline" style="font-size: 10px;">${step.role}</span>
                </div>

                ${idx < impact.dependencyFlow.length - 1 ? `
                  <div style="text-align: center; color: var(--text-muted); font-size: 13px; line-height: 1;">↓</div>
                ` : ""}
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Right: Risk Areas & Related Tests -->
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          
          <!-- Risk Areas Breakdown -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">
                ${Icons.AlertTriangle(13)}
                <span>Identified Risk Areas</span>
              </div>
              <span class="badge badge-high">3 Critical Boundaries</span>
            </div>

            <div class="panel-body">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${impact.riskAreas.map(r => `
                  <div style="padding: 8px 12px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                      <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${r.name}</span>
                      <span class="badge ${r.level === 'Critical' ? 'badge-high' : 'badge-medium'}">${r.level}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.35;">
                      ${r.description}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Related Tests for Verification -->
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">
                ${Icons.Verification(13)}
                <span>Verification Guardrails (Test Suites)</span>
              </div>
              <span class="badge badge-success">4 Tests Active</span>
            </div>

            <div class="panel-body no-padding">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Suite File</th>
                    <th style="text-align: right;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${impact.relatedTests.map(t => `
                    <tr>
                      <td class="mono" style="font-weight: 500;">${t.name}</td>
                      <td class="mono" style="color: var(--text-secondary);">${t.file}</td>
                      <td style="text-align: right;">
                        <span class="badge badge-success">${t.status}</span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="panel-footer" style="justify-content: flex-end;">
              <button class="btn btn-primary btn-sm" id="impact-go-refactor-btn">
                <span>Open in Refactor Studio</span>
                ${Icons.ArrowRight(11)}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function attachImpactAnalysisEvents() {
  const switchBtns = document.querySelectorAll(".switch-entity-btn");
  const refactorCTA = document.getElementById("impact-refactor-cta");
  const goRefactorBtn = document.getElementById("impact-go-refactor-btn");

  switchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const entity = btn.getAttribute("data-entity");
      if (entity) {
        store.setState({ selectedImpactEntity: entity });
      }
    });
  });

  [refactorCTA, goRefactorBtn].forEach(btn => {
    btn?.addEventListener("click", () => store.setRoute("app/refactor"));
  });
}
