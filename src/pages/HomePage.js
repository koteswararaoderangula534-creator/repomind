/**
 * Home Page Component (Route: /)
 * Purpose: Answer "What is RepoMind?" concisely.
 * Introduces the product, core workflow, and brief preview without overloading.
 */

import { Icons } from "../components/Icons.js";
import { renderPublicHeader, attachPublicHeaderEvents } from "../components/PublicHeader.js";
import { renderPublicFooter, attachPublicFooterEvents } from "../components/PublicFooter.js";
import { store } from "../state/store.js";

export function renderHomePage(state) {
  return `
    <div class="public-site page-fade-in">
      ${renderPublicHeader(state)}

      <!-- 1. HERO SECTION -->
      <header class="public-hero">
        <div class="hero-pill">
          <span class="hero-pill-badge">RepoMind</span>
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
          <button class="btn btn-primary" id="home-cta-getstarted" style="padding: 9px 18px; font-size: 13px;">
            <span>Get Started</span>
            ${Icons.ArrowRight(12)}
          </button>
          <button class="btn btn-secondary" id="home-cta-product" style="padding: 9px 16px; font-size: 13px;">
            <span>Explore Product</span>
          </button>
        </div>

        <!-- 3. SHORT WORKFLOW DIAGRAM -->
        <div class="hero-workflow-diagram">
          <div class="workflow-track">
            <div class="workflow-node">
              <span class="workflow-node-label">01</span>
              <span class="workflow-node-title">Understand</span>
            </div>

            <div class="workflow-separator">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label">02</span>
              <span class="workflow-node-title">Detect</span>
            </div>

            <div class="workflow-separator">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label">03</span>
              <span class="workflow-node-title">Impact</span>
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

      <!-- 2. SHORT EXPLANATION SECTION -->
      <section class="public-section">
        <div class="section-container" style="max-width: 860px; text-align: center;">
          <div class="section-tag">Engineering Assistant</div>
          <h2 class="section-title">Turn unfamiliar repositories into structured workflows.</h2>
          <p style="font-size: var(--text-md); color: var(--text-secondary); line-height: 1.6; margin-top: 12px;">
            Instead of forcing developers to manually inspect hundreds of files or guess caller hierarchies, RepoMind builds an architectural understanding of the codebase and guides you safely from understanding to verified execution.
          </p>
        </div>
      </section>

      <!-- 4. BRIEF CAPABILITY PREVIEW (Teaser pointing to dedicated pages) -->
      <section class="public-section">
        <div class="section-container">
          <div class="section-header" style="text-align: center;">
            <div class="section-tag">Capabilities</div>
            <h2 class="section-title">Designed for code comprehension & safety</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
            <div class="what-card">
              <div class="what-card-tag">Architecture</div>
              <div class="what-card-title">Understand Topology</div>
              <div class="what-card-body" style="margin-bottom: 12px;">
                Extract module boundaries, entry points, and database flow without manual code reading.
              </div>
              <a href="#product" class="learn-more-link" data-route="product" style="font-size: 11px; color: var(--text-link); text-decoration: none; font-weight: 500;">
                Learn more in Product →
              </a>
            </div>

            <div class="what-card">
              <div class="what-card-tag">Blast Radius</div>
              <div class="what-card-title">Measure Impact</div>
              <div class="what-card-body" style="margin-bottom: 12px;">
                Trace downstream callers and dependent test suites before touching critical functions.
              </div>
              <a href="#how-it-works" class="learn-more-link" data-route="how-it-works" style="font-size: 11px; color: var(--text-link); text-decoration: none; font-weight: 500;">
                See How It Works →
              </a>
            </div>

            <div class="what-card">
              <div class="what-card-tag">Verification</div>
              <div class="what-card-title">Prove Correctness</div>
              <div class="what-card-body" style="margin-bottom: 12px;">
                Run automated test matrices to verify zero regressions before any change touches git.
              </div>
              <a href="#features" class="learn-more-link" data-route="features" style="font-size: 11px; color: var(--text-link); text-decoration: none; font-weight: 500;">
                Explore Features →
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. FINAL CTA -->
      <section class="final-cta-section">
        <div class="section-container" style="text-align: center;">
          <h2 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Ready to understand your codebase?
          </h2>
          <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-5);">
            Analyze your first repository in seconds and plan verified refactors.
          </p>

          <div style="display: flex; justify-content: center; gap: var(--space-3);">
            <button class="btn btn-primary" id="home-footer-getstarted" style="padding: 8px 18px; font-size: 13px;">
              <span>Get Started</span>
              ${Icons.ArrowRight(12)}
            </button>
            <button class="btn btn-secondary" id="home-footer-howitworks" style="padding: 8px 16px; font-size: 13px;">
              <span>See How It Works</span>
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

  const getStartedBtn = document.getElementById("home-cta-getstarted");
  const productBtn = document.getElementById("home-cta-product");
  const footerGetStartedBtn = document.getElementById("home-footer-getstarted");
  const footerHowItWorksBtn = document.getElementById("home-footer-howitworks");
  const learnMoreLinks = document.querySelectorAll(".learn-more-link[data-route]");

  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
  if (productBtn) {
    productBtn.addEventListener("click", () => store.setRoute("product"));
  }
  if (footerGetStartedBtn) {
    footerGetStartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
  if (footerHowItWorksBtn) {
    footerHowItWorksBtn.addEventListener("click", () => store.setRoute("how-it-works"));
  }

  learnMoreLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-route");
      if (target) store.setRoute(target);
    });
  });
}
