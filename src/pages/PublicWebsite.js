/**
 * Public Website Component
 * Front-facing product presentation for visitors and new developers.
 * Calm, confident, technical, and trust-oriented.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderPublicWebsite(state) {
  return `
    <div class="public-site">
      <!-- Public Top Navigation -->
      <nav class="public-nav" role="navigation" aria-label="Main Website Navigation">
        <div class="public-nav-container">
          <div class="public-nav-left">
            <a href="#home" class="public-brand" title="RepoMind">
              <div class="brand-icon">
                ${Icons.Logo(16)}
              </div>
              <span class="brand-name">RepoMind</span>
            </a>
          </div>

          <div class="public-nav-center">
            <a href="#product" class="public-nav-link">Product</a>
            <a href="#how-it-works" class="public-nav-link">How It Works</a>
            <a href="#why-repomind" class="public-nav-link">Why RepoMind</a>
            <a href="#features" class="public-nav-link">Features</a>
          </div>

          <div class="public-nav-right">
            <button class="btn btn-ghost btn-sm" id="public-signin-btn">
              Sign In
            </button>
            <button class="btn btn-primary btn-sm" id="public-getstarted-btn">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <!-- HERO / INTRO SECTION -->
      <header class="public-hero" id="intro">
        <div class="hero-pill">
          <span class="hero-pill-badge">RepoMind v1.0</span>
          <span>Autonomous Codebase Understanding & Safe Refactoring</span>
        </div>

        <h1 class="hero-headline">
          Understand your codebase.<br/>
          Refactor it safely.
        </h1>

        <p class="hero-subtext">
          RepoMind helps developers understand unfamiliar repositories, identify engineering risks, safely plan code changes, and verify those changes before they are applied.
        </p>

        <div class="hero-cta-group">
          <button class="btn btn-primary" id="hero-getstarted-btn" style="padding: 9px 18px; font-size: 13px;">
            <span>Get Started</span>
            ${Icons.ArrowRight(12)}
          </button>
          <a href="#how-it-works" class="btn btn-secondary" style="padding: 9px 16px; font-size: 13px; text-decoration: none;">
            <span>See How It Works</span>
          </a>
        </div>

        <!-- Subtle Product Workflow Visualization -->
        <div class="hero-workflow-diagram">
          <div class="workflow-track">
            <div class="workflow-node">
              <span class="workflow-node-label">01</span>
              <span class="workflow-node-title">Repository</span>
            </div>

            <div class="workflow-separator">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label">02</span>
              <span class="workflow-node-title">Understand</span>
            </div>

            <div class="workflow-separator">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label">03</span>
              <span class="workflow-node-title">Detect</span>
            </div>

            <div class="workflow-separator">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label">04</span>
              <span class="workflow-node-title">Refactor</span>
            </div>

            <div class="workflow-separator">→</div>

            <div class="workflow-node active-highlight">
              <span class="workflow-node-label">05</span>
              <span class="workflow-node-title">Verify</span>
            </div>
          </div>
        </div>
      </header>

      <!-- WHAT IS REPOMIND? SECTION -->
      <section class="public-section" id="product">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">Overview</div>
            <h2 class="section-title">What is RepoMind?</h2>
            <p class="section-description">
              RepoMind is an AI-powered engineering assistant designed to help developers understand unfamiliar codebases and make safer changes.
            </p>
          </div>

          <div style="background-color: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: var(--space-5); margin-bottom: var(--space-4);">
            <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; max-width: 820px;">
              Instead of asking developers to manually navigate hundreds of files, RepoMind builds an understanding of the repository and guides them from understanding to verification.
            </p>
          </div>

          <div class="what-grid">
            <div class="what-card">
              <div class="what-card-tag">Traditional Manual Ramp-Up</div>
              <div class="what-card-title">Disorganized & Risky</div>
              <div class="what-card-body">
                Hours spent navigating through unfamiliar files, guessing hidden call hierarchies, and hesitating to touch complex functions for fear of unverified regressions.
              </div>
            </div>

            <div class="what-card highlight">
              <div class="what-card-tag" style="color: var(--brand-accent-text);">The RepoMind Approach</div>
              <div class="what-card-title">Structured & Verified</div>
              <div class="what-card-body">
                Automated AST analysis, static dependency tracing, evidence-backed refactoring plans, and automated regression verification before code touches production.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- WHY REPOMIND? SECTION -->
      <section class="public-section" id="why-repomind">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">Rationale</div>
            <h2 class="section-title">Why RepoMind?</h2>
            <p class="section-description">
              Engineering codebases grow continuously, but developer comprehension bandwidth remains finite.
            </p>
          </div>

          <div class="why-grid">
            <!-- Problem -->
            <div class="why-column">
              <div class="why-header">
                <span style="color: var(--color-high);">${Icons.AlertCircle(16)}</span>
                <span>The Problem</span>
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                Large repositories are difficult to understand. Developers spend hours searching through files, tracing dependencies, and figuring out where changes could have an impact.
              </p>
              <div class="why-list">
                <div class="why-list-item">
                  <span style="color: var(--color-high);">✕</span>
                  <span>Unclear call graphs and undocumented architecture boundaries.</span>
                </div>
                <div class="why-list-item">
                  <span style="color: var(--color-high);">✕</span>
                  <span>Fear of modifying monolithic functions with hidden side-effects.</span>
                </div>
                <div class="why-list-item">
                  <span style="color: var(--color-high);">✕</span>
                  <span>No clear blast radius assessment before writing changes.</span>
                </div>
              </div>
            </div>

            <!-- Solution -->
            <div class="why-column solution-col">
              <div class="why-header">
                <span style="color: var(--brand-accent-text);">${Icons.Check(16)}</span>
                <span>The Solution</span>
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                RepoMind brings those steps into one structured, evidence-backed engineering workflow:
              </p>
              <div class="why-list">
                <div class="why-list-item">
                  <span style="color: var(--color-success-light);">✓</span>
                  <span><code>Understand</code> — Extract architecture, modules, and data paths.</span>
                </div>
                <div class="why-list-item">
                  <span style="color: var(--color-success-light);">✓</span>
                  <span><code>Detect</code> — Surface security vulnerabilities and code smells.</span>
                </div>
                <div class="why-list-item">
                  <span style="color: var(--color-success-light);">✓</span>
                  <span><code>Impact</code> — Compute caller blast radius and regression paths.</span>
                </div>
                <div class="why-list-item">
                  <span style="color: var(--color-success-light);">✓</span>
                  <span><code>Refactor</code> — Decompose functions while preserving interfaces.</span>
                </div>
                <div class="why-list-item">
                  <span style="color: var(--color-success-light);">✓</span>
                  <span><code>Verify</code> — Execute test suites before human sign-off.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS SECTION -->
      <section class="public-section" id="how-it-works">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">Process</div>
            <h2 class="section-title">How It Works</h2>
            <p class="section-description">
              A disciplined five-step engineering loop from initial repository ingress to verified commit.
            </p>
          </div>

          <div class="steps-container">
            <div class="step-card">
              <div class="step-num">01</div>
              <div class="step-content">
                <div class="step-title">
                  <span>CONNECT</span>
                  <span class="badge badge-outline">Repository Ingress</span>
                </div>
                <div class="step-desc">
                  Connect a GitHub repository. RepoMind clones the tree and initializes the AST symbol parser.
                </div>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">02</div>
              <div class="step-content">
                <div class="step-title">
                  <span>UNDERSTAND</span>
                  <span class="badge badge-outline">AST & Topology</span>
                </div>
                <div class="step-desc">
                  RepoMind analyzes structure, code, dependencies and documentation to map system boundaries.
                </div>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">03</div>
              <div class="step-content">
                <div class="step-title">
                  <span>DETECT</span>
                  <span class="badge badge-outline">Static Diagnostics</span>
                </div>
                <div class="step-desc">
                  Find security issues, code smells and risky areas with exact file and line references.
                </div>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">04</div>
              <div class="step-content">
                <div class="step-title">
                  <span>REFACTOR</span>
                  <span class="badge badge-outline">Safe Decomposition</span>
                </div>
                <div class="step-desc">
                  Generate an evidence-backed refactoring plan and exact code diff with preserved signatures.
                </div>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">05</div>
              <div class="step-content">
                <div class="step-title">
                  <span>VERIFY</span>
                  <span class="badge badge-success">Automated Test Matrix</span>
                </div>
                <div class="step-desc">
                  Run test suites and verify the proposed change with zero regressions before human approval.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- KEY CAPABILITIES SECTION -->
      <section class="public-section" id="features">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">Capabilities</div>
            <h2 class="section-title">Key Capabilities</h2>
            <p class="section-description">
              Modular developer tools organized around understanding, diagnosing, and safely changing code.
            </p>
          </div>

          <div class="capabilities-group-grid">
            <!-- UNDERSTAND GROUP -->
            <div class="capability-group">
              <div class="group-header">UNDERSTAND</div>

              <div class="capability-item">
                <div class="capability-item-title">Repository Understanding</div>
                <div class="capability-item-desc">High-density engineering metrics, module counts, and language footprints.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Architecture Mapping</div>
                <div class="capability-item-desc">Clear layered topology showing what services talk to what databases and APIs.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Codebase Q&A</div>
                <div class="capability-item-desc">Structured intelligence answering architectural queries with verified line citations.</div>
              </div>
            </div>

            <!-- IMPROVE GROUP -->
            <div class="capability-group">
              <div class="group-header">IMPROVE</div>

              <div class="capability-item">
                <div class="capability-item-title">Security Analysis</div>
                <div class="capability-item-desc">Detection of hardcoded secrets, unthrottled endpoints, and injection risks.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Code Smell Detection</div>
                <div class="capability-item-desc">Identifies monolithic functions, SRP violations, and dead imports.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Impact Analysis</div>
                <div class="capability-item-desc">Measures caller blast radius and identifies dependent regression test suites.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Safe Refactoring</div>
                <div class="capability-item-desc">Evidence-backed decomposition plans with isolated failure boundaries.</div>
              </div>
            </div>

            <!-- VERIFY GROUP -->
            <div class="capability-group">
              <div class="group-header">VERIFY</div>

              <div class="capability-item">
                <div class="capability-item-title">Diff Review</div>
                <div class="capability-item-desc">IDE-grade Unified and Side-by-Side diff viewer with "Why This Changed" context.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Test Verification</div>
                <div class="capability-item-desc">Automated sandbox test execution proving behavioral equivalence.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Human Approval</div>
                <div class="capability-item-desc">Strict human sign-off guardrail before commits touch git branches.</div>
              </div>

              <div class="capability-item">
                <div class="capability-item-title">Junior-Friendly Explanations</div>
                <div class="capability-item-desc">Dual explanation toggle translating complex AST terms into accessible mental models.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TRUST & SAFETY SECTION -->
      <section class="public-section">
        <div class="section-container">
          <div class="trust-banner">
            <div>
              <div class="section-tag" style="color: var(--color-success-light);">Controlled Changes</div>
              <h2 class="section-title">Built for controlled changes.</h2>
              <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; max-width: 680px; margin-top: 6px;">
                RepoMind does not treat generated code as automatically trusted. Changes are reviewed, impact-checked, and verified against test suites before they are applied.
              </p>
            </div>

            <div class="trust-pipeline">
              <span class="trust-pipeline-step">Analyze</span>
              <span class="trust-pipeline-arrow">→</span>
              <span class="trust-pipeline-step">Propose</span>
              <span class="trust-pipeline-arrow">→</span>
              <span class="trust-pipeline-step">Review</span>
              <span class="trust-pipeline-arrow">→</span>
              <span class="trust-pipeline-step">Test</span>
              <span class="trust-pipeline-arrow">→</span>
              <span class="trust-pipeline-step" style="color: var(--color-success-light);">Approve</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CTA SECTION -->
      <section class="final-cta-section">
        <div class="section-container" style="text-align: center;">
          <h2 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; letter-spacing: -0.5px;">
            Ready to understand your codebase?
          </h2>
          <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-5);">
            Analyze unfamiliar repositories and generate evidence-backed, verified refactors.
          </p>

          <div style="display: flex; justify-content: center; gap: var(--space-3);">
            <button class="btn btn-primary" id="footer-getstarted-btn" style="padding: 8px 18px; font-size: 13px;">
              <span>Get Started</span>
              ${Icons.ArrowRight(12)}
            </button>
            <a href="#how-it-works" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px; text-decoration: none;">
              <span>Explore How It Works</span>
            </a>
          </div>
        </div>
      </section>

      <!-- PROFESSIONAL MINIMAL FOOTER -->
      <footer class="public-footer">
        <div class="footer-container">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="brand-icon" style="width: 18px; height: 18px;">
              ${Icons.Logo(13)}
            </div>
            <span style="font-weight: 700; color: var(--text-primary);">RepoMind</span>
            <span style="color: var(--text-muted); font-size: 11px;">— Autonomous Codebase Understanding & Safe Refactoring</span>
          </div>

          <div class="footer-links">
            <a href="#product">Product</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#why-repomind">Security</a>
            <a href="#product">Docs</a>
            <a href="javascript:void(0)" id="footer-contact-link">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `;
}

export function attachPublicWebsiteEvents() {
  const signInBtn = document.getElementById("public-signin-btn");
  const getStartedBtn = document.getElementById("public-getstarted-btn");
  const heroGetStartedBtn = document.getElementById("hero-getstarted-btn");
  const footerGetStartedBtn = document.getElementById("footer-getstarted-btn");
  const contactLink = document.getElementById("footer-contact-link");

  const goToLogin = () => {
    store.setRoute("login");
  };

  [signInBtn, getStartedBtn, heroGetStartedBtn, footerGetStartedBtn].forEach(btn => {
    btn?.addEventListener("click", goToLogin);
  });

  if (contactLink) {
    contactLink.addEventListener("click", () => {
      store.showToast("Contact engineering team: support@repomind.dev", "info");
    });
  }
}
