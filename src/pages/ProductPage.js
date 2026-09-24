/**
 * Product Page Component (Route: /product)
 * Purpose: Answer "What exactly is RepoMind?"
 * Explains the complete product concept and how its 8 capabilities work together.
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderProductPage(state) {
  const capabilities = [
    {
      num: "01",
      title: "Repository Understanding",
      tag: "Topology & AST",
      desc: "RepoMind parses the full repository AST, extracting symbols, imports, functions, and cross-file dependencies into an indexable mental model.",
      detail: "Eliminates the multi-day friction of manually exploring unfamiliar folders and file hierarchies."
    },
    {
      num: "02",
      title: "Architecture Intelligence",
      tag: "System Boundaries",
      desc: "Maps system communication layers to answer 'what talks to what?' between web clients, API gateways, background workers, and PostgreSQL/Redis.",
      detail: "Identifies architectural leaks, direct database bypasses, and unmonitored external calls."
    },
    {
      num: "03",
      title: "Risk & Smell Detection",
      tag: "Diagnostic Rules",
      desc: "Applies static rule evaluations to detect security vulnerabilities (hardcoded secrets, injection risks) and structural debt (monolithic functions).",
      detail: "Every finding includes exact file citations and line numbers (e.g. config.py:27)."
    },
    {
      num: "04",
      title: "Impact Analysis",
      tag: "Call-Graph Radius",
      desc: "Traces static call graphs upstream and downstream to calculate the exact blast radius before a function is modified.",
      detail: "Identifies the 6 affected files, 9 callers, and 4 specific test suites required for verification."
    },
    {
      num: "05",
      title: "Safe Refactoring",
      tag: "Decomposition Plans",
      desc: "Generates evidence-backed refactoring plans that split complex multi-responsibility functions into focused single-responsibility units.",
      detail: "Preserves orchestrator function signatures so external callers experience 0 breaking changes."
    },
    {
      num: "06",
      title: "Diff Review",
      tag: "IDE-Grade Inspection",
      desc: "Provides unified and side-by-side (Before | After) diff views with syntax tokens, line numbers, and a persistent 'Why This Changed' rationale.",
      detail: "Ensures developers inspect every single added or removed line before anything touches disk."
    },
    {
      num: "07",
      title: "Automated Verification",
      tag: "Regression Testing",
      desc: "Runs test suites in a controlled sandbox environment to prove that existing features continue to pass without behavioral regression.",
      detail: "Compares before and after pass/fail numbers (42 passed, 0 failed) with live runner terminal logs."
    },
    {
      num: "08",
      title: "Human Approval",
      tag: "Final Guardrail",
      desc: "Requires explicit developer confirmation before changes are committed to git branches. Nothing is applied blindly or automatically.",
      detail: "Presents full commit preview and safety audit trail."
    }
  ];

  return `
    <div class="public-site page-fade-in">
      ${renderPublicHeader(state)}

      <!-- Page Header -->
      <section class="public-section" style="padding-top: 56px; padding-bottom: 40px;">
        <div class="section-container">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 12px;">
            <span>RepoMind</span>
            <span style="color: var(--text-muted);">/</span>
            <span>Product</span>
          </div>

          <h1 style="font-size: 32px; font-weight: 700; letter-spacing: -0.6px; color: var(--text-primary); margin-bottom: 12px;">
            What exactly is RepoMind?
          </h1>

          <p style="font-size: var(--text-md); color: var(--text-secondary); line-height: 1.6; max-width: 760px;">
            RepoMind is an engineering platform that unites codebase comprehension, static risk diagnostics, caller blast radius, and test-verified refactoring into one continuous, disciplined workflow.
          </p>
        </div>
      </section>

      <!-- How Capabilities Work Together -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">Integrated Architecture</div>
            <h2 class="section-title">How the capabilities work together</h2>
            <p class="section-description">
              Rather than isolated tools, RepoMind connects the engineering steps required to safely modify unfamiliar code.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4);">
            ${capabilities.map(cap => `
              <div class="panel" style="background-color: var(--bg-primary);">
                <div class="panel-header">
                  <div class="panel-title">
                    <span style="color: var(--brand-accent-text); font-family: var(--font-mono); font-size: 11px;">${cap.num}</span>
                    <span>${cap.title}</span>
                  </div>
                  <span class="badge badge-outline">${cap.tag}</span>
                </div>
                <div class="panel-body">
                  <p style="font-size: var(--text-xs); color: var(--text-primary); line-height: 1.5; margin-bottom: 8px;">
                    ${cap.desc}
                  </p>
                  <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">
                    ${cap.detail}
                  </p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- Why Real Development Needs Integration -->
      <section class="public-section">
        <div class="section-container">
          <div class="panel" style="padding: var(--space-6); background: var(--bg-primary);">
            <div class="section-tag">Engineering vs Chatbots</div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              Codebase intelligence is not a chat box.
            </h2>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6; max-width: 780px;">
              Generic AI coding assistants attempt to edit code in isolation without understanding project-wide dependencies, caller contracts, or existing test suites. RepoMind operates directly on the static call graph, traces the blast radius, and executes verification tests before presenting changes for developer sign-off.
            </p>

            <div style="display: flex; gap: 10px; margin-top: var(--space-5);">
              <button class="btn btn-primary btn-sm" id="product-btn-howitworks">
                <span>See Step-by-Step Workflow</span>
                ${Icons.ArrowRight(11)}
              </button>
              <button class="btn btn-secondary btn-sm" id="product-btn-features">
                <span>View Full Feature Matrix</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

export function attachProductPageEvents() {
  attachPublicHeaderEvents();
  attachPublicFooterEvents();

  const howItWorksBtn = document.getElementById("product-btn-howitworks");
  const featuresBtn = document.getElementById("product-btn-features");

  if (howItWorksBtn) {
    howItWorksBtn.addEventListener("click", () => store.setRoute("how-it-works"));
  }
  if (featuresBtn) {
    featuresBtn.addEventListener("click", () => store.setRoute("features"));
  }
}
