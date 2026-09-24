/**
 * How It Works Page Component (Route: /how-it-works)
 * Purpose: Explain the complete RepoMind workflow in a dedicated 8-step experience.
 * Visually explains the pipeline from connect to approve without falling into a giant card grid.
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderHowItWorksPage(state) {
  const steps = [
    {
      num: "01",
      name: "CONNECT",
      badge: "Ingress",
      title: "Connect a GitHub repository",
      desc: "Provide any public or authenticated private GitHub repository URL and branch name. RepoMind clones the tree and initializes the AST symbol parser.",
      artifact: "Input: https://github.com/university-sys/student-management-system [Branch: main]"
    },
    {
      num: "02",
      name: "UNDERSTAND",
      badge: "AST Parsing",
      title: "Analyze architecture, dependencies & files",
      desc: "RepoMind parses the full repository AST, examining repository structure, files, functions, dependencies, documentation, and test files to build a system map.",
      artifact: "Analyzed: 147 Files • 18 Modules • 42 Tests • 12,480 LOC"
    },
    {
      num: "03",
      name: "DETECT",
      badge: "Diagnostics",
      title: "Identify security issues, code smells & risky areas",
      desc: "Static diagnostic evaluators scan for vulnerabilities, architectural bypasses, outdated patterns, and single responsibility violations.",
      artifact: "Detected: 13 Findings (2 High Security, 7 Medium Smells, 4 Low)"
    },
    {
      num: "04",
      name: "IMPACT",
      badge: "Blast Radius",
      title: "Determine affected files, functions & tests",
      desc: "Answers the fundamental question: 'What could this change affect?' Traces caller-callee propagation to compute blast radius, identifying affected callers and dependent test suites.",
      artifact: "Impact: 6 Affected Files • 9 Caller Functions • 4 Regression Test Suites"
    },
    {
      num: "05",
      name: "REFACTOR",
      badge: "Decomposition",
      title: "Generate evidence-backed refactoring plan",
      desc: "RepoMind formulates a structured decomposition plan with explicit rationale: WHY THIS CHANGE?, EXPECTED IMPACT, and RISK, preserving caller compatibility.",
      artifact: "Plan: Decompose process_order() into 4 focused single-responsibility functions"
    },
    {
      num: "06",
      name: "DIFF",
      badge: "Code Review",
      title: "Show the exact code changes",
      desc: "Review line-level unified and side-by-side (Before | After) diffs with syntax highlighting, line numbers, and 'Why This Changed' banners.",
      artifact: "Diff: +42 lines added, -31 lines removed across orders.py"
    },
    {
      num: "07",
      name: "VERIFY",
      badge: "Sandbox Runner",
      title: "Run tests in an isolated environment",
      desc: "Automated regression tests run inside a controlled sandbox to verify that existing behavior remains intact and no regressions occur.",
      artifact: "Result: 42 / 42 passed (1.84s) • 0 regressions"
    },
    {
      num: "08",
      name: "APPROVE",
      badge: "Human Sign-off",
      title: "Developer reviews and decides whether to apply",
      desc: "The developer retains full control. After inspecting the diff and verification output, the developer approves and applies the commit with a full audit log.",
      artifact: "Commit: Verified changes applied to main [Commit: 9c3d4e1]"
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
            <span>How It Works</span>
          </div>

          <h1 style="font-size: 32px; font-weight: 700; letter-spacing: -0.6px; color: var(--text-primary); margin-bottom: 12px;">
            How RepoMind Works
          </h1>

          <p style="font-size: var(--text-md); color: var(--text-secondary); line-height: 1.6; max-width: 760px;">
            A dedicated, eight-step engineering pipeline from initial repository connection to verified, human-approved commits.
          </p>
        </div>
      </section>

      <!-- Step-by-Step Experience (Timeline style, clean, non-card-grid) -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container" style="max-width: 860px;">
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            ${steps.map((step, idx) => `
              <div style="display: flex; gap: var(--space-4); align-items: flex-start;">
                <!-- Timeline Number Gutter -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="
                    width: 38px;
                    height: 38px;
                    border-radius: var(--radius-sm);
                    background-color: var(--bg-secondary);
                    border: 1px solid var(--border-default);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-mono);
                    font-weight: 700;
                    font-size: 13px;
                    color: var(--brand-accent-text);
                  ">
                    ${step.num}
                  </div>
                  ${idx < steps.length - 1 ? `
                    <div style="width: 2px; height: 32px; background-color: var(--border-subtle); margin: 6px 0;"></div>
                  ` : ""}
                </div>

                <!-- Step Card -->
                <div class="panel" style="flex: 1; margin-bottom: ${idx < steps.length - 1 ? '4px' : '0'};">
                  <div class="panel-header" style="padding: 10px 14px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-primary);">
                        ${step.name}
                      </span>
                      <span style="color: var(--border-default);">—</span>
                      <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
                        ${step.title}
                      </span>
                    </div>
                    <span class="badge badge-outline">${step.badge}</span>
                  </div>

                  <div class="panel-body" style="padding: 12px 14px;">
                    <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
                      ${step.desc}
                    </p>

                    <div style="
                      background-color: var(--bg-canvas);
                      border: 1px solid var(--border-subtle);
                      border-radius: var(--radius-sm);
                      padding: 6px 10px;
                      font-family: var(--font-mono);
                      font-size: 11px;
                      color: var(--text-muted);
                    ">
                      <code>${step.artifact}</code>
                    </div>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="final-cta-section">
        <div class="section-container" style="text-align: center;">
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Experience the eight-step workflow
          </h2>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">
            Start with an analyzed repository and trace caller impact right now.
          </p>

          <button class="btn btn-primary" id="howitworks-cta-getstarted" style="padding: 8px 18px; font-size: 13px;">
            <span>Get Started</span>
            ${Icons.ArrowRight(12)}
          </button>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

export function attachHowItWorksPageEvents() {
  attachPublicHeaderEvents();
  attachPublicFooterEvents();

  const getStartedBtn = document.getElementById("howitworks-cta-getstarted");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
}
