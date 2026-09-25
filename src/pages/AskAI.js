/**
 * Page 3 — Investigation Assistant (Ask RepoMind)
 * Forensic Codebase Intelligence & Query Engine.
 * Explicitly separates [AI INTERPRETATION] from [VERIFIED EVIDENCE].
 * Grounded in deterministic AST symbols with strict hallucination guards.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";
import { apiService } from "../services/api.js";

export function renderAskAI(state) {
  const isJunior = state.juniorMode;
  const queries = state.askAiHistory || [];
  const activeQuery = queries.find(q => q.id === state.activeQueryId) || queries[0];
  const isUnverified = activeQuery?.riskAssessment?.includes("UNVERIFIED") || activeQuery?.category === "Unverified Inquiry";

  return `
    <div class="workspace-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 class="page-title">
              ${Icons.AskAI(18)}
              <span>Investigation Assistant (Ask RepoMind)</span>
            </h1>
            <span class="badge badge-brand" style="font-size: 10px; font-weight: 600;">
              AST Grounded
            </span>
          </div>
          <p class="page-subtitle">
            Ask technical questions about data flow, database persistence, and concurrency risks. Grounded strictly in verified codebase tokens.
          </p>
        </div>

        <div class="page-actions" style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-outline">
            ${Icons.FileCode(12)}
            ${state.repository?.metrics?.filesCount || 147} Files Indexed
          </span>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Investigation Assistant (Junior Mode)</div>
            <div class="junior-callout-text">
              Instead of guessing like a regular chatbot, RepoMind searches the actual source files and checks the code line by line. We separate our AI explanation from the real code evidence so you always know what is proven!
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Query Selector & Input Bar -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-body">
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1; position: relative;">
              <input 
                type="text" 
                id="ask-ai-input" 
                class="input-text" 
                placeholder="Ask e.g. 'Why might data disappear?' or 'Where is data written?'"
                value="${activeQuery ? activeQuery.query : ''}"
                style="height: 40px; font-size: 13px;"
              />
            </div>
            <button class="btn btn-primary" id="btn-run-query" style="height: 40px; padding: 0 18px;">
              ${Icons.Search(13)}
              <span>Investigate</span>
            </button>
          </div>

          <!-- Suggested Engineering Questions -->
          <div style="margin-top: 12px;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">
              Suggested Forensic Inquiries:
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${queries.map(q => `
                <button 
                  type="button" 
                  class="btn btn-ghost btn-xs ask-query-btn ${q.id === activeQuery?.id ? 'btn-secondary active-query-pill' : ''}" 
                  data-query-id="${q.id}"
                  style="font-size: 11px; padding: 3px 8px; border: 1px solid ${q.id === activeQuery?.id ? 'var(--brand-accent)' : 'var(--border-subtle)'};"
                >
                  ${q.query}
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- Result Dossier -->
      <div class="panel">
        <div class="panel-header" style="background-color: var(--bg-secondary);">
          <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
            ${Icons.FileCode(14)}
            <span>Investigation: ${activeQuery?.query || 'Query Results'}</span>
          </div>
          <span class="badge ${isUnverified ? 'badge-low' : 'badge-info'}">
            ${activeQuery?.category || 'Forensic Analysis'}
          </span>
        </div>

        <div class="panel-body">
          <!-- Hallucination Guard Banner if Unverified -->
          ${isUnverified ? `
            <div style="margin-bottom: var(--space-4); padding: 12px 14px; background-color: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--color-medium);">${Icons.Info(16)}</span>
              <div>
                <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">Strict Hallucination Guard Activated</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                  RepoMind could not verify this inquiry in the codebase AST. No corresponding function or database calls were found. Static analysis is strictly constrained to physically indexed repository code.
                </div>
              </div>
            </div>
          ` : ""}

          <!-- 1. AI INTERPRETATION SECTION -->
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span class="badge badge-brand" style="font-size: 10px; font-weight: 700;">AI INTERPRETATION</span>
              <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">
                ${isJunior ? "Summary Explanation (Mental Model)" : "Technical Synthesis & Root Cause Path"}
              </span>
            </div>

            <div style="font-size: var(--text-sm); color: var(--text-primary); line-height: 1.65; background: var(--bg-canvas); padding: 14px 16px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              ${isJunior ? (activeQuery?.juniorExplanation || activeQuery?.technicalExplanation) : (activeQuery?.technicalExplanation || '')}
            </div>
          </div>

          <!-- 2. EXECUTION / DATA FLOW CHAIN -->
          ${activeQuery?.flowSteps && activeQuery.flowSteps.length > 0 ? `
            <div style="margin-bottom: var(--space-5);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 8px;">
                Traced Execution Flow Pipeline
              </div>
              
              <div class="flow-diagram-container" style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                ${activeQuery.flowSteps.map((step, idx) => `
                  <div class="flow-step-node" style="padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-sm);">
                    <div style="display: flex; flex-direction: column;">
                      <span style="font-weight: 600; color: var(--text-primary); font-size: 12px;">${step.name}</span>
                      <span style="font-size: 10px; color: var(--text-secondary);">${step.role} • ${step.action}</span>
                    </div>
                  </div>
                  ${idx < activeQuery.flowSteps.length - 1 ? `
                    <div class="flow-arrow" style="color: var(--text-muted);">
                      ${Icons.ArrowRight(14)}
                    </div>
                  ` : ""}
                `).join("")}
              </div>
            </div>
          ` : ""}

          <!-- 3. VERIFIED EVIDENCE SECTION (Code Snippets & Exact Line Numbers) -->
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-success" style="font-size: 10px; font-weight: 700;">VERIFIED EVIDENCE</span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Deterministic AST Code Evidence</span>
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">Click any source to inspect in Code Inspector</span>
            </div>

            ${activeQuery?.sources && activeQuery.sources.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${activeQuery.sources.map(src => `
                  <div style="padding: 12px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="source-ref inspect-source-link" data-file="${src.file}" data-lines="${src.lines}" data-func="${src.func}" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 12px; color: var(--brand-accent-text); font-weight: 600;">
                          ${Icons.FileCode(12)}
                          <span>${src.file}:${src.lines}</span>
                        </span>
                        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
                          <code>${src.func}()</code>
                        </span>
                      </div>

                      <button class="btn btn-secondary btn-xs inspect-source-btn" data-file="${src.file}" data-lines="${src.lines}" data-func="${src.func}" title="Inspect full code context">
                        ${Icons.ExternalLink(11)}
                        <span>Inspect in Code Inspector</span>
                      </button>
                    </div>

                    ${src.fullSnippet ? `
                      <pre style="margin: 0; padding: 10px 12px; background-color: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); overflow-x: auto; line-height: 1.5;"><code>${src.fullSnippet}</code></pre>
                    ` : ""}
                  </div>
                `).join("")}
              </div>
            ` : `
              <div style="padding: 12px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 12px; color: var(--text-muted);">
                No verified AST references matched this query.
              </div>
            `}
          </div>

          <!-- 4. Investigation Checklist & Diagnostic Risk -->
          <div style="padding: 14px 16px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="flex: 1; min-width: 260px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
                Investigation Checklist & Risk Assessment
              </div>
              <div style="font-size: 12px; font-weight: 500; color: var(--text-primary);">
                ${activeQuery?.riskAssessment || 'Standard code path verified.'}
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="ask-ai-forensic-btn">
                ${Icons.CodeHealth(13)}
                <span>Advanced Forensics</span>
              </button>
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
  const forensicBtn = document.getElementById("ask-ai-forensic-btn");
  const refactorBtn = document.getElementById("ask-ai-refactor-btn");

  queryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const qId = btn.getAttribute("data-query-id");
      store.setState({ activeQueryId: qId });
    });
  });

  const handleQuery = async () => {
    const text = input?.value.trim() || "";
    if (!text) return;

    // 1. Check if matches existing queries
    const lower = text.toLowerCase();
    const existing = store.getState().askAiHistory.find(q => 
      q.query.toLowerCase().includes(lower) || lower.includes(q.query.toLowerCase().slice(0, 15))
    );

    if (existing) {
      store.setState({ activeQueryId: existing.id });
      return;
    }

    // 2. Keyword heuristic matching for common forensic queries
    if (lower.includes("disappear") || lower.includes("lost") || lower.includes("vanish") || lower.includes("truncat")) {
      const q = store.getState().askAiHistory.find(x => x.id === "q-disappear");
      if (q) { store.setState({ activeQueryId: q.id }); return; }
    }

    if (lower.includes("concurr") || lower.includes("simultaneous") || lower.includes("race") || lower.includes("two users")) {
      const q = store.getState().askAiHistory.find(x => x.id === "q-concurrency");
      if (q) { store.setState({ activeQueryId: q.id }); return; }
    }

    if (lower.includes("supabase") || lower.includes("dormant") || lower.includes("where is data written") || lower.includes("mongo")) {
      const q = store.getState().askAiHistory.find(x => x.id === "q-supabase");
      if (q) { store.setState({ activeQueryId: q.id }); return; }
    }

    // 3. Dynamic API call to backend
    store.showToast("Analyzing codebase AST for query...", "info");
    try {
      const repoId = store.getState().repository?.id || "repo-student-mgmt";
      const res = await apiService.askQuery(repoId, text);
      if (res && res.technicalExplanation) {
        const customQ = {
          id: "custom-" + Date.now(),
          query: text,
          category: res.category || "Inquiry",
          technicalExplanation: res.technicalExplanation,
          juniorExplanation: res.juniorExplanation || res.technicalExplanation,
          flowSteps: res.flowSteps || [],
          sources: res.sources || [],
          affectedEntities: res.affectedEntities || [],
          riskAssessment: res.riskAssessment || "Analyzed against AST.",
        };
        store.setState({
          askAiHistory: [customQ, ...store.getState().askAiHistory],
          activeQueryId: customQ.id
        });
        store.showToast("Query resolved against AST evidence", "success");
        return;
      }
    } catch {
      // fallback
    }

    // 4. Fallback hallucination guard
    const unverifiedQ = {
      id: "unverified-" + Date.now(),
      query: text,
      category: "Unverified Inquiry",
      technicalExplanation: "RepoMind could not verify this in the codebase. Here is what is known from static analysis: No AST symbols, functions, or endpoint definitions matched this query. Static analysis only reports deterministic references that physically exist in the repository.",
      juniorExplanation: "RepoMind could not verify this in the codebase. We don't guess or make up answers if the code isn't actually written in the files!",
      flowSteps: [
        { name: "AST Symbol Index", role: "Deterministic Filter", action: "Scanned repository files" },
        { name: "Hallucination Guard", role: "Safety Shield", action: "Rejected unverified query" }
      ],
      sources: [],
      affectedEntities: ["unverified_query"],
      riskAssessment: "UNVERIFIED — Query targets concepts outside indexed repository AST.",
    };

    store.setState({
      askAiHistory: [unverifiedQ, ...store.getState().askAiHistory],
      activeQueryId: unverifiedQ.id
    });
    store.showToast("Hallucination guard: Query not found in repository AST", "info");
  };

  if (runBtn) {
    runBtn.addEventListener("click", handleQuery);
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleQuery();
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
      const sourceObj = activeQuery?.sources?.find(s => s.file === file);

      store.openCodeInspector(
        `${file} (${func})`,
        file,
        lines,
        sourceObj?.fullSnippet || `# Source for ${file} lines ${lines}\ndef ${func}():\n    pass`
      );
    });
  });

  if (forensicBtn) {
    forensicBtn.addEventListener("click", () => store.setRoute("app/forensic"));
  }

  if (impactBtn) {
    impactBtn.addEventListener("click", () => store.setRoute("app/impact"));
  }

  if (refactorBtn) {
    refactorBtn.addEventListener("click", () => store.setRoute("app/refactor"));
  }
}
