/**
 * Trust & Safety Page Component (Route: /trust)
 * Purpose: Explain why developers can safely use RepoMind.
 * Core Principle: "Autonomous in analysis. Controlled in execution."
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderTrustPage(state) {
  const pillars = [
    {
      title: "Evidence-Backed Findings",
      subtitle: "File & line citations",
      desc: "Every finding, architectural edge, and code smell is backed by static AST evidence. RepoMind provides exact file paths and line ranges (e.g., config.py:27, orders.py:84) so you can audit the source yourself.",
      icon: Icons.FileCode(16)
    },
    {
      title: "Human Review",
      subtitle: "Developers in control",
      desc: "RepoMind never acts as a black-box autonomous committer. Proposed decomposition plans and diffs require human review and explicit developer approval before any branch update occurs.",
      icon: Icons.Check(16)
    },
    {
      title: "Controlled Execution",
      subtitle: "No blind writes",
      desc: "Files are never modified blindly. All refactorings are synthesized into a staging layer first, allowing side-by-side diff inspection and rejection at any time with zero side-effects.",
      icon: Icons.ShieldCheck ? Icons.ShieldCheck(16) : Icons.Check(16)
    },
    {
      title: "Isolated Verification",
      subtitle: "Hermetic sandbox testing",
      desc: "Before any change is eligible for approval, regression test suites are executed in an isolated sandbox runner to prove that existing test cases continue to pass without failure.",
      icon: Icons.Verification(16)
    },
    {
      title: "Transparent Changes",
      subtitle: "IDE-grade diffs",
      desc: "Every modified line is highlighted in high-density unified and split diff views with precise line gutters, addition counters (+42), and deletion counters (-31).",
      icon: Icons.DiffViewer(16)
    },
    {
      title: "Clear Result",
      subtitle: "Explicit pass/fail audit",
      desc: "Verification produces complete pytest/test runner logs showing total runtime, individual test results, and clear pass/fail confirmation. Ambiguous results are marked as unverified.",
      icon: Icons.Terminal ? Icons.Terminal(16) : Icons.FileCode(16)
    }
  ];

  return `
    <div class="public-site page-fade-in">
      ${renderPublicHeader(state)}

      <!-- Page Header -->
      <section class="public-section" style="padding-top: 56px; padding-bottom: 40px;">
        <div class="section-container">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; font-family: var(--font-mono); color: var(--color-success-light); margin-bottom: 12px;">
            <span>RepoMind</span>
            <span style="color: var(--text-muted);">/</span>
            <span>Trust & Safety</span>
          </div>

          <h1 style="font-size: 32px; font-weight: 700; letter-spacing: -0.6px; color: var(--text-primary); margin-bottom: 12px;">
            Autonomous in analysis.<br/>Controlled in execution.
          </h1>

          <p style="font-size: var(--text-md); color: var(--text-secondary); line-height: 1.6; max-width: 760px;">
            Why engineering leads, staff architects, and developers can trust RepoMind with critical production repositories.
          </p>
        </div>
      </section>

      <!-- The Core Safety Principle Banner -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container">
          <div class="panel" style="padding: var(--space-6); background: var(--bg-primary); border-left: 4px solid var(--color-success);">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-success-light); margin-bottom: 6px;">
              The Core Safety Principle
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              No code touches git without verification and human sign-off.
            </h2>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6; max-width: 820px;">
              RepoMind is built with the principle that developer tools must never create unpredictable side effects. While the AST parsing and impact analysis are completely autonomous and exhaustive, all state mutations (creating diffs, staging commits, and applying patches) are gated by automated regression suites and human review.
            </p>
          </div>
        </div>
      </section>

      <!-- Six Safety Pillars Grid -->
      <section class="public-section">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">Safety Architecture</div>
            <h2 class="section-title">Six pillars of engineering governance</h2>
            <p class="section-description">
              How RepoMind guarantees safety and transparency at every phase of the refactoring lifecycle.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4);">
            ${pillars.map(p => `
              <div class="panel" style="background-color: var(--bg-primary);">
                <div class="panel-header" style="padding: 10px 14px;">
                  <div class="panel-title" style="font-size: 13px; color: var(--text-primary);">
                    <span style="color: var(--color-success-light); display: inline-flex;">${p.icon}</span>
                    <span>${p.title}</span>
                  </div>
                  <span class="badge badge-outline" style="font-size: 10px;">${p.subtitle}</span>
                </div>

                <div class="panel-body" style="padding: 14px;">
                  <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.55;">
                    ${p.desc}
                  </p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- Security & Privacy Standards -->
      <section class="public-section" style="background-color: var(--bg-canvas);">
        <div class="section-container">
          <div class="panel" style="padding: var(--space-5); background: var(--bg-primary);">
            <div class="section-tag">Repository Privacy</div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              Data Protection & Intellectual Property Standards
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: var(--text-xs); color: var(--text-secondary); margin-top: 10px;">
              <li style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--color-success-light); font-weight: 700;">✓</span>
                <span>Zero model training on customer repositories or proprietary codebases.</span>
              </li>
              <li style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--color-success-light); font-weight: 700;">✓</span>
                <span>GitHub Personal Access Tokens are held in encrypted session storage and never logged.</span>
              </li>
              <li style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--color-success-light); font-weight: 700;">✓</span>
                <span>Hermetic test execution occurs in ephemeral sandboxes with strict network egress limits.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="final-cta-section">
        <div class="section-container" style="text-align: center;">
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Safe codebase engineering starts here
          </h2>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">
            Sign in to start analyzing repositories with full verification guardrails.
          </p>

          <button class="btn btn-primary" id="trust-cta-getstarted" style="padding: 8px 18px; font-size: 13px;">
            <span>Get Started</span>
            ${Icons.ArrowRight(12)}
          </button>
        </div>
      </section>

      ${renderPublicFooter()}
    </div>
  `;
}

export function attachTrustPageEvents() {
  attachPublicHeaderEvents();
  attachPublicFooterEvents();

  const getStartedBtn = document.getElementById("trust-cta-getstarted");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
}
