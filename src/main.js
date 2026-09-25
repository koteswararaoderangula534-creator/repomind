/**
 * RepoMind Application Bootstrap & Orchestrator
 * Strictly separates the Public Website into dedicated pages (ONE PAGE = ONE PURPOSE)
 * and isolates the Authenticated Developer Workspace.
 */

import { store } from "./state/store.js";

// Dedicated Public Pages
import { renderHomePage, attachHomePageEvents } from "./pages/HomePage.js";
import { renderProductPage, attachProductPageEvents } from "./pages/ProductPage.js";
import { renderHowItWorksPage, attachHowItWorksPageEvents } from "./pages/HowItWorksPage.js";
import { renderFeaturesPage, attachFeaturesPageEvents } from "./pages/FeaturesPage.js";
import { renderWhyRepoMindPage, attachWhyRepoMindPageEvents } from "./pages/WhyRepoMindPage.js";
import { renderTrustPage, attachTrustPageEvents } from "./pages/TrustPage.js";
import { renderPricingPage, attachPricingEvents } from "./pages/PricingPage.js";
import { renderAboutPage, attachAboutEvents } from "./pages/AboutPage.js";
import { renderLegalPage, attachLegalEvents } from "./pages/LegalPage.js";

// Authentication Page
import { renderAuthPage, attachAuthEvents } from "./pages/AuthPage.js";

// Authenticated Developer Workspace
import { renderWorkspaceHome, attachWorkspaceHomeEvents } from "./pages/WorkspaceHome.js";
import { renderTopbar, attachTopbarEvents } from "./components/Topbar.js";
import { renderSidebar, attachSidebarEvents } from "./components/Sidebar.js";
import { renderCodeInspector, attachCodeInspectorEvents } from "./components/CodeInspectorModal.js";
import { renderConfirmationDialog, attachConfirmationDialogEvents } from "./components/ConfirmationDialog.js";
import { renderCommandPalette, attachCommandPaletteEvents } from "./components/CommandPalette.js";

import { renderRepositoryConnection, attachRepositoryConnectionEvents } from "./pages/RepositoryConnection.js";
import { renderRepositoryOverview, attachRepositoryOverviewEvents } from "./pages/RepositoryOverview.js";
import { renderRepositoriesPage, attachRepositoriesEvents } from "./pages/RepositoriesPage.js";
import { renderAskAI, attachAskAIEvents } from "./pages/AskAI.js";
import { renderArchitecturePage, attachArchitectureEvents } from "./pages/ArchitecturePage.js";
import { renderCodeHealthPage, attachCodeHealthEvents } from "./pages/CodeHealthPage.js";
import { renderImpactAnalysisPage, attachImpactAnalysisEvents } from "./pages/ImpactAnalysisPage.js";
import { renderRefactorPage, attachRefactorEvents } from "./pages/RefactorPage.js";
import { renderDiffViewerPage, attachDiffViewerEvents } from "./pages/DiffViewerPage.js";
import { renderVerificationPage, attachVerificationEvents } from "./pages/VerificationPage.js";
import { renderSettingsPage, attachSettingsEvents } from "./pages/SettingsPage.js";
import { renderForensicPage, attachForensicEvents } from "./pages/ForensicPage.js";

