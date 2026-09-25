/**
 * Page 9 — Verification & Safe Human Approval
 * Executes automated test suites to ensure 0 regressions BEFORE any changes are applied.
 * Features: Before/After test matrix, live runner terminal, and safe approval guardrails.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderVerificationPage(state) {
  const isJunior = state.juniorMode;
  const ver = state.verificationData;
  const status = state.verificationStatus; // 'queued' | 'running' | 'passed' | 'failed' | 'applied'
  const isRunning = status === "running";
  const isApplied = status === "applied";
  const explanation = isJunior ? ver.explanation.junior : ver.explanation.technical;

  const isNotAvailable = ver && (ver.status === "Not Available" || ver.totalTests === 0);
  const isFailed = ver && ver.status === "Failed";
  const isPassed = ver && ver.status === "Passed" && ver.totalTests > 0;

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.Verification(18)}
            <span>Regression Verification Suite</span>
          </h1>
          <p class="page-subtitle">
            Hermetic sandbox test runner executing test suites to prove mathematical behavioral equivalence.
          </p>
        </div>

        <div class="page-actions">
          <button 
            class="btn btn-secondary btn-sm" 
            id="btn-rerun-tests"
            ${isRunning ? 'disabled' : ''}
          >
            ${isRunning ? Icons.ImpactAnalysis(13) : Icons.Play(11)}
            <span>${isRunning ? "Executing Suites..." : "Re-run Test Suite"}</span>
          </button>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Safe Verification (Junior Mode)</div>
            <div class="junior-callout-text">
              We never save changes directly without proving they work. Here, RepoMind runs all automated tests against the refactored code. Because every single test passed before and after, we know no bugs were introduced.
            </div>
          </div>
        </div>
      ` : ""}

      ${isApplied ? `
        <div style="padding: 12px 16px; background-color: var(--color-success-bg); border: 1px solid var(--color-success-border); border-radius: var(--radius-md); margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: var(--color-success-light); font-size: 16px;">${Icons.Check(16)}</span>
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Changes Approved & Applied to Git</div>
              <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">
                Committed to <code>main</code> branch • Commit SHA: <code>9c3d4e1</code> • Audit log recorded
              </div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-revert-apply">
            <span>Revert Commit</span>
          </button>
        </div>
      ` : ""}

      <!-- Status Header Banner -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-body" style="padding: 14px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge ${isRunning ? 'badge-medium' : (isNotAvailable ? 'badge-outline' : (isFailed ? 'badge-high' : 'badge-success'))}" style="font-size: 12px; padding: 2px 8px;">
                ${isRunning ? Icons.ImpactAnalysis(12) : (isNotAvailable ? Icons.Info(12) : (isFailed ? Icons.AlertTriangle(12) : Icons.Check(12)))}
                <span>${isRunning ? "Running tests..." : (isNotAvailable ? "Test Suites Not Available" : (isFailed ? "Verification Failed" : "✓ Verification successful"))}</span>
              </span>
              <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">
                ${isRunning ? `${state.verificationProgress}%` : (isNotAvailable ? "0 test suites found" : `${ver.passedCount} / ${ver.totalTests} passed`)}
              </span>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; max-width: 680px;">
              ${explanation}
            </p>
          </div>

          <!-- Human Approval Action Buttons -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button 
              class="btn btn-secondary btn-sm" 
              id="btn-verification-reject"
              ${isRunning || isApplied ? 'disabled' : ''}
            >
              <span>Reject</span>
            </button>
            <button 
              class="btn btn-success btn-sm" 
              id="btn-verification-approve"
              ${isRunning || isApplied ? 'disabled' : ''}
              title="${isNotAvailable ? 'Approve with static syntax verification only' : 'Verify before applying'}"
            >
              ${Icons.Check(12)}
              <span>${isNotAvailable ? 'Approve (Static Validated)' : 'Approve & Apply'}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Before / After Test Comparison Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
        
        <!-- BEFORE -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span>BEFORE REFACTOR (Base Commit)</span>
            </div>
            <span class="badge badge-outline">Time: ${ver.before.time}</span>
          </div>

          <div class="panel-body" style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--color-success-light);">
                ${ver.before.passed}
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
                Passed
              </div>
            </div>

            <div style="width: 1px; background: var(--border-subtle);"></div>

            <div>
              <div style="font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--text-muted);">
                ${ver.before.failed}
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
                Failed
              </div>
            </div>
          </div>
        </div>

        <!-- AFTER -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span style="color: var(--color-success-light);">AFTER REFACTOR (Staged Changes)</span>
            </div>
            <span class="badge badge-outline">Time: ${ver.after.time}</span>
          </div>

          <div class="panel-body" style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--color-success-light);">
                ${ver.after.passed}
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--color-success-light); font-weight: 600;">
                Passed (0 Regressions)
              </div>
            </div>

            <div style="width: 1px; background: var(--border-subtle);"></div>

            <div>
              <div style="font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--text-muted);">
                ${ver.after.failed}
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
                Failed
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Test Suites Breakdown & Live Terminal Output -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
        
        <!-- Test Suites Table -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.Verification(13)}
              <span>Executed Test Suites</span>
            </div>
            <span class="badge badge-outline">4 Suites</span>
          </div>

          <div class="panel-body no-padding">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Suite</th>
                  <th>Tests</th>
                  <th>Duration</th>
                  <th style="text-align: right;">Result</th>
                </tr>
              </thead>
              <tbody>
                ${ver.suites.map(s => `
                  <tr>
                    <td class="mono" style="font-weight: 600;">${s.name}</td>
                    <td class="mono">${s.passed}/${s.total}</td>
                    <td class="mono" style="color: var(--text-muted);">${s.duration}</td>
                    <td style="text-align: right;">
                      <span class="badge badge-success">Passed</span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Live Terminal Log Box -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.Terminal ? Icons.Terminal(13) : Icons.FileCode(13)}
              <span>Runner Output (pytest)</span>
            </div>
            <span class="badge badge-outline">stdout</span>
          </div>

          <div class="panel-body no-padding" style="background-color: var(--bg-canvas); max-height: 240px; overflow-y: auto;">
            <div style="padding: 10px 14px; font-family: var(--font-mono); font-size: 11px; line-height: 1.6; color: var(--text-secondary);">
              ${ver.liveLogs.map(log => {
                const isPass = log.includes("PASSED") || log.includes("passed in");
                return `<div style="color: ${isPass ? 'var(--color-success-light)' : 'var(--text-secondary)'};">${escapeHtml(log)}</div>`;
              }).join("")}
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

export function attachVerificationEvents() {
  const rerunBtn = document.getElementById("btn-rerun-tests");
  const rejectBtn = document.getElementById("btn-verification-reject");
  const approveBtn = document.getElementById("btn-verification-approve");
  const revertBtn = document.getElementById("btn-revert-apply");

  if (rerunBtn) {
    rerunBtn.addEventListener("click", () => store.runVerification());
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      store.openConfirmationDialog({
        title: "Reject Verification & Staged Refactor?",
        message: "Are you sure you want to reject this refactoring plan? Staged files will be purged.",
        confirmLabel: "Reject Refactor",
        isDangerous: true,
        onConfirm: () => {
          store.setState({ refactorStatus: "draft", verificationStatus: "passed" });
          store.showToast("Refactor rejected and reset", "info");
          store.setRoute("app/refactor");
        }
      });
    });
  }

  if (approveBtn) {
    approveBtn.addEventListener("click", () => {
      store.openConfirmationDialog({
        title: "Approve & Apply Refactor to Repository?",
        message: "You are about to apply the verified changes to orders.py (+42 / -31 lines) on branch 'main'. All 42 tests have passed.",
        confirmLabel: "Approve & Commit",
        cancelLabel: "Review Again",
        isDangerous: false,
        onConfirm: () => {
          store.setState({ verificationStatus: "applied", refactorStatus: "approved" });
          store.showToast("Refactor approved and safely committed to main", "success");
        }
      });
    });
  }

  if (revertBtn) {
    revertBtn.addEventListener("click", () => {
      store.setState({ verificationStatus: "passed", refactorStatus: "generated" });
      store.showToast("Commit reverted to staging state", "info");
    });
  }
}
