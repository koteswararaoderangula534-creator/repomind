/**
 * RepoMind Code Inspector Modal / Drawer
 * Displays file contents and line references with JetBrains Mono syntax styling.
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderCodeInspector(state) {
  const { isOpen, title, file, lines, codeSnippet } = state.codeInspector;
  if (!isOpen) return "";

  const linesArray = (codeSnippet || "").split("\n");

  return `
    <div class="modal-backdrop" id="code-inspector-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspector-modal-title">
      <div class="modal-dialog" style="max-width: 820px; width: 95%;">
        <div class="panel-header">
          <div class="panel-title" id="inspector-modal-title">
            ${Icons.FileCode(14)}
            <span>${file || "Source Code"}</span>
            ${lines ? `<span class="badge badge-outline">${lines}</span>` : ""}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-secondary btn-xs" id="copy-code-btn" title="Copy code snippet">
              ${Icons.Check(11)}
              <span>Copy</span>
            </button>
            <button class="btn btn-ghost btn-icon" id="close-inspector-btn" aria-label="Close dialog">
              ${Icons.Close(14)}
            </button>
          </div>
        </div>

        <div class="panel-body no-padding" style="max-height: 60vh; overflow-y: auto;">
          <div class="code-viewer-container" style="border: none; border-radius: 0;">
            <table class="code-table">
              <tbody>
                ${linesArray.map((line, idx) => {
                  return `
                    <tr class="code-line highlighted">
                      <td class="code-gutter">${idx + 1}</td>
                      <td class="code-content">${escapeHtml(line)}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel-footer">
          <div class="text-secondary" style="font-size: 11px;">
            Target: <code>${title}</code>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="inspector-impact-btn">
              ${Icons.ImpactAnalysis(13)}
              <span>Analyze Impact</span>
            </button>
            <button class="btn btn-primary btn-sm" id="inspector-refactor-btn">
              ${Icons.Refactor(13)}
              <span>Open Refactor Studio</span>
            </button>
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

export function attachCodeInspectorEvents() {
  const backdrop = document.getElementById("code-inspector-backdrop");
  const closeBtn = document.getElementById("close-inspector-btn");
  const copyBtn = document.getElementById("copy-code-btn");
  const impactBtn = document.getElementById("inspector-impact-btn");
  const refactorBtn = document.getElementById("inspector-refactor-btn");

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) store.closeCodeInspector();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => store.closeCodeInspector());
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const snippet = store.getState().codeInspector.codeSnippet;
      navigator.clipboard?.writeText(snippet);
      store.showToast("Code copied to clipboard", "success");
    });
  }

  if (impactBtn) {
    impactBtn.addEventListener("click", () => {
      store.closeCodeInspector();
      store.setRoute("app/impact");
    });
  }

  if (refactorBtn) {
    refactorBtn.addEventListener("click", () => {
      store.closeCodeInspector();
      store.setRoute("app/refactor");
    });
  }
}