function renderApp() {
  const state = store.getState();
  const root = document.getElementById("app");
  if (!root) return;

  // Sync theme attribute
  document.documentElement.setAttribute("data-theme", state.theme);

  const rawRoute = state.currentRoute || "home";
  const route = rawRoute.replace(/^\//, "");

  // =========================================================================
  // 1. DEDICATED PUBLIC WEBSITE PAGES (One Page = One Purpose)
  // =========================================================================

  if (route === "home" || route === "") {
    root.innerHTML = `
      ${renderHomePage(state)}
      ${renderToastContainer(state)}
    `;
    attachHomePageEvents();
    return;
  }

  if (route === "product") {
    root.innerHTML = `
      ${renderProductPage(state)}
      ${renderToastContainer(state)}
    `;
    attachProductPageEvents();
    return;
  }

  if (route === "how-it-works") {
    root.innerHTML = `
      ${renderHowItWorksPage(state)}
      ${renderToastContainer(state)}
    `;
    attachHowItWorksPageEvents();
    return;
  }

  if (route === "features") {
    root.innerHTML = `
      ${renderFeaturesPage(state)}
      ${renderToastContainer(state)}
    `;
    attachFeaturesPageEvents();
    return;
  }

  if (route === "why-repomind") {
    root.innerHTML = `
      ${renderWhyRepoMindPage(state)}
      ${renderToastContainer(state)}
    `;
    attachWhyRepoMindPageEvents();
    return;
  }

  if (route === "trust") {
    root.innerHTML = `
      ${renderTrustPage(state)}
      ${renderToastContainer(state)}
    `;
    attachTrustPageEvents();
    return;
  }

  if (route === "pricing") {
    root.innerHTML = `
      ${renderPricingPage(state)}
      ${renderToastContainer(state)}
    `;
    attachPricingEvents();
    return;
  }

  if (route === "about") {
    root.innerHTML = `
      ${renderAboutPage(state)}
      ${renderToastContainer(state)}
    `;
    attachAboutEvents();
    return;
  }

  if (route === "privacy" || route === "terms") {
    root.innerHTML = `
      ${renderLegalPage(state)}
      ${renderToastContainer(state)}
    `;
    attachLegalEvents();
    return;
  }

  // =========================================================================
  // 2. AUTHENTICATION PAGES (/login & /signup)
  // =========================================================================

  if (route === "login" || route === "signup") {
    root.innerHTML = `
      ${renderAuthPage(state)}
      ${renderToastContainer(state)}
    `;
    attachAuthEvents();
    return;
  }

  // =========================================================================
  // 3. AUTHENTICATED DEVELOPER WORKSPACE (Accessible only when authenticated)
  // =========================================================================

  let pageContent = "";
  let attachPageEvents = () => {};

  if (route === "app" || route === "app-home") {
    pageContent = renderWorkspaceHome(state);
    attachPageEvents = attachWorkspaceHomeEvents;
  } else if (route === "app/repositories" || route === "repositories") {
    pageContent = renderRepositoriesPage(state);
    attachPageEvents = attachRepositoriesEvents;
  } else if (route === "app/repository" || route === "connection") {
    pageContent = renderRepositoryConnection(state);
    attachPageEvents = attachRepositoryConnectionEvents;
  } else if (route === "app/overview" || route === "overview") {
    pageContent = renderRepositoryOverview(state);
    attachPageEvents = attachRepositoryOverviewEvents;
  } else if (route === "app/ask" || route === "ask-ai") {
    pageContent = renderAskAI(state);
    attachPageEvents = attachAskAIEvents;
  } else if (route === "app/architecture" || route === "architecture") {
    pageContent = renderArchitecturePage(state);
    attachPageEvents = attachArchitectureEvents;
  } else if (route === "app/forensic" || route === "forensic") {
    pageContent = renderForensicPage(state);
    attachPageEvents = attachForensicEvents;
  } else if (route === "app/code-health" || route === "code-health") {
    pageContent = renderCodeHealthPage(state);
    attachPageEvents = attachCodeHealthEvents;
  } else if (route === "app/impact" || route === "impact-analysis") {
    pageContent = renderImpactAnalysisPage(state);
    attachPageEvents = attachImpactAnalysisEvents;
  } else if (route === "app/refactor" || route === "refactor") {
    pageContent = renderRefactorPage(state);
    attachPageEvents = attachRefactorEvents;
  } else if (route === "app/diff" || route === "diff-viewer") {
    pageContent = renderDiffViewerPage(state);
    attachPageEvents = attachDiffViewerEvents;
  } else if (route === "app/verification" || route === "verification") {
    pageContent = renderVerificationPage(state);
    attachPageEvents = attachVerificationEvents;
  } else if (route === "app/settings" || route === "settings") {
    pageContent = renderSettingsPage(state);
    attachPageEvents = attachSettingsEvents;
  } else {
    pageContent = renderRepositoryOverview(state);
    attachPageEvents = attachRepositoryOverviewEvents;
  }

  // Compose Full Authenticated Shell
  root.innerHTML = `
    ${renderTopbar(state)}

    <div class="main-shell">
      ${renderSidebar(state)}
      
      <main class="main-workspace" id="main-workspace">
        ${pageContent}
      </main>
    </div>

    <!-- Statusbar -->
    <footer class="statusbar" role="contentinfo">
      <div class="statusbar-left">
        <span class="status-indicator">
          <span class="status-dot ${state.connectionStatus === 'analyzing' || state.verificationStatus === 'running' ? 'working' : ''}"></span>
          <span>${state.connectionStatus === 'analyzing' ? 'AST Engine: Analyzing repository...' : state.verificationStatus === 'running' ? 'Verification: Running test suites...' : 'RepoMind Engine: Ready'}</span>
        </span>
        <span style="color: var(--border-default);">|</span>
        <span>Branch: <strong>${state.repository ? state.repository.branch : 'main'}</strong></span>
        <span>Findings: <strong>${state.findings.length} active</strong></span>
      </div>

      <div class="statusbar-right">
        <span>Mode: <strong style="color: var(--brand-accent-text);">${state.juniorMode ? 'Junior Friendly' : 'Technical Senior'}</strong></span>
        <span style="color: var(--border-default);">|</span>
        <span>Verification: <strong style="color: var(--color-success-light);">${state.verificationData?.passedCount || 42}/42 Passed</strong></span>
      </div>
    </footer>

    <!-- Overlay Modals & Dialogs -->
    ${renderCodeInspector(state)}
    ${renderConfirmationDialog(state)}
    ${renderCommandPalette(state)}

    <!-- Toast Notifications Container -->
    ${renderToastContainer(state)}
  `;

  // Attach all Shell & Page Events
  attachTopbarEvents();
  attachSidebarEvents();
  attachCodeInspectorEvents();
  attachConfirmationDialogEvents();
  attachCommandPaletteEvents();
  attachPageEvents();
}

function renderToastContainer(state) {
  return `
    <div class="toast-container" id="toast-container">
      ${state.toasts.map(toast => `
        <div class="toast">
          <span style="color: ${toast.type === 'success' ? 'var(--color-success-light)' : toast.type === 'high' ? 'var(--color-high)' : 'var(--brand-accent-text)'};">
            ●
          </span>
          <span>${toast.message}</span>
        </div>
      `).join("")}
    </div>
  `;
}

// Router & Browser Navigation
function initRouter() {
  const syncRouteWithHash = () => {
    let rawHash = window.location.hash.replace("#", "") || "home";
    if (rawHash.startsWith("/")) rawHash = rawHash.slice(1);

    // store.setRoute enforces authentication guards and redirects unauthenticated users
    store.setRoute(rawHash);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  syncRouteWithHash();
  window.addEventListener("hashchange", syncRouteWithHash);

  // Global Keyboard Navigation (Ctrl+K or Cmd+K)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (store.getState().isAuthenticated) {
        store.toggleCommandPalette();
      }
    }
    if (e.key === "Escape") {
      if (store.getState().commandPaletteOpen) store.toggleCommandPalette();
      if (store.getState().codeInspector.isOpen) store.closeCodeInspector();
      if (store.getState().confirmationDialog.isOpen) store.closeConfirmationDialog();
    }
  });
}

// Subscribe to state changes and re-render
store.subscribe(() => {
  renderApp();
});

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  renderApp();
});
