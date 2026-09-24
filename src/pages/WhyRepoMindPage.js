/**
 * Why RepoMind Page Component (Route: /why-repomind)
 * Purpose: Answer "Why does RepoMind exist?"
 * Starts with the actual developer problem and articulates the 5 foundational engineering challenges.
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderWhyRepoMindPage(state) {
  const problems = [
    {
      domain: "UNDERSTANDING",
      headline: "Context is scattered across files.",
      problem: "Developers joining unfamiliar repositories often spend significant time trying to understand where everything lives. Finding how authentication routes to services, or where database transactions are committed, requires manual grep searches across hundreds of files.",
      solution: "RepoMind indexes the AST to trace data paths and answer architectural questions with verified line citations (e.g. login.py:24–41)."
    },
    {
      domain: "DEPENDENCIES",
      headline: "Changes can have unexpected effects.",
      problem: "Modifying a function signature or return type often has invisible downstream blast radius. Without static call graphs, developers cannot easily tell what callers depend on that function.",
      solution: "RepoMind computes static dependency blast radius, identifying the 6 affected files, 9 callers, and 4 specific test suites needing verification."
    },
    {
      domain: "RISK",
      headline: "Security and code-quality problems may be hidden.",
      problem: "Hardcoded API keys, unthrottled authentication endpoints, and monolithic 80+ line functions accumulate unnoticed as technical debt.",
      solution: "RepoMind surfaces 13 evaluated findings with strict severity tiers (HIGH, MEDIUM, LOW) and actionable refactoring paths."
    },
    {
      domain: "REFACTORING",
      headline: "Generated code needs evidence and reasoning.",
      problem: "Generic AI assistants generate arbitrary code snippets without explaining structural trade-offs, often breaking caller contracts.",
      solution: "RepoMind provides structured decomposition plans with explicit WHY THIS CHANGE?, EXPECTED IMPACT, and RISK evaluations, preserving orchestrator compatibility."
    },
    {
      domain: "VERIFICATION",
      headline: "A proposed change needs actual testing.",
      problem: "No code change should ever be trusted based solely on visual inspection. Without running real test suites, regressions slip into production.",
      solution: "RepoMind executes regression suites in an isolated sandbox, requiring mathematical pass/fail equivalence (42/42 passed) before human approval."
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
            <span>Why RepoMind</span>
          </div>

          <h1 style="font-size: 32px; font-weight: 700; letter-spacing: -0.6px; color: var(--text-primary); margin-bottom: 12px;">
            Why does RepoMind exist?
          </h1>

          <p style="font-size: var(--text-md); color: var(--text-secondary); line-height: 1.6; max-width: 760px;">
            Most engineering time is spent reading and understanding unfamiliar code rather than writing greenfield code. RepoMind turns this cognitive load into a structured, verifiable engineering process.
          </p>
        </div>
      </section>

      <!-- The Real Developer Dilemma -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">The Daily Dilemma</div>
            <h2 class="section-title">The questions every developer asks</h2>
            <p class="section-description">
              When engineers inherit a large or unfamiliar repository, they encounter the same set of critical questions:
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-bottom: var(--space-6);">
            <div style="padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text); font-weight: 600;">"Where is authentication?"</span>
            </div>
            <div style="padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text); font-weight: 600;">"Where is the database flow?"</span>
            </div>
            <div style="padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text); font-weight: 600;">"What depends on this function?"</span>
            </div>
            <div style="padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-medium); font-weight: 600;">"What could break if I change it?"</span>
            </div>
            <div style="padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-medium); font-weight: 600;">"Is this code safe to modify?"</span>
            </div>
            <div style="padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-success-light); font-weight: 600;">"Did my refactor actually work?"</span>
            </div>
          </div>
        </div>
      </section>

      <!-- The Five Problems & Solutions -->
      <section class="public-section">
        <div class="section-container" style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div class="section-header">
            <div class="section-tag">Root Challenges</div>
            <h2 class="section-title">Five engineering problems RepoMind solves</h2>
          </div>

          ${problems.map((p, idx) => `
            <div class="panel" style="background-color: var(--bg-primary);">
              <div class="panel-header">
                <div class="panel-title" style="color: var(--text-primary); font-size: 12px;">
                  <span style="font-family: var(--font-mono); color: var(--brand-accent-text);">0${idx + 1} • ${p.domain}</span>
                  <span style="color: var(--border-default);">—</span>
                  <span>${p.headline}</span>
                </div>
              </div>

              <div class="panel-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                <div>
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-high); margin-bottom: 4px;">
                    The Challenge
                  </div>
                  <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                    ${p.problem}
                  </p>
                </div>

                <div style="border-left: 1px solid var(--border-subtle); padding-left: var(--space-4);">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-success-light); margin-bottom: 4px;">
                    RepoMind Solution
                  </div>
                  <p style="font-size: var(--text-xs); color: var(--text-primary); line-height: 1.5;">
                    ${p.solution}
                  </p>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <!-- The RepoMind Formula -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container">
          <div class="panel" style="padding: var(--space-6); background: var(--bg-primary); text-align: center;">
            <div class="section-tag">The Architecture Principle</div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">
              The RepoMind Engineering Standard
            </h2>

            <div style="
              display: inline-flex;
              align-items: center;
              flex-wrap: wrap;
              justify-content: center;
              gap: 12px;
              padding: 12px 20px;
              background-color: var(--bg-secondary);
              border: 1px solid var(--border-default);
              border-radius: var(--radius-sm);
              font-family: var(--font-mono);
              font-size: 12px;
              font-weight: 600;
              color: var(--text-primary);
              margin: 12px 0 20px 0;
            ">
              <span>Understand</span>
              <span style="color: var(--text-muted);">+</span>
              <span>Evidence</span>
              <span style="color: var(--text-muted);">+</span>
              <span>Impact</span>
              <span style="color: var(--text-muted);">+</span>
              <span>Controlled Refactoring</span>
              <span style="color: var(--text-muted);">+</span>
              <span style="color: var(--color-success-light);">Verification</span>
            </div>

            <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 680px; margin: 0 auto; line-height: 1.5;">
              We do not claim autonomous "magic" or zero-defect infallibility. Instead, we give engineers the tools to understand repositories deeply, inspect exact diffs transparently, and verify behavior with real test runners before approving changes.
            </p>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="final-cta-section">
        <div class="section-container" style="text-align: center;">
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Start understanding unfamiliar codebases safely
          </h2>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">
            Join engineers using RepoMind to manage legacy repositories.
          </p>

          <button class="btn btn-primary" id="why-cta-getstarted" style="padding: 8px 18px; font-size: 13px;">
            <span>Get Started</span>
            ${Icons.ArrowRight(12)}
          </button>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

export function attachWhyRepoMindPageEvents() {
  attachPublicHeaderEvents();
  attachPublicFooterEvents();

  const getStartedBtn = document.getElementById("why-cta-getstarted");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
}
