/**
 * Home Page Component (Route: /)
 * Master Public Landing Page strictly implementing Section 20:
 * 
 * Hero:
 * RepoMind
 * Understand your codebase.
 * Refactor it safely.
 * 
 * Supporting text:
 * RepoMind uses AI-powered repository understanding to analyze architecture,
 * dependencies, risks and refactoring opportunities without forcing developers
 * to manually explore thousands of files.
 * 
 * 5-Step Workflow:
 * 01 CONNECT -> 02 UNDERSTAND -> 03 DETECT -> 04 REFACTOR -> 05 VERIFY
 * 
 * Sections:
 * - What is RepoMind?
 * - Why RepoMind?
 * - Key Capabilities
 * - Trust & Safety
 * - Get Started
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderHomePage(state) {
  return `
    <div class="public-site page-fade-in">
      ${renderPublicHeader(state)}

      <!-- 1. HERO SECTION (Section 20) -->
      <header class="public-hero" style="padding-top: 56px; padding-bottom: 40px;">
        <div class="hero-pill" style="margin-bottom: 20px;">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.Logo(16)}
            <span class="hero-pill-badge">RepoMind</span>
          </span>
          <span style="color: var(--border-default);">|</span>
          <span>Autonomous Codebase Understanding & Safe Refactoring Agent</span>
        </div>

        <h1 class="hero-headline" style="font-size: 44px; font-weight: 800; letter-spacing: -1.2px; line-height: 1.15; margin-bottom: 16px;">
          Understand your codebase.<br/>
          <span style="color: var(--brand-accent-text);">Refactor it safely.</span>
        </h1>

        <p class="hero-subtext" style="max-width: 680px; font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 28px;">
          RepoMind uses AI-powered repository understanding to analyze architecture, dependencies, risks and refactoring opportunities without forcing developers to manually explore thousands of files.
        </p>

        <!-- INSTANT REPOSITORY INGRESS BAR -->
        <div style="width: 100%; max-width: 760px; background-color: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: var(--shadow-lg); margin-bottom: 24px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                ${Icons.Repository(13)}
                <span>Repository Ingress</span>
              </span>
              <span style="font-size: 11px; color: var(--color-success-light); font-weight: 500;">
                ● AST Analysis Ready
              </span>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 280px; position: relative;">
                <input 
                  type="url" 
                  id="home-repo-input" 
                  class="input-text" 
                  placeholder="https://github.com/owner/repository" 
                  value="https://github.com/university-sys/student-management-system"
                  style="width: 100%; height: 42px; font-size: 13px; font-family: var(--font-mono); padding: 0 14px; background-color: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm);"
                />
              </div>

              <button 
                class="btn btn-primary" 
                id="home-btn-analyze" 
                style="height: 42px; padding: 0 20px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;"
              >
                ${Icons.Play(12)}
                <span>Analyze Repository</span>
              </button>

              <button 
                class="btn btn-secondary" 
                id="home-btn-demo" 
                style="height: 42px; padding: 0 18px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 8px; border-color: var(--border-strong);"
              >
                ${Icons.CodeHealth(13)}
                <span>Explore Demo</span>
              </button>
            </div>

            <!-- Quick Demo Pills -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
              <span style="font-size: 11px; color: var(--text-muted);">Quick demo:</span>
              <button type="button" class="btn btn-ghost btn-xs home-sample-pill" data-url="https://github.com/university-sys/student-management-system" style="font-size: 11px; padding: 2px 8px; font-family: var(--font-mono); border: 1px solid var(--border-subtle);">
                student-management-system (Demo Case)
              </button>
              <button type="button" class="btn btn-ghost btn-xs home-sample-pill" data-url="https://github.com/fastapi/fastapi" style="font-size: 11px; padding: 2px 8px; font-family: var(--font-mono); border: 1px solid var(--border-subtle);">
                fastapi/fastapi
              </button>
              <button type="button" class="btn btn-ghost btn-xs home-sample-pill" data-url="https://github.com/pallets/flask" style="font-size: 11px; padding: 2px 8px; font-family: var(--font-mono); border: 1px solid var(--border-subtle);">
                pallets/flask
              </button>
            </div>
          </div>
        </div>

        <!-- 5-STEP WORKFLOW DIAGRAM (Section 20) -->
        <div class="hero-workflow-diagram" style="max-width: 900px; margin-top: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); font-weight: 600; margin-bottom: 12px; text-align: left;">
            Continuous Engineering Workflow
          </div>
          <div class="workflow-track">
            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">01</span>
              <span class="workflow-node-title" style="font-weight: 600;">CONNECT</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">GitHub URL or Git</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">02</span>
              <span class="workflow-node-title" style="font-weight: 600;">UNDERSTAND</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">AST Symbols & Architecture</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">03</span>
              <span class="workflow-node-title" style="font-weight: 600;">DETECT</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Risks & Concurrency Hazards</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">04</span>
              <span class="workflow-node-title" style="font-weight: 600;">REFACTOR</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Human-in-the-Loop Studio</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node active-highlight" style="border-color: var(--brand-accent);">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">05</span>
              <span class="workflow-node-title" style="font-weight: 600;">VERIFY</span>
              <span style="font-size: 10px; color: var(--brand-accent-text); margin-top: 2px;">Zero Regressions Proved</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 2. WHAT IS REPOMIND? (Section 20) -->
      <section class="public-section" id="what-is-repomind" style="padding: 40px 0;">
        <div class="section-container" style="max-width: 900px; text-align: center;">
          <div class="section-tag">Product Overview</div>
          <h2 class="section-title">What is RepoMind?</h2>
          <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.65; max-width: 760px; margin: 12px auto 0;">
            RepoMind is an autonomous codebase understanding and safe refactoring agent. Instead of requiring developers to spend days manually grepping through unfamiliar directories or reading stale documentation, RepoMind parses the repository's Abstract Syntax Tree (AST), extracts module relationships, traces end-to-end data flows, detects structural and concurrency risks, and safely plans verified refactorings.
          </p>
        </div>
      </section>

      <!-- 3. WHY REPOMIND? (Section 20) -->
      <section class="public-section" id="why-repomind" style="padding: 30px 0 40px 0;">
        <div class="section-container" style="max-width: 900px;">
          <div class="section-header" style="text-align: center; margin-bottom: 24px;">
            <div class="section-tag">The Problem & Solution</div>
            <h2 class="section-title">Why RepoMind?</h2>
            <p style="font-size: 14px; color: var(--text-secondary); max-width: 640px; margin: 8px auto 0;">
              Software engineering spend is dominated by code comprehension and fear of regression.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <!-- Without RepoMind -->
            <div style="background-color: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--color-high);">
                <span>✕</span>
                <span style="font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Without RepoMind</span>
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: var(--text-secondary); line-height: 1.8;">
                <li>Manual grepping across hundreds of files to find where functions are called</li>
                <li>Fear of changing code due to invisible downstream blast radius</li>
                <li>Single-record query bugs silently truncating multi-session customer data</li>
                <li>Un-fenced concurrency race conditions corrupting array states under load</li>
                <li>Generic AI chatbots that hallucinate non-existent functions and files</li>
              </ul>
            </div>

            <!-- With RepoMind -->
            <div style="background-color: var(--bg-secondary); border: 1px solid var(--brand-accent-border); border-radius: var(--radius-md); padding: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--brand-accent-text);">
                <span>✓</span>
                <span style="font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">With RepoMind</span>
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: var(--text-primary); line-height: 1.8;">
                <li>Automated AST parsing maps module topology and entry points in seconds</li>
                <li>Caller-callee call graphs measure exact blast radius before editing</li>
                <li>Deterministic query detection catches historical truncation (<code style="font-size: 11px;">find_one()</code>)</li>
                <li>Concurrency hazard proofs with step-by-step interleaving timelines</li>
                <li>AST-grounded AI reasoning with strict hallucination guards</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. KEY CAPABILITIES (Section 20) -->
      <section class="public-section" id="capabilities" style="padding: 40px 0;">
        <div class="section-container" style="max-width: 900px;">
          <div class="section-header" style="text-align: center; margin-bottom: 28px;">
            <div class="section-tag">Platform Features</div>
            <h2 class="section-title">Key Capabilities</h2>
            <p style="font-size: 14px; color: var(--text-secondary); max-width: 640px; margin: 8px auto 0;">
              Precision developer tooling built for serious codebase investigation.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <!-- Cap 1 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--brand-accent-text);">01 Architecture</div>
              <div class="what-card-title">System Topology</div>
              <div class="what-card-body" style="font-size: 12px; line-height: 1.5;">
                Extract module boundaries, entry routes, and caller-callee graphs without reading code line-by-line.
              </div>
            </div>

            <!-- Cap 2 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-high);">02 Risk Detection</div>
              <div class="what-card-title">Concurrency & Races</div>
              <div class="what-card-body" style="font-size: 12px; line-height: 1.5;">
                Detects un-fenced <code style="font-size: 11px;">$push</code> mutations on arrays and generates millisecond collision proofs.
              </div>
            </div>

            <!-- Cap 3 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-medium);">03 Database Forensics</div>
              <div class="what-card-title">Active vs Dormant DBs</div>
              <div class="what-card-body" style="font-size: 12px; line-height: 1.5;">
                Distinguishes between configured clients and real write paths (e.g. MongoDB active vs Supabase dormant).
              </div>
            </div>

            <!-- Cap 4 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--brand-accent-text);">04 Intelligence</div>
              <div class="what-card-title">Ask RepoMind</div>
              <div class="what-card-body" style="font-size: 12px; line-height: 1.5;">
                Inquire about data flow and authentication with verified AST citations and strict hallucination guards.
              </div>
            </div>

            <!-- Cap 5 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-success-light);">05 Blast Radius</div>
              <div class="what-card-title">Impact Analysis</div>
              <div class="what-card-body" style="font-size: 12px; line-height: 1.5;">
                Trace downstream callers and affected test suites before modifying sensitive business services.
              </div>
            </div>

            <!-- Cap 6 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-success-light);">06 Safe Refactor</div>
              <div class="what-card-title">Verified Refactoring</div>
              <div class="what-card-body" style="font-size: 12px; line-height: 1.5;">
                Evidence-backed decomposition proposals with automated regression testing proving zero breaks.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. TRUST & SAFETY (Section 20) -->
      <section class="public-section" id="trust" style="padding: 30px 0 40px 0;">
        <div class="section-container" style="max-width: 900px;">
          <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="badge badge-success" style="font-size: 10px; font-weight: 700;">TRUST & SAFETY</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary);">
                Deterministic AST Ground Truth + Human in the Loop
              </h3>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              RepoMind never blindly commits code. All architectural traces and code references are extracted through deterministic AST parsing. When refactoring proposals are generated, they follow a strict governance pipeline:
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 10px 14px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 11px;">
              <span style="color: var(--color-success-light); font-weight: 600;">01 ANALYZE</span>
              <span style="color: var(--text-muted);">→</span>
              <span style="color: var(--color-success-light); font-weight: 600;">02 PROPOSE</span>
              <span style="color: var(--text-muted);">→</span>
              <span style="color: var(--brand-accent-text); font-weight: 600;">03 REVIEW (Human)</span>
              <span style="color: var(--text-muted);">→</span>
              <span style="color: var(--color-success-light); font-weight: 600;">04 TEST (42 Suites)</span>
              <span style="color: var(--text-muted);">→</span>
              <span style="color: var(--color-success-light); font-weight: 600;">05 APPROVE</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. GET STARTED (Section 20) -->
      <section class="final-cta-section" style="padding: 48px 0;">
        <div class="section-container" style="text-align: center; max-width: 680px;">
          <h2 style="font-size: 28px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; letter-spacing: -0.5px;">
            Ready to understand your codebase?
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">
            Analyze any repository immediately or explore our pre-indexed university demo.
          </p>

          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="home-footer-analyze" style="padding: 10px 22px; font-size: 13px; font-weight: 600;">
              ${Icons.Play(12)}
              <span>Analyze Repository</span>
            </button>
            <button class="btn btn-secondary" id="home-footer-demo" style="padding: 10px 20px; font-size: 13px; font-weight: 500;">
              ${Icons.CodeHealth(13)}
              <span>Explore Demo</span>
            </button>
          </div>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

export function attachHomePageEvents() {
  attachPublicHeaderEvents();
  attachPublicFooterEvents();

  const analyzeBtn = document.getElementById("home-btn-analyze");
  const demoBtn = document.getElementById("home-btn-demo");
  const footerAnalyzeBtn = document.getElementById("home-footer-analyze");
  const footerDemoBtn = document.getElementById("home-footer-demo");
  const repoInput = document.getElementById("home-repo-input");
  const samplePills = document.querySelectorAll(".home-sample-pill");

  if (analyzeBtn && repoInput) {
    analyzeBtn.addEventListener("click", () => {
      const url = repoInput.value.trim();
      if (url) {
        store.connectRepository(url, "main");
      }
    });

    repoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const url = repoInput.value.trim();
        if (url) {
          store.connectRepository(url, "main");
        }
      }
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      store.exploreDemo();
    });
  }

  if (footerAnalyzeBtn) {
    footerAnalyzeBtn.addEventListener("click", () => {
      if (repoInput) {
        repoInput.scrollIntoView({ behavior: "smooth", block: "center" });
        repoInput.focus();
      } else {
        store.setRoute("app/repository");
      }
    });
  }

  if (footerDemoBtn) {
    footerDemoBtn.addEventListener("click", () => {
      store.exploreDemo();
    });
  }

  samplePills.forEach(pill => {
    pill.addEventListener("click", () => {
      const url = pill.getAttribute("data-url");
      if (url && repoInput) {
        repoInput.value = url;
        if (url.includes("student-management-system")) {
          store.exploreDemo();
        } else {
          store.connectRepository(url, "main");
        }
      }
    });
  });
}
