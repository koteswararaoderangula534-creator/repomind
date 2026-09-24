/**
 * Public Header Component
 * Consistent top navigation for all public marketing and information pages.
 * Highlights the active page cleanly and provides fast access to Sign In / Get Started.
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderPublicHeader(state) {
  const route = state.currentRoute;

  const navLinks = [
    { id: "product", label: "Product", href: "#product" },
    { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
    { id: "features", label: "Features", href: "#features" },
    { id: "why-repomind", label: "Why RepoMind", href: "#why-repomind" },
    { id: "trust", label: "Trust & Safety", href: "#trust" }
  ];

  return `
    <nav class="public-nav" role="navigation" aria-label="Main Website Navigation">
      <div class="public-nav-container">
        <div class="public-nav-left">
          <a href="#home" class="public-brand" id="brand-home-link" title="RepoMind Home">
            <div class="brand-icon">
              ${Icons.Logo(16)}
            </div>
            <span class="brand-name">RepoMind</span>
          </a>
        </div>

        <div class="public-nav-center">
          ${navLinks.map(link => `
            <a 
              href="${link.href}" 
              class="public-nav-link ${route === link.id ? 'active' : ''}" 
              data-nav-route="${link.id}"
            >
              ${link.label}
            </a>
          `).join("")}
        </div>

        <div class="public-nav-right">
          <button class="btn btn-ghost btn-sm" id="nav-signin-btn">
            Sign In
          </button>
          <button class="btn btn-primary btn-sm" id="nav-getstarted-btn">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  `;
}

export function attachPublicHeaderEvents() {
  const brandLink = document.getElementById("brand-home-link");
  const navLinks = document.querySelectorAll(".public-nav-link[data-nav-route]");
  const signinBtn = document.getElementById("nav-signin-btn");
  const getstartedBtn = document.getElementById("nav-getstarted-btn");

  if (brandLink) {
    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      store.setRoute("home");
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-nav-route");
      if (target) {
        store.setRoute(target);
      }
    });
  });

  if (signinBtn) {
    signinBtn.addEventListener("click", () => store.setRoute("login"));
  }

  if (getstartedBtn) {
    getstartedBtn.addEventListener("click", () => store.setRoute("signup"));
  }
}
