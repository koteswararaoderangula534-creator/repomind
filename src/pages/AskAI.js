/**
 * Page 3 — Ask AI (Codebase Intelligence)
 * Structured technical inquiry engine. NOT a generic ChatGPT clone.
 * Presents architectural flow diagrams, exact source line citations, and clickable code evidence.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderAskAI(state) {
  const isJunior = state.juniorMode;
  const activeQuery = state.askAiHistory.find(q => q.id === state.activeQueryId) || state.askAiHistory[0];

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.AskAI(18)}
            <span>Codebase Intelligence</span>
          </h1>
          <p class="page-subtitle">
            Query repository AST, architectural traces, dependency flows, and verified source citations.
          </p>
        </div>

        <div class="page-actions">
          <span class="badge badge-outline">
            ${Icons.FileCode(12)}
            147 Indexed Files
          </span>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Codebase Intelligence (Junior Mode)</div>
            <div class="junior-callout-text">
              Instead of guessing or chatting like a chatbot, RepoMind traces the exact files and lines of code that execute when a feature runs. Click any of the blue source badges below to inspect the real code.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Query Selector / Input Bar -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-body">
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1; position: relative;">
              <input 
                type="text" 
                id="ask-ai-input" 
                class="input-text" 
                placeholder="Ask about architectural flow, authentication, payment routes..."
                value="${activeQuery ? activeQuery.query : ''}"
              />
            </div>
            <button class="btn btn-primary" id="btn-run-query">
              ${Icons.Search(13)}
              <span>Inspect Flow</span>
            </button>
          </div>

          <!-- Suggested Engineering Questions -->
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 11px; color: var(--text-muted);">
            <span>Suggested inquiries:</span>
            ${state.askAiHistory.map(q => `
              <button 
                type="button" 
                class="btn btn-ghost btn-xs ask-query-btn ${q.id === activeQuery.id ? 'btn-secondary' : ''}" 
                data-query-id="${q.id}"
              >
                ${q.query}
              </button>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Structured Intelligence Result Dossier -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            ${Icons.FileCode(14)}
            <span>Analysis Result: ${activeQuery.query}</span>
          </div>
          <span class="badge badge-info">${activeQuery.category}</span>
        </div>

        <div class="panel-body">
          <!-- 1. Technical / Junior Explanation -->
          <div style="margin-bottom: var(--space-5);">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">
              ${isJunior ? "Summary Explanation (Junior Friendly)" : "Technical Synthesis"}
            </div>
            <p style="font-size: var(--text-sm); color: var(--text-primary); line-height: 1.6; background: var(--bg-canvas); padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              ${isJunior ? activeQuery.juniorExplanation : activeQuery.technicalExplanation}
            </p>
          </div>

          <!-- 2. Architecture Flow Diagram (Step-by-Step execution chain) -->
          <div style="margin-bottom: var(--space-5);">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">
              Execution Flow
            </div>
            
            <div class="flow-diagram-container" style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 14px;">
              ${activeQuery.flowSteps.map((step, idx) => `
                <div class="flow-step-node" style="padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border-default);">
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: var(--text-primary); font-size: 12px;">${step.name}</span>
                    <span style="font-size: 10px; color: var(--text-secondary);">${step.role} • ${step.action}</span>
                  </div>
                </div>
                ${idx < activeQuery.flowSteps.length - 1 ? `
                  <div class="flow-arrow">
                    ${Icons.ArrowRight(14)}
                  </div>
                ` : ""}
              `).join("")}
            </div>
          </div>

          <!-- 3. Sources & Verified Line Evidence (Clickable to inspect) -->
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);">
                Verified Evidence & Source References
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">Click any source to inspect code</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${activeQuery.sources.map(src => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="javascript:void(0)" class="source-ref inspect-source-link" data-file="${src.file}" data-lines="${src.lines}" data-func="${src.func}">
                      ${Icons.FileCode(12)}
                      <span>${src.file}:${src.lines}</span>
                    </a>
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">
                      <code>${src.func}()</code>
                    </span>
                  </div>

                  <button class="btn btn-secondary btn-xs inspect-source-btn" data-file="${src.file}" data-lines="${src.lines}" data-func="${src.func}" title="Inspect code">
                    ${Icons.ExternalLink(11)}
                    <span>Inspect Code</span>
                  </button>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 4. Risk Assessment & Call to Action -->
          <div style="padding: 12px 14px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px;">
                Diagnostic Risk Evaluation
              </div>
              <div style="font-size: 12px; color: var(--text-primary);">
                ${activeQuery.riskAssessment}
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="ask-ai-impact-btn">
                ${Icons.ImpactAnalysis(13)}
                <span>Analyze Impact</span>
              </button>
              <button class="btn btn-primary btn-sm" id="ask-ai-refactor-btn">
                ${Icons.Refactor(13)}
                <span>Refactor Related Code</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

export function attachAskAIEvents() {
  const queryBtns = document.querySelectorAll(".ask-query-btn");
  const runBtn = document.getElementById("btn-run-query");
  const input = document.getElementById("ask-ai-input");
  const inspectLinks = document.querySelectorAll(".inspect-source-link, .inspect-source-btn");
  const impactBtn = document.getElementById("ask-ai-impact-btn");
  const refactorBtn = document.getElementById("ask-ai-refactor-btn");

  queryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const qId = btn.getAttribute("data-query-id");
      store.setState({ activeQueryId: qId });
    });
  });

  if (runBtn && input) {
    runBtn.addEventListener("click", () => {
      const text = input.value.trim().toLowerCase();
      if (!text) return;
      const match = store.getState().askAiHistory.find(q => q.query.toLowerCase().includes(text));
      if (match) {
        store.setState({ activeQueryId: match.id });
      } else {
        store.showToast("Analysis complete for query: " + text, "info");
      }
    });
  }

  inspectLinks.forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const file = el.getAttribute("data-file");
      const lines = el.getAttribute("data-lines");
      const func = el.getAttribute("data-func");

      const activeQuery = store.getState().askAiHistory.find(q => q.id === store.getState().activeQueryId);
      const sourceObj = activeQuery?.sources.find(s => s.file === file);

      store.openCodeInspector(
        `${file} (${func})`,
        file,
        lines,
        sourceObj ? sourceObj.fullSnippet : `# Source for ${file} lines ${lines}\ndef ${func}():\n    pass`
      );
    });
  });

  if (impactBtn) {
    impactBtn.addEventListener("click", () => store.setRoute("app/impact"));
  }

  if (refactorBtn) {
    refactorBtn.addEventListener("click", () => store.setRoute("app/refactor"));
  }
}
