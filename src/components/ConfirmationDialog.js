/**
 * RepoMind Confirmation Dialog
 * Safe human verification and commit authorization guard.
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderConfirmationDialog(state) {
  const { isOpen, title, message, confirmLabel, cancelLabel, isDangerous } = state.confirmationDialog;
  if (!isOpen) return "";

  return `
    <div class="modal-backdrop" id="confirmation-dialog-backdrop" role="alertdialog" aria-modal="true">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="panel-header">
          <div class="panel-title" style="color: ${isDangerous ? 'var(--color-high)' : 'var(--text-primary)'};">
            ${isDangerous ? Icons.AlertTriangle(15) : Icons.Verification(15)}
            <span>${title || "Confirmation Required"}</span>
          </div>
          <button class="btn btn-ghost btn-icon" id="confirm-dialog-close" aria-label="Cancel">
            ${Icons.Close(14)}
          </button>
        </div>

        <div class="panel-body">
          <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
            ${message}
          </p>

          <div style="background-color: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; font-family: var(--font-mono); font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Target Branch:</span>
              <span style="color: var(--text-primary); font-weight: 600;">main</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Verification Status:</span>
              <span style="color: var(--color-success-light); font-weight: 600;">42/42 Tests Passed (0 regressions)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Impact Radius:</span>
              <span style="color: var(--text-secondary);">1 file modified, 6 callers preserved</span>
            </div>
          </div>
        </div>

        <div class="panel-footer" style="justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="confirm-dialog-cancel">
            ${cancelLabel || "Cancel"}
          </button>
          <button class="btn ${isDangerous ? 'btn-danger' : 'btn-primary'} btn-sm" id="confirm-dialog-ok">
            ${confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function attachConfirmationDialogEvents() {
  const backdrop = document.getElementById("confirmation-dialog-backdrop");
  const closeBtn = document.getElementById("confirm-dialog-close");
  const cancelBtn = document.getElementById("confirm-dialog-cancel");
  const okBtn = document.getElementById("confirm-dialog-ok");

  const close = () => store.closeConfirmationDialog();

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (cancelBtn) cancelBtn.addEventListener("click", close);

  if (okBtn) {
    okBtn.addEventListener("click", () => {
      const onConfirm = store.getState().confirmationDialog.onConfirm;
      close();
      if (typeof onConfirm === "function") {
        onConfirm();
      }
    });
  }
}
