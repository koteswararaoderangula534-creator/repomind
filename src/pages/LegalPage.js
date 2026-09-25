/**
 * Legal Pages Component (/privacy & /terms)
 * Clear, transparent terms of service and privacy guarantees for developer SaaS.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderLegalPage(state) {
  const isPrivacy = state.currentRoute === "privacy";

  return `
    <div class="public-site">
      <!-- Public Navigation Header -->
      <header class="public-header" role="banner">
        <div class="public-header-inner">
          <a href="#home" class="public-brand" style="text-decoration: none;">
            <div class="brand-logo-wrap">
              ${Icons.Logo(22)}
            </div>
            <div class="brand-text">
              <span class="brand-name">RepoMind</span>
              <span class="brand-version">v1.0</span>
            </div>
          </a>

          <nav class="public-nav" role="navigation">
            <a href="#home" class="public-nav-link">Product</a>
            <a href="#how-it-works" class="public-nav-link">How it Works</a>
            <a href="#features" class="public-nav-link">Features</a>
            <a href="#pricing" class="public-nav-link">Pricing</a>
            <a href="#about" class="public-nav-link">About</a>
          </nav>

          <div class="public-header-actions">
            <a href="#login" class="btn btn-ghost btn-sm">Sign In</a>
            <a href="#signup" class="btn btn-primary btn-sm">Get Started</a>
          </div>
        </div>
      </header>

      <main style="max-width: 820px; margin: 0 auto; padding: 60px 24px 80px 24px;">
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">
            ${isPrivacy ? "Privacy Policy" : "Terms of Service"}
          </h1>
          <p style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono); margin: 0;">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>

        <div class="panel" style="padding: 32px 28px; background: var(--bg-primary); line-height: 1.7; font-size: 13px; color: var(--text-secondary);">
          ${isPrivacy ? `
            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 0;">1. Code Access & Processing</h2>
            <p>RepoMind accesses repository source code strictly to execute abstract syntax tree (AST) parsing, symbol graph construction, and code health analysis. Repository code is processed in transient sandbox environments and is never sold, shared, or used to train public generative AI models.</p>

            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 24px;">2. User Data Isolation</h2>
            <p>Each user account operates inside an isolated workspace. Repository tokens, workspace telemetry, and refactoring history are associated strictly with your authenticated user ID via cryptographic sessions and database Row Level Security.</p>

            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 24px;">3. GitHub Tokens & Secrets</h2>
            <p>GitHub Personal Access Tokens provided for private repository indexing are encrypted at rest and never exposed to client-side scripts. Secrets detected during code health scans are redacted in UI outputs.</p>
          ` : `
            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 0;">1. Acceptance of Terms</h2>
            <p>By creating an account or accessing RepoMind, you agree to these Terms of Service. RepoMind provides autonomous codebase understanding, forensic hazard detection, and safe refactoring tools for engineering teams.</p>

            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 24px;">2. Human Verification Requirement</h2>
            <p>RepoMind generates automated refactoring proposals, dependency analyses, and test execution reports. You acknowledge that software refactoring changes must be reviewed and approved by authorized developers before deployment to production environments.</p>

            <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 24px;">3. Acceptable Use</h2>
            <p>You agree not to use RepoMind to analyze unauthorized repositories, bypass security controls, or generate malicious payload mutations.</p>
          `}
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="#home" class="btn btn-secondary btn-sm" style="text-decoration: none;">
            ← Return to Home
          </a>
        </div>
      </main>
    </div>
  `;
}

export function attachLegalEvents() {}
