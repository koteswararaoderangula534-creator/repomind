/**
 * Page 7 — Refactor Studio
 * Professional 3-column code review layout:
 * LEFT: Selected File & Target Code | CENTER: AI Decomposition & Rationale | RIGHT: Impact & Risk Safeguards
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderRefactorPage(state) {
  const isJunior = state.juniorMode;
  const refactor = state.refactorData;
  const status = state.refactorStatus;
  const isGenerating = status === "generating";

  const originalLines = refactor.originalCode.split("\n");

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.Refactor(18)}
            <span>Safe Refactoring Studio</span>
          </h1>
          <p class="page-subtitle">
            Evidence-backed decomposition plans with isolated failure boundaries and 100% backwards compatibility.
          </p>
        </div>

        <div class="page-actions">
          <span class="badge badge-info">Target: ${refactor.targetFunction}</span>
          <span class="badge badge-outline">${refactor.file}:${refactor.lineRange}</span>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Refactoring Plan (Junior Mode)</div>
            <div class="junior-callout-text">
              Refactoring means restructuring code to make it cleaner without changing what it does. Here we take a bulky 84-line function that does 4 jobs at once and separate it into 4 tidy helper functions.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- 3-Column IDE Layout -->
      <div style="display: grid; grid-template-columns: 1.1fr 1.3fr 0.9fr; gap: var(--space-4); align-items: start;">
        
        <!-- LEFT: Target File & Function Preview -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.FileCode(13)}
              <span>${refactor.file}</span>
            </div>
            <span class="badge badge-outline">Lines 84–168</span>
          </div>

          <div class="panel-body no-padding" style="max-height: 520px; overflow-y: auto;">
            <div class="code-viewer-container" style="border: none; border-radius: 0;">
              <table class="code-table">
                <tbody>
                  ${originalLines.map((line, idx) => `
                    <tr class="code-line ${idx === 0 ? 'highlighted' : ''}">
                      <td class="code-gutter">${84 + idx}</td>
                      <td class="code-content">${escapeHtml(line)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel-footer" style="font-family: var(--font-mono); font-size: 11px;">
            <span>Cyclomatic Complexity: 14</span>
            <span style="color: var(--color-medium);">Single Responsibility Violation</span>
          </div>
        </div>

        <!-- CENTER: AI Analysis & Decomposition -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.AskAI(13)}
              <span>Decomposition Plan</span>
            </div>
            <span class="badge badge-info">AST Decomp</span>
          </div>

          <div class="panel-body">
            <!-- Problem -->
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px;">
                Problem Diagnosis
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-primary); line-height: 1.5; background: var(--bg-canvas); padding: 10px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                ${isJunior ? refactor.problem.junior : refactor.problem.technical}
              </p>
            </div>

            <!-- Recommended Decomposition -->
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">
                Recommended Separation
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${refactor.decompositionPlan.map((fn, idx) => `
                  <div style="padding: 8px 10px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 11px;">
                    <div style="font-family: var(--font-mono); font-weight: 600; color: var(--brand-accent-text);">
                      ${idx + 1}. ${fn.name}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                      ${fn.responsibility}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- WHY THIS CHANGE? -->
            <div style="margin-bottom: var(--space-3);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 2px;">
                WHY THIS CHANGE?
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                ${isJunior ? refactor.whyThisChange.junior : refactor.whyThisChange.technical}
              </p>
            </div>

            <!-- EXPECTED IMPACT -->
            <div style="margin-bottom: var(--space-3);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 2px;">
                EXPECTED IMPACT
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                ${isJunior ? refactor.expectedImpact.junior : refactor.expectedImpact.technical}
              </p>
            </div>

            <!-- RISK -->
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 2px;">
                RISK EVALUATION
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                ${isJunior ? refactor.risk.junior : refactor.risk.technical}
              </p>
            </div>

            <!-- Primary Generate Refactor Action -->
            <div style="padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button 
                class="btn btn-primary" 
                id="btn-generate-refactor"
                ${isGenerating ? 'disabled' : ''}
                style="width: 100%; padding: 8px 14px; font-size: 13px;"
              >
                ${isGenerating ? Icons.ImpactAnalysis(14) : Icons.Play(12)}
                <span>${isGenerating ? "Synthesizing Refactored AST..." : "Generate Refactor"}</span>
              </button>
            </div>

          </div>
        </div>

        <!-- RIGHT: Impact, Risk & Verification Checklist -->
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          
          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">
                ${Icons.ImpactAnalysis(13)}
                <span>Impact Safeguards</span>
              </div>
              <span class="badge badge-success">Safe</span>
            </div>

            <div class="panel-body">
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-muted);">Blast Radius:</span>
                  <span style="font-weight: 600; color: var(--text-primary);">1 File, 4 Tests</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-muted);">Caller Compatibility:</span>
                  <span style="color: var(--color-success-light); font-weight: 600;">100% Preserved</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-muted);">Target Function:</span>
                  <span style="font-family: var(--font-mono); color: var(--text-primary);">process_order()</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Regression Risk:</span>
                  <span class="badge badge-low">Negligible</span>
                </div>
              </div>

              <div style="margin-top: 14px; padding: 10px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 11px; color: var(--text-secondary);">
                ${Icons.Verification(12)}
                <span style="margin-left: 4px;">42 automated test suites are staged to automatically verify these changes before application.</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <div class="panel-title">
                ${Icons.DiffViewer(13)}
                <span>Review Staging</span>
              </div>
            </div>
            <div class="panel-body" style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
              Once generated, inspect the side-by-side or unified diff in the Diff Viewer before triggering regression verification.
              <div style="margin-top: 12px;">
                <button class="btn btn-secondary btn-sm" id="btn-jump-diff" style="width: 100%;">
                  ${Icons.DiffViewer(13)}
                  <span>Inspect Current Diff</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function attachRefactorEvents() {
  const generateBtn = document.getElementById("btn-generate-refactor");
  const jumpDiffBtn = document.getElementById("btn-jump-diff");

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      store.setState({ refactorStatus: "generating" });
      setTimeout(() => {
        store.setState({ refactorStatus: "generated" });
        store.showToast("Refactor generated successfully! Reviewing diff...", "success");
        store.setRoute("app/diff");
      }, 750);
    });
  }

  if (jumpDiffBtn) {
    jumpDiffBtn.addEventListener("click", () => store.setRoute("app/diff"));
  }
}
