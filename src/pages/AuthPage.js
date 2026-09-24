/**
 * Authentication Page Component (/login & /signup)
 * Clean, minimal developer sign-in experience.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderAuthPage(state) {
  const isSignUp = state.currentRoute === "signup";

  return `
    <div class="public-site" style="display: flex; align-items: center; justify-content: center; padding: var(--space-6);">
      <div class="auth-box">
        <!-- Back to Public Site link -->
        <div style="margin-bottom: var(--space-4);">
          <a href="#home" class="btn btn-ghost btn-xs" style="padding: 2px 6px; text-decoration: none;">
            ${Icons.ArrowRight ? `<span style="transform: rotate(180deg); display: inline-flex;">${Icons.ArrowRight(11)}</span>` : "←"}
            <span>Back to RepoMind</span>
          </a>
        </div>

        <div class="auth-header">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--bg-tertiary); border: 1px solid var(--border-default); margin-bottom: 12px; color: var(--brand-accent-text);">
            ${Icons.Logo(20)}
          </div>
          <h1 class="auth-title">${isSignUp ? "Create your RepoMind account" : "Sign in to RepoMind"}</h1>
          <p class="auth-subtitle">
            ${isSignUp ? "Connect your GitHub repositories and start refactoring safely." : "Welcome back. Access your analyzed repositories and workflows."}
          </p>
        </div>

        <!-- Quick Demo One-Click Sign In -->
        <button class="btn btn-primary" id="btn-demo-signin" style="width: 100%; padding: 9px; font-size: 13px; margin-bottom: 12px;">
          <span>Continue as Alex Chen (Demo)</span>
          ${Icons.ArrowRight(12)}
        </button>

        <!-- GitHub OAuth Button -->
        <button class="btn btn-secondary" id="btn-github-signin" style="width: 100%; padding: 8px; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${Icons.Repository(14)}
          <span>Continue with GitHub</span>
        </button>

        <div class="auth-divider">or sign in with email</div>

        <form id="auth-email-form" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="auth-email">Work Email</label>
            <input 
              type="email" 
              id="auth-email" 
              class="input-text" 
              placeholder="alex.chen@engineering.io"
              value="alex.chen@engineering.io"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="auth-password">Password</label>
            <input 
              type="password" 
              id="auth-password" 
              class="input-text" 
              value="••••••••••••"
              required
            />
          </div>

          <button type="submit" class="btn btn-secondary" id="btn-email-submit" style="width: 100%; padding: 8px; margin-top: 6px;">
            <span>${isSignUp ? "Create Account" : "Sign In with Email"}</span>
          </button>
        </form>

        <div style="margin-top: var(--space-4); text-align: center; font-size: 11px; color: var(--text-muted);">
          ${isSignUp ? `
            <span>Already have an account?</span>
            <a href="#login" id="switch-to-login" style="color: var(--text-link); text-decoration: none; margin-left: 4px;">Sign In</a>
          ` : `
            <span>New to RepoMind?</span>
            <a href="#signup" id="switch-to-signup" style="color: var(--text-link); text-decoration: none; margin-left: 4px;">Create an account</a>
          `}
        </div>
      </div>
    </div>
  `;
}

export function attachAuthEvents() {
  const demoBtn = document.getElementById("btn-demo-signin");
  const ghBtn = document.getElementById("btn-github-signin");
  const form = document.getElementById("auth-email-form");
  const emailInput = document.getElementById("auth-email");
  const switchLogin = document.getElementById("switch-to-login");
  const switchSignup = document.getElementById("switch-to-signup");

  const doLogin = (email) => {
    store.login(email || "alex.chen@engineering.io");
  };

  if (demoBtn) {
    demoBtn.addEventListener("click", () => doLogin("alex.chen@engineering.io"));
  }

  if (ghBtn) {
    ghBtn.addEventListener("click", () => doLogin("github.developer@repomind.dev"));
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput?.value.trim() || "alex.chen@engineering.io";
      doLogin(email);
    });
  }

  if (switchLogin) {
    switchLogin.addEventListener("click", (e) => {
      e.preventDefault();
      store.setRoute("login");
    });
  }

  if (switchSignup) {
    switchSignup.addEventListener("click", (e) => {
      e.preventDefault();
      store.setRoute("signup");
    });
  }
}
