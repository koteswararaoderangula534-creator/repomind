/**
 * Home Page Component (Route: /)
 * Phase 5 Master Landing Page:
 * Headline: "UNDERSTAND ANY CODEBASE."
 * Subtitle: "AI-Powered Codebase Intelligence & Forensic Analysis Platform"
 * Instant Ingress: GitHub URL Input, [Analyze Repository], [Explore Demo Repository]
 * 4-Step Workflow: Connect -> Analyze -> Understand -> Investigate
 * Zero forced login barrier.
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
      <header class="public-hero" style="padding-top: 56px; padding-bottom: 48px;">
        <div class="hero-pill" style="margin-bottom: 20px;">
          <span class="hero-pill-badge">Hybrid Intelligence Engine</span>
          <span>Deterministic AST Ground Truth + AI Semantic Interpretation</span>
        </div>

        <h1 class="hero-headline" style="font-size: 46px; font-weight: 800; letter-spacing: -1.2px; line-height: 1.1; margin-bottom: 16px;">
          UNDERSTAND ANY CODEBASE.
        </h1>

        <p style="font-size: 19px; font-weight: 600; color: var(--brand-accent-text); margin-bottom: 12px; letter-spacing: -0.2px;">
          AI-Powered Codebase Intelligence & Forensic Analysis Platform
        </p>

        <p class="hero-subtext" style="max-width: 720px; font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 32px;">
          RepoMind ingests any GitHub repository to uncover architectural topologies, trace end-to-end data flow lineages, verify active versus dormant databases, and mathematically prove concurrency race conditions.
        </p>

        <!-- INSTANT REPOSITORY INGRESS BAR -->
        <div style="width: 100%; max-width: 760px; background-color: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 18px 20px; box-shadow: var(--shadow-lg); margin-bottom: 24px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                ${Icons.Repository(13)}
                <span>Repository Ingress</span>
              </span>
              <span style="font-size: 11px; color: var(--color-success-light); font-weight: 500;">
                ● Live AST Extraction Ready
              </span>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 280px; position: relative;">
                <input 
                  type="url" 
                  id="home-repo-input" 
                  class="input-text" 
                  placeholder="https://github.com/owner/repository" 
                  value="https://github.com/university-sys/student-management-system"
                  style="width: 100%; height: 42px; font-size: 13px; font-family: var(--font-mono); padding: 0 14px; background-color: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm);"
                />
              </div>

              <button 
                class="btn btn-primary" 
                id="home-btn-analyze" 
                style="height: 42px; padding: 0 20px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;"
              >
                ${Icons.Play(12)}
                <span>Analyze Repository</span>
              </button>

              <button 
                class="btn btn-secondary" 
                id="home-btn-demo" 
                style="height: 42px; padding: 0 18px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 8px; border-color: var(--border-strong);"
              >
                ${Icons.CodeHealth(13)}
                <span>Explore Demo Repository</span>
              </button>
            </div>

            <!-- Quick Demo Pills -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
              <span style="font-size: 11px; color: var(--text-muted);">Sample targets:</span>
              <button type="button" class="btn btn-ghost btn-xs home-sample-pill" data-url="https://github.com/university-sys/student-management-system" style="font-size: 11px; padding: 2px 8px; font-family: var(--font-mono); border: 1px solid var(--border-subtle);">
                student-management-system (Forensic Case)
              </button>
              <button type="button" class="btn btn-ghost btn-xs home-sample-pill" data-url="https://github.com/fastapi/fastapi" style="font-size: 11px; padding: 2px 8px; font-family: var(--font-mono); border: 1px solid var(--border-subtle);">
                fastapi/fastapi
              </button>
              <button type="button" class="btn btn-ghost btn-xs home-sample-pill" data-url="https://github.com/pallets/flask" style="font-size: 11px; padding: 2px 8px; font-family: var(--font-mono); border: 1px solid var(--border-subtle);">
                pallets/flask
              </button>
            </div>
          </div>
        </div>

        <!-- 4-STEP VISUAL WORKFLOW -->
        <div class="hero-workflow-diagram" style="max-width: 960px; margin-top: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); font-weight: 600; margin-bottom: 12px; text-align: left;">
            Continuous Codebase Intelligence Pipeline
          </div>
          <div class="workflow-track">
            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">01</span>
              <span class="workflow-node-title" style="font-weight: 600;">Connect Repository</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">GitHub URL or Local Git</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">02</span>
              <span class="workflow-node-title" style="font-weight: 600;">Analyze Codebase</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">AST Symbols & Multi-Signal Classification</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">03</span>
              <span class="workflow-node-title" style="font-weight: 600;">Understand Architecture</span>
              <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Topology, Flow & DB Mapping</span>
            </div>

            <div class="workflow-separator" style="color: var(--text-muted); font-size: 16px;">→</div>

            <div class="workflow-node active-highlight" style="border-color: var(--brand-accent);">
              <span class="workflow-node-label" style="color: var(--brand-accent-text); font-weight: 700;">04</span>
              <span class="workflow-node-title" style="font-weight: 600;">Investigate Evidence</span>
              <span style="font-size: 10px; color: var(--brand-accent-text); margin-top: 2px;">Concurrency Proofs & Ask RepoMind</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 2. HYBRID ARCHITECTURE CALLOUT: GROUND TRUTH VS AI INTERPRETATION -->
      <section class="public-section" style="padding-top: 24px; padding-bottom: 24px;">
        <div class="section-container" style="max-width: 960px;">
          <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div style="border-right: 1px solid var(--border-subtle); padding-right: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-success" style="font-size: 10px; font-weight: 700;">VERIFIED EVIDENCE</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Deterministic AST Engine</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                100% mathematical ground truth. Parsed directly from source trees. File paths, line numbers, variable mutations, and database calls cannot hallucinate or drift.
              </p>
            </div>

            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-brand" style="font-size: 10px; font-weight: 700;">AI INTERPRETATION</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Semantic Reasoning Engine</span>
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                Synthesizes AST findings into actionable architecture summaries, root-cause hypotheses, impact blasts, and plain-English mental models with strict hallucination guards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. PLATFORM CAPABILITIES GRID -->
      <section class="public-section">
        <div class="section-container" style="max-width: 960px;">
          <div class="section-header" style="text-align: center; margin-bottom: 36px;">
            <div class="section-tag">Forensic Intelligence</div>
            <h2 class="section-title">Built for Serious Developer Investigation</h2>
            <p style="font-size: 14px; color: var(--text-secondary); max-width: 640px; margin: 8px auto 0;">
              Stop guessing caller trees and silent database truncations. RepoMind pinpoints critical runtime hazards before they hit production.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <!-- Card 1 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-high);">Database Forensics</div>
              <div class="what-card-title">Active vs Dormant Databases</div>
              <div class="what-card-body" style="margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                Distinguishes between configured clients and real write paths. Proves when Supabase is dormant while MongoDB receives live writes.
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text);">
                Cross-Checked AST Evidence
              </div>
            </div>

            <!-- Card 2 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-high);">Concurrency Risks</div>
              <div class="what-card-title">Race Condition Timelines</div>
              <div class="what-card-body" style="margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                Detects un-fenced <code style="font-size: 11px;">$push</code> mutations on arrays and generates millisecond-level interleaving collision proofs.
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text);">
                Deterministic Hazard Proofs
              </div>
            </div>

            <!-- Card 3 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-medium);">Data Integrity</div>
              <div class="what-card-title">Historical Loss Detection</div>
              <div class="what-card-body" style="margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                Flags single-record query patterns (<code style="font-size: 11px;">find_one()</code>) executing against time-series collections, catching silent data loss.
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text);">
                Query Pattern Forensics
              </div>
            </div>

            <!-- Card 4 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--brand-accent-text);">Data Flow Lineage</div>
              <div class="what-card-title">End-to-End Tracing</div>
              <div class="what-card-body" style="margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                Maps complete data journeys from camera capture components through API endpoints to persistence stores with zero manual grepping.
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text);">
                Caller-Callee AST Graph
              </div>
            </div>

            <!-- Card 5 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--color-success-light);">Investigation Assistant</div>
              <div class="what-card-title">Ask RepoMind</div>
              <div class="what-card-body" style="margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                Ask questions like "Why does data disappear?" and get answers cited directly to verified AST files and lines, with strict hallucination guards.
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text);">
                Citations & Line References
              </div>
            </div>

            <!-- Card 6 -->
            <div class="what-card">
              <div class="what-card-tag" style="color: var(--text-muted);">Comprehension Mode</div>
              <div class="what-card-title">Junior vs Senior Explanations</div>
              <div class="what-card-body" style="margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                Toggle dynamically between real-world mental analogies for junior developers and formal AST execution traces for staff engineers.
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--brand-accent-text);">
                Adaptive Mental Models
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. FINAL CTA -->
      <section class="final-cta-section" style="padding: 56px 0;">
        <div class="section-container" style="text-align: center; max-width: 720px;">
          <h2 style="font-size: 28px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; letter-spacing: -0.5px;">
            Ready to inspect your codebase?
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">
            Analyze any repository immediately or explore our pre-indexed university forensic case.
          </p>

          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-primary" id="home-footer-analyze" style="padding: 10px 22px; font-size: 13px; font-weight: 600;">
              ${Icons.Play(12)}
              <span>Analyze a Repository</span>
            </button>
            <button class="btn btn-secondary" id="home-footer-demo" style="padding: 10px 20px; font-size: 13px; font-weight: 500;">
              ${Icons.CodeHealth(13)}
              <span>Explore Demo Workspace</span>
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

  const analyzeBtn = document.getElementById("home-btn-analyze");
  const demoBtn = document.getElementById("home-btn-demo");
  const footerAnalyzeBtn = document.getElementById("home-footer-analyze");
  const footerDemoBtn = document.getElementById("home-footer-demo");
  const repoInput = document.getElementById("home-repo-input");
  const samplePills = document.querySelectorAll(".home-sample-pill");

  // Handle repository analysis from landing page
  if (analyzeBtn && repoInput) {
    analyzeBtn.addEventListener("click", () => {
      const url = repoInput.value.trim();
      if (url) {
        store.connectRepository(url, "main");
      }
    });

    repoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const url = repoInput.value.trim();
        if (url) {
          store.connectRepository(url, "main");
        }
      }
    });
  }

  // Handle explore demo repository
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      store.exploreDemo();
    });
  }

  if (footerAnalyzeBtn) {
    footerAnalyzeBtn.addEventListener("click", () => {
      if (repoInput) {
        repoInput.scrollIntoView({ behavior: "smooth", block: "center" });
        repoInput.focus();
      } else {
        store.setRoute("app/repository");
      }
    });
  }

  if (footerDemoBtn) {
    footerDemoBtn.addEventListener("click", () => {
      store.exploreDemo();
    });
  }

  // Quick sample pill clicks
  samplePills.forEach(pill => {
    pill.addEventListener("click", () => {
      const url = pill.getAttribute("data-url");
      if (url && repoInput) {
        repoInput.value = url;
        if (url.includes("student-management-system")) {
          store.exploreDemo();
        } else {
          store.connectRepository(url, "main");
        }
      }
    });
  });
}
