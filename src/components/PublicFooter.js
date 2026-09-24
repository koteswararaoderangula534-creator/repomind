/**
 * Public Footer Component
 * Minimal, professional footer for all public pages.
 */

import { Icons } from "./Icons.js";
import { store } from "../state/store.js";

export function renderPublicFooter() {
  return `
    <footer class="public-footer" role="contentinfo">
      <div class="footer-container">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="brand-icon" style="width: 18px; height: 18px;">
            ${Icons.Logo(13)}
          </div>
          <span style="font-weight: 700; color: var(--text-primary);">RepoMind</span>
          <span style="color: var(--text-muted); font-size: 11px;">— Autonomous Codebase Understanding & Safe Refactoring</span>
        </div>

        <div class="footer-links">
          <a href="#home" class="footer-nav-link" data-route="home">Home</a>
          <a href="#product" class="footer-nav-link" data-route="product">Product</a>
          <a href="#how-it-works" class="footer-nav-link" data-route="how-it-works">How It Works</a>
          <a href="#features" class="footer-nav-link" data-route="features">Features</a>
          <a href="#why-repomind" class="footer-nav-link" data-route="why-repomind">Why RepoMind</a>
          <a href="#trust" class="footer-nav-link" data-route="trust">Trust & Safety</a>
          <a href="javascript:void(0)" id="footer-contact-link">Contact</a>
        </div>
      </div>
    </footer>
  `;
}

export function attachPublicFooterEvents() {
  const links = document.querySelectorAll(".footer-nav-link[data-route]");
  const contactLink = document.getElementById("footer-contact-link");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const route = link.getAttribute("data-route");
      if (route) {
        store.setRoute(route);
      }
    });
  });

  if (contactLink) {
    contactLink.addEventListener("click", () => {
      store.showToast("Contact engineering: support@repomind.dev", "info");
    });
  }
}
