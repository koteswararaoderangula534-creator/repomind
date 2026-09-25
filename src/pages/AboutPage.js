/**
 * About Page Component (/about)
 * Company, Mission, and Core Engineering Principles.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderAboutPage(state) {
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
            <a href="#pricing" class="public-nav-link">Pricing</a>
            <a href="#about" class="public-nav-link active">About</a>
          </nav>

          <div class="public-header-actions">
            <a href="#login" class="btn btn-ghost btn-sm">Sign In</a>
            <a href="#signup" class="btn btn-primary btn-sm">Get Started</a>
          </div>
        </div>
      </header>

      <main style="max-width: 860px; margin: 0 auto; padding: 60px 24px 80px 24px;">
        <div style="margin-bottom: 40px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--brand-accent-subtle); border: 1px solid var(--brand-accent-border); font-size: 11px; font-family: var(--font-mono); color: var(--brand-accent-text); margin-bottom: 16px;">
            <span>ABOUT REPOMIND</span>
          </div>
          <h1 style="font-size: 34px; font-weight: 800; color: var(--text-primary); margin: 0 0 16px 0; letter-spacing: -0.6px;">
            Built for developers who value codebase comprehension and safe refactoring.
          </h1>
          <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.7; margin: 0;">
            Understanding unfamiliar repositories takes time. Modern software teams work in large, evolving codebases with layered dependencies, legacy routes, and hidden concurrency pitfalls. RepoMind was created to provide deterministic AST indexing paired with AI reasoning, giving engineers complete clarity into their code.
          </p>
        </div>

        <div class="panel" style="padding: 28px; background: var(--bg-primary); margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0;">
            Our Engineering Principles
          </h2>
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--brand-accent-text); margin-bottom: 4px;">
                1. Evidence Over Guesswork
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                Every architectural claim and code risk identified by RepoMind is backed by verifiable AST file citations. We explicitly distinguish between AI reasoning and verified ground truth.
              </div>
            </div>

            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--brand-accent-text); margin-bottom: 4px;">
                2. Humans Retain Ultimate Authority
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                AI should propose, but engineers decide. No autonomous code modification happens without human review, AST diff inspection, and test suite verification.
              </div>
            </div>

            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--brand-accent-text); margin-bottom: 4px;">
                3. Privacy and Workspace Isolation
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                Your codebase is your intellectual property. RepoMind isolates user workspace data with Row Level Security, never trains models on customer code, and operates securely.
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding-top: 20px;">
          <a href="#signup" class="btn btn-primary" style="padding: 10px 24px; font-size: 13px; font-weight: 600; text-decoration: none;">
            Start Exploring With RepoMind →
          </a>
        </div>
      </main>
    </div>
  `;
}

export function attachAboutEvents() {}
