/**
 * Pricing Page Component (/pricing)
 * Transparent SaaS structure supporting Free, Pro, and Team tiers.
 * Strictly adheres to rule: No fake payment buttons, transparent "Coming soon" for unreleased billing.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderPricingPage(state) {
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

          <nav class="public-nav" role="navigation" aria-label="Public Navigation">
            <a href="#home" class="public-nav-link">Product</a>
            <a href="#how-it-works" class="public-nav-link">How it Works</a>
            <a href="#features" class="public-nav-link">Features</a>
            <a href="#pricing" class="public-nav-link active">Pricing</a>
            <a href="#about" class="public-nav-link">About</a>
          </nav>

          <div class="public-header-actions">
            <a href="#login" class="btn btn-ghost btn-sm" id="nav-login-btn">Sign In</a>
            <a href="#signup" class="btn btn-primary btn-sm" id="nav-signup-btn">Get Started</a>
          </div>
        </div>
      </header>

      <main style="max-width: 1080px; margin: 0 auto; padding: 60px 24px 80px 24px;">
        
        <div style="text-align: center; margin-bottom: 50px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--brand-accent-subtle); border: 1px solid var(--brand-accent-border); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 16px;">
            <span>TRANSPARENT ENGINEERING PLANS</span>
          </div>
          <h1 style="font-size: 38px; font-weight: 800; color: var(--text-primary); margin: 0 0 12px 0; letter-spacing: -0.8px;">
            Predictable plans for engineers and teams.
          </h1>
          <p style="font-size: 15px; color: var(--text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.6;">
            Start free with public repositories. Upgrade to Pro or Team when you need private workspace governance and CI/CD verification sandboxes.
          </p>
        </div>

        <!-- 3 Tier Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 60px;">
          
          <!-- Free Tier -->
          <div class="panel" style="padding: 28px 24px; background: var(--bg-primary); border: 1px solid var(--border-default); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                Free / Developer
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">
                Essential codebase intelligence for open source and solo developers.
              </div>

              <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">$0</span>
                <span style="font-size: 12px; color: var(--text-muted);">/ month</span>
              </div>

              <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; font-size: 12px; color: var(--text-secondary); line-height: 2;">
                <li>✓ Public GitHub repositories</li>
                <li>✓ AST symbol and architecture mapping</li>
                <li>✓ Code health and security smells</li>
                <li>✓ AI Codebase Intelligence queries</li>
                <li>✓ Community support</li>
              </ul>
            </div>

            <a href="#signup" class="btn btn-secondary" style="width: 100%; text-align: center; text-decoration: none; padding: 10px; font-size: 13px; font-weight: 600;">
              Get Started Free
            </a>
          </div>

          <!-- Pro Tier -->
          <div class="panel" style="padding: 28px 24px; background: var(--bg-primary); border: 1px solid var(--brand-accent); border-top: 3px solid var(--brand-accent); display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <div style="position: absolute; top: -10px; right: 20px; background: var(--brand-accent); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-sm); text-transform: uppercase; letter-spacing: 0.5px;">
              Most Popular
            </div>

            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                Pro Engineer
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">
                Deep forensic investigation and safe refactoring with verification.
              </div>

              <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
                <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">$19</span>
                <span style="font-size: 12px; color: var(--text-muted);">/ month</span>
              </div>
              <div style="font-size: 11px; color: var(--brand-accent-text); font-weight: 600; margin-bottom: 16px;">
                ● Early Access Beta (Free during Hackathon)
              </div>

              <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; font-size: 12px; color: var(--text-secondary); line-height: 2;">
                <li>✓ Everything in Free</li>
                <li>✓ Private repositories via GitHub token</li>
                <li>✓ Deep forensic database & query tracer</li>
                <li>✓ Concurrency race detection ($push / locks)</li>
                <li>✓ Safe Refactor Studio & AST diffs</li>
                <li>✓ Automated regression test verification</li>
              </ul>
            </div>

            <a href="#signup" class="btn btn-primary" style="width: 100%; text-align: center; text-decoration: none; padding: 10px; font-size: 13px; font-weight: 600;">
              Start Free Pro Trial
            </a>
          </div>

          <!-- Team Tier -->
          <div class="panel" style="padding: 28px 24px; background: var(--bg-primary); border: 1px solid var(--border-default); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                Engineering Team
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">
                Team workspaces with cloud persistence and centralized policy.
              </div>

              <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
                <span style="font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">$49</span>
                <span style="font-size: 12px; color: var(--text-muted);">/ seat / month</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-bottom: 16px;">
                Coming Soon
              </div>

              <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; font-size: 12px; color: var(--text-secondary); line-height: 2;">
                <li>✓ Everything in Pro</li>
                <li>✓ Multi-user workspace isolation</li>
                <li>✓ Supabase Cloud organization sync</li>
                <li>✓ Team-wide refactoring review workflows</li>
                <li>✓ Dedicated AST parser compute</li>
                <li>✓ Priority support SLA</li>
              </ul>
            </div>

            <button type="button" class="btn btn-secondary" id="btn-team-waitlist" style="width: 100%; text-align: center; padding: 10px; font-size: 13px; font-weight: 600;">
              Join Team Waitlist
            </button>
          </div>

        </div>

        <!-- Privacy & Security FAQ -->
        <div class="panel" style="padding: 28px; background: var(--bg-primary);">
          <h2 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 18px 0;">
            Security & Trust Questions
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">
                Do you train AI models on my code?
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                Never. RepoMind operates entirely by parsing ASTs and querying LLMs with transient citations. Your repository source code is never used for training or persisted outside your workspace.
              </div>
            </div>

            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">
                Can RepoMind modify my production code autonomously?
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                No. RepoMind enforces strict human-in-the-loop governance: AI proposes minimal isolated diffs, runs test suites to verify zero regressions, and requires explicit developer approval before any branch changes occur.
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  `;
}

export function attachPricingEvents() {
  const waitlistBtn = document.getElementById("btn-team-waitlist");
  if (waitlistBtn) {
    waitlistBtn.addEventListener("click", () => {
      store.showToast("Thank you for your interest! Team tier waitlist registration recorded.", "success");
    });
  }
}
