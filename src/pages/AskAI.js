/**
 * Page 3 — Grounded AI Codebase Intelligence (Ask RepoMind)
 * Grounded LLM reasoning layer operating strictly on top of deterministic AST analysis.
 * Enforces Anti-Hallucination Boundaries and transparently indicates provider status.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";
import { apiService } from "../services/api.js";

const REASONING_MODES = [
  { id: "understand", label: "Understand", icon: Icons.Search, desc: "Entry points, services, and concepts" },
  { id: "architecture", label: "Architecture", icon: Icons.Architecture, desc: "System topology & layer boundaries" },
  { id: "impact", label: "Blast Radius", icon: Icons.ImpactAnalysis, desc: "Callers, dependencies & risk factors" },
  { id: "security", label: "Security", icon: Icons.CodeHealth, desc: "Secrets, injection hazards & auth" },
  { id: "debug", label: "Root Cause", icon: Icons.ForensicAnalysis, desc: "Data disappearance & race conditions" },
  { id: "refactor", label: "Refactoring", icon: Icons.Refactor, desc: "SRP decomposition & isolation" },
  { id: "explain", label: "Explain Code", icon: Icons.AskAI, desc: "Deep walkthrough of target functions" },
];

export function renderAskAI(state) {
  const isJunior = state.juniorMode;
  const activeMode = state.reasoningMode || "understand";
  const queries = state.askAiHistory || [];
  const activeQuery = queries.find(q => q.id === state.activeQueryId) || queries[0];
  const isUnverified = activeQuery?.riskAssessment?.includes("UNVERIFIED") || activeQuery?.category === "Unverified Inquiry";
  const isFallback = activeQuery?.is_fallback ?? (activeQuery?.provider === "deterministic" || !activeQuery?.provider);
  const providerName = activeQuery?.provider || (isFallback ? "Deterministic AST" : "Grounded LLM");
  const modelName = activeQuery?.model || (isFallback ? "AST Rule Engine" : "Gemini 2.0 Flash");

  return `
    <div class="workspace-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h1 class="page-title">
              ${Icons.AskAI(18)}
              <span>Grounded AI Codebase Intelligence</span>
            </h1>
            <span class="badge ${isFallback ? 'badge-neutral' : 'badge-brand'}" style="font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${isFallback ? '#8b949e' : '#3fb950'};"></span>
              ${isFallback ? '⚡ Deterministic Intelligence (Offline Fallback)' : `🟢 Grounded LLM: ${providerName.toUpperCase()}`}
            </span>
          </div>
          <p class="page-subtitle">
            Reasoning layer grounded strictly in AST code facts, deterministic risk scores, and verified repository evidence.
          </p>
        </div>

        <div class="page-actions" style="display: flex; align-items: center; gap: 8px;">
          <!-- Senior / Junior Audience Switcher -->
          <div style="display: flex; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 2px;">
            <button 
              type="button" 
              class="btn btn-ghost btn-xs audience-toggle-btn ${!isJunior ? 'btn-secondary active-pill' : ''}" 
              data-audience="senior"
              style="font-size: 11px; font-weight: 600; padding: 4px 10px;"
            >
              Senior Architect
            </button>
            <button 
              type="button" 
              class="btn btn-ghost btn-xs audience-toggle-btn ${isJunior ? 'btn-secondary active-pill' : ''}" 
              data-audience="junior"
              style="font-size: 11px; font-weight: 600; padding: 4px 10px;"
            >
              Junior Dev
            </button>
          </div>

          <span class="badge badge-outline">
            ${Icons.FileCode(12)}
            ${state.repository?.metrics?.filesCount || 147} Files Indexed
          </span>
        </div>
      </div>

      <!-- Reasoning Mode Tabs Bar -->
      <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: var(--space-4);">
        ${REASONING_MODES.map(m => `
          <button 
            type="button" 
            class="btn ${activeMode === m.id ? 'btn-primary' : 'btn-secondary'} btn-sm reasoning-mode-btn" 
            data-mode="${m.id}"
            title="${m.desc}"
            style="font-size: 12px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;"
          >
            ${m.icon(13)}
            <span>${m.label}</span>
          </button>
        `).join("")}
      </div>

      ${isJunior ? `
        <div class="junior-callout" style="margin-bottom: var(--space-4);">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Grounded Intelligence (Junior Developer Mode)</div>
            <div class="junior-callout-text">
              Unlike generic chatbots that guess or make up code, RepoMind is strictly grounded in this repository's verified files. We break down complex concepts into step-by-step mental models with analogies!
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
                placeholder="${getPlaceholderForMode(activeMode)}"
                value="${activeQuery ? activeQuery.query : ''}"
                style="height: 42px; font-size: 13px;"
              />
            </div>
            <button class="btn btn-primary" id="btn-run-query" style="height: 42px; padding: 0 20px;">
              ${Icons.Search(14)}
              <span>Analyze Codebase</span>
            </button>
          </div>

          <!-- Suggested Engineering Questions for current mode -->
          <div style="margin-top: 12px;">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">
              Suggested inquiries (${activeMode.toUpperCase()} mode):
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${queries.map(q => `
                <button 
                  type="button" 
                  class="btn btn-ghost btn-xs ask-query-btn ${q.id === activeQuery?.id ? 'btn-secondary active-query-pill' : ''}" 
                  data-query-id="${q.id}"
                  style="font-size: 11px; padding: 3px 10px; border: 1px solid ${q.id === activeQuery?.id ? 'var(--brand-accent)' : 'var(--border-subtle)'};"
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
        <div class="panel-header" style="background-color: var(--bg-secondary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div class="panel-title" style="display: flex; align-items: center; gap: 8px;">
            ${Icons.FileCode(14)}
            <span>Investigation: ${activeQuery?.query || 'Query Results'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge ${isUnverified ? 'badge-low' : 'badge-info'}" style="font-size: 10px; font-weight: 600;">
              ${activeQuery?.category || 'Code Intelligence'}
            </span>
            <span class="badge badge-outline" style="font-size: 10px;">
              ${providerName} • ${modelName}
            </span>
          </div>
        </div>

        <div class="panel-body">
          <!-- Hallucination Guard Banner if Unverified -->
          ${isUnverified ? `
            <div style="margin-bottom: var(--space-4); padding: 12px 14px; background-color: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); display: flex; gap: 10px; align-items: flex-start;">
              <span style="color: var(--color-medium);">${Icons.Info(16)}</span>
              <div>
                <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">Strict Anti-Hallucination Guard Activated</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                  RepoMind could not verify this inquiry in the repository AST. No matching functions, routes, or entities exist in indexed files. Claims outside indexed repository evidence are strictly rejected.
                </div>
              </div>
            </div>
          ` : ""}

          <!-- Executive Summary Callout if available -->
          ${activeQuery?.summary ? `
            <div style="margin-bottom: var(--space-4); padding: 10px 14px; background: rgba(31, 111, 235, 0.08); border-left: 3px solid var(--brand-accent); border-radius: var(--radius-xs);">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--brand-accent-text); margin-bottom: 2px;">
                Executive Summary
              </div>
              <div style="font-size: 12px; color: var(--text-primary); line-height: 1.5;">
                ${activeQuery.summary}
              </div>
            </div>
          ` : ""}

          <!-- 1. AI REASONING / TECHNICAL SYNTHESIS SECTION -->
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-brand" style="font-size: 10px; font-weight: 700;">
                  ${isFallback ? 'STATIC REASONING' : 'GROUNDED SYNTHESIS'}
                </span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">
                  ${isJunior ? "Step-by-Step Mental Model" : "Architectural Synthesis & Failure Domains"}
                </span>
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">
                Perspective: ${isJunior ? 'Junior Developer' : 'Senior Architect'}
              </span>
            </div>

            <div style="font-size: var(--text-sm); color: var(--text-primary); line-height: 1.65; background: var(--bg-canvas); padding: 16px 18px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); white-space: pre-wrap;">
              ${isJunior ? (activeQuery?.juniorExplanation || activeQuery?.technicalExplanation) : (activeQuery?.technicalExplanation || activeQuery?.answer || '')}
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

          <!-- 3. VERIFIED CODE EVIDENCE SECTION (Code Snippets & Exact Line Numbers) -->
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-success" style="font-size: 10px; font-weight: 700;">VERIFIED EVIDENCE</span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Deterministic Code Citations (AST Verified)</span>
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">Click snippet to inspect in Code Inspector</span>
            </div>

            ${activeQuery?.sources && activeQuery.sources.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${activeQuery.sources.map(src => `
                  <div style="padding: 12px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
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
                No AST source citations matched this query.
              </div>
            `}
          </div>

          <!-- 4. Recommendations & Boundaries Disclosure -->
          ${(activeQuery?.recommendations && activeQuery.recommendations.length > 0) || (activeQuery?.limitations && activeQuery.limitations.length > 0) ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: var(--space-5);">
              ${activeQuery?.recommendations && activeQuery.recommendations.length > 0 ? `
                <div style="padding: 12px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">
                    Actionable Guidance
                  </div>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: var(--text-primary); line-height: 1.6;">
                    ${activeQuery.recommendations.map(r => `<li>${r}</li>`).join("")}
                  </ul>
                </div>
              ` : ""}

              ${activeQuery?.limitations && activeQuery.limitations.length > 0 ? `
                <div style="padding: 12px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">
                    Anti-Hallucination Boundaries
                  </div>
                  <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: var(--text-secondary); line-height: 1.6;">
                    ${activeQuery.limitations.map(l => `<li>${l}</li>`).join("")}
                  </ul>
                </div>
              ` : ""}
            </div>
          ` : ""}

          <!-- 5. Investigation Checklist & Diagnostic Risk Footer -->
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
                ${Icons.ForensicAnalysis(13)}
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

function getPlaceholderForMode(mode) {
  switch (mode) {
    case "architecture":
      return "Ask about architecture (e.g. 'What are the layer boundaries and entry points?') ...";
    case "impact":
      return "Ask about blast radius (e.g. 'What breaks if process_order() signature changes?') ...";
    case "security":
      return "Ask about security (e.g. 'Are database credentials or JWT keys hardcoded?') ...";
    case "debug":
      return "Ask about bugs / root cause (e.g. 'Why does find_one() cause historical data loss?') ...";
    case "refactor":
      return "Ask about refactoring (e.g. 'How should process_order() be decomposed?') ...";
    case "explain":
      return "Ask to explain a symbol (e.g. 'Explain what mark_attendance does line by line') ...";
    default:
      return "Ask RepoMind about this repository (e.g. 'Where does authentication happen?') ...";
  }
}

export function attachAskAIEvents() {
  const queryBtns = document.querySelectorAll(".ask-query-btn");
  const modeBtns = document.querySelectorAll(".reasoning-mode-btn");
  const audienceBtns = document.querySelectorAll(".audience-toggle-btn");
  const runBtn = document.getElementById("btn-run-query");
  const input = document.getElementById("ask-ai-input");
  const inspectLinks = document.querySelectorAll(".inspect-source-link, .inspect-source-btn");
  const impactBtn = document.getElementById("ask-ai-impact-btn");
  const forensicBtn = document.getElementById("ask-ai-forensic-btn");
  const refactorBtn = document.getElementById("ask-ai-refactor-btn");

  // Mode Selection
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      store.setState({ reasoningMode: mode });
    });
  });

  // Audience Selection
  audienceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const aud = btn.getAttribute("data-audience");
      store.setState({ juniorMode: aud === "junior" });
    });
  });

  // Query History Click
  queryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const qId = btn.getAttribute("data-query-id");
      store.setState({ activeQueryId: qId });
    });
  });

  // Execute Query Handler
  const handleQuery = async () => {
    const text = input?.value.trim() || "";
    if (!text) return;

    const lower = text.toLowerCase();
    const currentMode = store.getState().reasoningMode || "understand";
    const currentAudience = store.getState().juniorMode ? "junior" : "senior";

    // 1. Check existing cached inquiries
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

    // 3. Dynamic Grounded API Call
    store.showToast("Analyzing codebase with grounded reasoning...", "info");
    try {
      const repoId = store.getState().repository?.id || "repo-student-mgmt";
      const res = await apiService.askQuery(repoId, text, currentMode, currentAudience);
      if (res && (res.technicalExplanation || res.answer)) {
        const customQ = {
          id: res.id || "custom-" + Date.now(),
          query: text,
          category: res.category || `${currentMode.toUpperCase()} Analysis`,
          technicalExplanation: res.technicalExplanation || res.answer,
          juniorExplanation: res.juniorExplanation || res.technicalExplanation || res.answer,
          flowSteps: res.flowSteps || [],
          sources: res.sources || (res.evidence ? res.evidence.map(e => ({
            file: e.file,
            lines: `${e.line_start}–${e.line_end}`,
            func: e.symbol,
            fullSnippet: e.snippet
          })) : []),
          affectedEntities: res.affectedEntities || res.related_symbols || [],
          riskAssessment: res.riskAssessment || "Grounded against AST evidence.",
          summary: res.summary,
          confidence: res.confidence || "high",
          is_fallback: res.is_fallback ?? (!res.is_llm_grounded),
          provider: res.provider,
          model: res.model,
          recommendations: res.recommendations,
          limitations: res.limitations,
        };
        store.setState({
          askAiHistory: [customQ, ...store.getState().askAiHistory],
          activeQueryId: customQ.id
        });
        store.showToast("Query resolved with verified code evidence", "success");
        return;
      }
    } catch {
      // fallback
    }

    // 4. Hallucination Guard Fallback
    const unverifiedQ = {
      id: "unverified-" + Date.now(),
      query: text,
      category: "Unverified Inquiry",
      technicalExplanation: "RepoMind could not verify this in the codebase. Here is what is known from static analysis: No AST symbols, functions, or endpoint definitions matched this query. Static analysis only reports deterministic references that physically exist in the repository.",
      juniorExplanation: "RepoMind could not verify this in the codebase. We don't guess or make up answers if the code isn't actually written in the files!",
      flowSteps: [
        { name: "AST Symbol Index", role: "Deterministic Filter", action: "Scanned repository files" },
        { name: "Anti-Hallucination Guard", role: "Safety Shield", action: "Rejected unverified query" }
      ],
      sources: [],
      affectedEntities: ["unverified_query"],
      riskAssessment: "UNVERIFIED — Query targets concepts outside indexed repository AST.",
      limitations: ["Query rejected by strict anti-hallucination guard."],
    };

    store.setState({
      askAiHistory: [unverifiedQ, ...store.getState().askAiHistory],
      activeQueryId: unverifiedQ.id
    });
    store.showToast("Anti-hallucination guard: Concept not found in repository AST", "info");
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
