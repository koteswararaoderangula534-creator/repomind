/**
 * RepoMind Command Palette (Ctrl+K)
 * Fast keyboard-first navigation and developer actions across workspace.
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderCommandPalette(state) {
  if (!state.commandPaletteOpen) return "";

  const actions = [
    { id: "app", category: "Workspace", label: "Go to All Repositories (Home)", icon: Icons.Repository(14) },
    { id: "app/overview", category: "Navigation", label: "Go to Repository Overview", icon: Icons.Overview(14) },
    { id: "app/architecture", category: "Navigation", label: "Go to Architecture Graph", icon: Icons.Architecture(14) },
    { id: "app/forensic", category: "Navigation", label: "Go to Forensic Analysis & DB Diagnostics", icon: Icons.ForensicAnalysis(14) },
    { id: "app/code-health", category: "Navigation", label: "Go to Code Health Findings (13 items)", icon: Icons.CodeHealth(14) },
    { id: "app/ask", category: "Navigation", label: "Ask AI Codebase Intelligence", icon: Icons.AskAI(14) },
    { id: "app/impact", category: "Navigation", label: "Go to Impact Analysis: authenticate_user()", icon: Icons.ImpactAnalysis(14) },
    { id: "app/refactor", category: "Navigation", label: "Go to Refactor Studio: process_order()", icon: Icons.Refactor(14) },
    { id: "app/diff", category: "Navigation", label: "Inspect Refactoring Diff", icon: Icons.DiffViewer(14) },
    { id: "app/verification", category: "Navigation", label: "Run & Inspect Verification (42 tests)", icon: Icons.Verification(14) },
    { id: "app/repository", category: "Repository", label: "Connect / Switch GitHub Repository", icon: Icons.Repository(14) },
    { id: "toggle-junior", category: "Mode", label: state.juniorMode ? "Switch to Technical Engineering Mode" : "Switch to Junior-Friendly Mode", icon: Icons.Info(14) },
    { id: "logout", category: "Account", label: "Sign Out to Public Website", icon: Icons.Close(14) }
  ];

  return `
    <div class="cmd-palette-backdrop" id="cmd-palette-backdrop" role="dialog" aria-modal="true" aria-label="Command Palette">
      <div class="cmd-palette-box">
        <div class="cmd-input-wrapper">
          ${Icons.Search(15)}
          <input 
            type="text" 
            class="cmd-input" 
            id="cmd-palette-input" 
            placeholder="Type a command or jump to page..." 
            autocomplete="off" 
            spellcheck="false"
          />
          <span class="kbd-shortcut">ESC</span>
        </div>

        <div class="cmd-results-list" id="cmd-results-list">
          <div class="cmd-category-header">Actions & Views</div>
          ${actions.map((act, index) => `
            <div class="cmd-result-item ${index === 0 ? 'selected' : ''}" data-action="${act.id}">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span>${act.icon}</span>
                <span>${act.label}</span>
              </div>
              <span class="badge badge-outline" style="font-size: 10px;">${act.category}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

export function attachCommandPaletteEvents() {
  const backdrop = document.getElementById("cmd-palette-backdrop");
  const input = document.getElementById("cmd-palette-input");
  const items = document.querySelectorAll(".cmd-result-item[data-action]");

  if (input) {
    input.focus();
    input.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? "flex" : "none";
      });
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        store.toggleCommandPalette();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) store.toggleCommandPalette();
    });
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      const action = item.getAttribute("data-action");
      store.toggleCommandPalette();
      if (action === "toggle-junior") {
        store.setJuniorMode(!store.getState().juniorMode);
      } else if (action === "logout") {
        store.logout();
      } else if (action) {
        store.setRoute(action);
        window.location.hash = action;
      }
    });
  });
}
