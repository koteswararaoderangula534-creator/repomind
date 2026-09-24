/**
 * Features Page Component (Route: /features)
 * Purpose: Answer "What can RepoMind do?"
 * Grouped strictly by workflow: UNDERSTAND, DIAGNOSE, IMPROVE, VERIFY, and LEARN.
 * Each feature has a title, explanation, visual example, and workflow connection.
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderFeaturesPage(state) {
  const groups = [
    {
      groupName: "UNDERSTAND",
      groupTag: "Phase 1: Comprehension",
      color: "var(--brand-accent-text)",
      features: [
        {
          title: "Repository Intelligence",
          desc: "Parses AST to extract complete symbol hierarchies, module structures, and language footprints.",
          example: "Metrics: 147 Files • 18 Modules • 12,480 LOC • Python 3.11",
          workflow: "Provides baseline context upon repository ingress."
        },
        {
          title: "Architecture Mapping",
          desc: "Interactive tiered visualization answering 'what talks to what?' between UI, API, workers, and databases.",
          example: "Graph: Next.js :3000 → FastAPI :8000 → Core Services → PostgreSQL :5432",
          workflow: "Identifies architectural boundaries and direct database query leaks."
        },
        {
          title: "Codebase Q&A",
          desc: "Structured intelligence engine answering architectural queries with clickable file and line evidence citations.",
          example: "Query: 'How does authentication work?' → login.py:24–41 ↓ auth_service.py:51–79",
          workflow: "Eliminates guessing by anchoring explanations to real source lines."
        }
      ]
    },
    {
      groupName: "DIAGNOSE",
      groupTag: "Phase 2: Static Analysis",
      color: "var(--color-medium)",
      features: [
        {
          title: "Security Analysis",
          desc: "Scans for hardcoded secrets, SQL injection vectors, and missing authentication expiration checks.",
          example: "Rule SEC-012: config.py:27 [Hardcoded Secret: SECRET_KEY = '...']",
          workflow: "Surfaces high-risk vulnerabilities with remediation plans."
        },
        {
          title: "Code Smell Detection",
          desc: "Evaluates Single Responsibility violations, cyclomatic complexity spikes, and outdated dependency methods.",
          example: "Rule DES-008: orders.py:84 [Large Function: 84 lines, 4 distinct concerns]",
          workflow: "Identifies candidate functions for safe decomposition."
        },
        {
          title: "Impact Analysis",
          desc: "Propagates symbol changes through static call graphs to compute downstream blast radius and affected tests.",
          example: "Blast Radius: 6 Files • 9 Caller Functions • 4 Regression Test Suites",
          workflow: "Answers 'What could this change affect?' before writing any diff."
        }
      ]
    },
    {
      groupName: "IMPROVE",
      groupTag: "Phase 3: Refactoring",
      color: "var(--color-info)",
      features: [
        {
          title: "Safe Refactoring",
          desc: "Formulates evidence-backed decomposition plans that separate bloated functions into focused single-responsibility units.",
          example: "Plan: validate_order() • process_payment() • save_order() • send_notification()",
          workflow: "Preserves external orchestrator signature for 100% caller compatibility."
        },
        {
          title: "Diff Generation",
          desc: "Generates IDE-grade unified and split diffs with syntax coloring, line numbers, and additions/deletions markers.",
          example: "Staged Diff: +42 lines added, -31 lines removed in orders.py",
          workflow: "Prepares proposed changes for visual line-level inspection."
        },
        {
          title: "Code Review",
          desc: "Contextual review panel displaying 'WHY THIS CHANGED', expected complexity reduction, and caller risk.",
          example: "Rationale: 'Separated payment processing from validation to isolate network dependencies.'",
          workflow: "Equips reviewers with clear engineering reasoning."
        }
      ]
    },
    {
      groupName: "VERIFY",
      groupTag: "Phase 4: Safety & Validation",
      color: "var(--color-success-light)",
      features: [
        {
          title: "Test Execution",
          desc: "Executes test runner inside a controlled sandbox to prove existing behaviors remain intact.",
          example: "Runner: pytest -v --cov=services tests/ [Platform: win32 Python 3.11]",
          workflow: "Validates functionality before any change touches disk."
        },
        {
          title: "Verification Matrix",
          desc: "Side-by-side Before / After comparison matrix confirming zero test regressions.",
          example: "Before: 42 passed, 0 failed → After: 42 passed, 0 failed (0 regressions)",
          workflow: "Provides mathematical behavioral equivalence proof."
        },
        {
          title: "Human Approval Guardrail",
          desc: "Explicit developer authorization modal with commit preview and git branch target.",
          example: "Action: 'Approve & Commit' to main (Commit: 9c3d4e1)",
          workflow: "Guarantees no autonomous unauthorized modifications to production code."
        }
      ]
    },
    {
      groupName: "LEARN",
      groupTag: "Phase 5: Comprehension & Onboarding",
      color: "var(--brand-accent-text)",
      features: [
        {
          title: "Junior-Friendly Explanations",
          desc: "Subtle global toggle that translates complex AST jargon into intuitive, plain-English mental models.",
          example: "Toggle: 'This function was doing too many jobs at once. We separated those jobs to make testing easier.'",
          workflow: "Accelerates onboarding for junior developers without degrading technical precision."
        },
        {
          title: "Codebase Learning Path",
          desc: "Interactive Code Inspector drawer allowing developers to explore line snippets and symbol declarations directly.",
          example: "Inspector: auth_service.py:51–79 with JetBrains Mono syntax highlighting & copy actions",
          workflow: "Helps developers learn unfamiliar frameworks by following live traces."
        }
      ]
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
            <span>Features</span>
          </div>

          <h1 style="font-size: 32px; font-weight: 700; letter-spacing: -0.6px; color: var(--text-primary); margin-bottom: 12px;">
            What can RepoMind do?
          </h1>

          <p style="font-size: var(--text-md); color: var(--text-secondary); line-height: 1.6; max-width: 760px;">
            A complete matrix of engineering capabilities organized by workflow: Understand, Diagnose, Improve, Verify, and Learn.
          </p>
        </div>
      </section>

      <!-- Workflow Feature Groups -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container" style="display: flex; flex-direction: column; gap: var(--space-8);">
          ${groups.map(group => `
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; margin-bottom: var(--space-4);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: ${group.color};">
                    ${group.groupName}
                  </span>
                  <span style="color: var(--text-muted); font-size: 11px;">•</span>
                  <span style="font-size: 12px; color: var(--text-secondary);">${group.groupTag}</span>
                </div>
                <span class="badge badge-outline">${group.features.length} Capabilities</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);">
                ${group.features.map(feat => `
                  <div class="panel" style="background-color: var(--bg-primary);">
                    <div class="panel-header" style="padding: 10px 14px;">
                      <div class="panel-title" style="font-size: 13px; color: var(--text-primary);">
                        ${feat.title}
                      </div>
                    </div>

                    <div class="panel-body" style="padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px;">
                          ${feat.desc}
                        </p>

                        <div style="
                          background-color: var(--bg-canvas);
                          border: 1px solid var(--border-subtle);
                          border-radius: var(--radius-sm);
                          padding: 6px 10px;
                          font-family: var(--font-mono);
                          font-size: 11px;
                          color: var(--text-primary);
                          margin-bottom: 8px;
                        ">
                          <code>${feat.example}</code>
                        </div>
                      </div>

                      <div style="font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
                        <span style="font-weight: 600;">Workflow:</span> ${feat.workflow}
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="final-cta-section">
        <div class="section-container" style="text-align: center;">
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Put these capabilities to work on your codebase
          </h2>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">
            Sign in to start analyzing and refactoring safely.
          </p>

          <button class="btn btn-primary" id="features-cta-getstarted" style="padding: 8px 18px; font-size: 13px;">
            <span>Get Started</span>
            ${Icons.ArrowRight(12)}
          </button>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

export function attachFeaturesPageEvents() {
  attachPublicHeaderEvents();
  attachPublicFooterEvents();

  const getStartedBtn = document.getElementById("features-cta-getstarted");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
}
