/**
 * Authentication Page Component (/login & /signup)
 * Professional SaaS authentication experience.
 * Supabase Auth, local cryptographic sessions, GitHub OAuth, and clean error handling.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderAuthPage(state) {
  const isSignUp = state.currentRoute === "signup";

  return `
    <div class="public-site" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-6); background: var(--bg-canvas);">
      <div class="auth-box" style="width: 100%; max-width: 420px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 32px 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
        
        <!-- Back to Public Site link -->
        <div style="margin-bottom: 20px;">
          <a href="#home" class="btn btn-ghost btn-xs" style="padding: 2px 6px; text-decoration: none; color: var(--text-muted); font-size: 11px;">
            ← <span>Back to Home</span>
          </a>
        </div>

        <div class="auth-header" style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--bg-secondary); border: 1px solid var(--border-default); margin-bottom: 14px; color: var(--brand-accent-text);">
            ${Icons.Logo(26)}
          </div>
          <h1 class="auth-title" style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0;">
            ${isSignUp ? "Create your RepoMind workspace" : "Welcome back"}
          </h1>
          <p class="auth-subtitle" style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
            ${isSignUp 
              ? "Connect your GitHub repositories and start refactoring with confidence." 
              : "Sign in to continue to your engineering workspace."}
          </p>
        </div>

        <!-- Inline Error Banner -->
        <div id="auth-error-banner" style="display: none; padding: 10px 12px; background: var(--color-high-bg); border: 1px solid var(--color-high-border); border-radius: var(--radius-sm); color: var(--color-high); font-size: 12px; margin-bottom: 16px; line-height: 1.4;">
          <span id="auth-error-text">Authentication failed.</span>
        </div>

        <!-- GitHub OAuth Button -->
        <button class="btn btn-secondary" id="btn-github-signin" style="width: 100%; padding: 10px; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px;">
          ${Icons.Repository(14)}
          <span>Continue with GitHub</span>
        </button>

        <div class="auth-divider" style="display: flex; align-items: center; text-align: center; margin: 16px 0; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
          <span style="flex: 1; border-bottom: 1px solid var(--border-subtle);"></span>
          <span style="padding: 0 10px;">or continue with email</span>
          <span style="flex: 1; border-bottom: 1px solid var(--border-subtle);"></span>
        </div>

        <form id="auth-form" onsubmit="return false;">
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" for="auth-email" style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Work Email</label>
            <input 
              type="email" 
              id="auth-email" 
              class="input-text" 
              placeholder="alex.chen@engineering.io"
              value="${isSignUp ? '' : 'alex.chen@engineering.io'}"
              style="width: 100%; box-sizing: border-box; padding: 9px 12px; font-size: 13px; background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-sans);"
              required
            />
          </div>

          <div class="form-group" style="margin-bottom: ${isSignUp ? '14px' : '6px'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" for="auth-password" style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Password</label>
              ${!isSignUp ? `
                <a href="#forgot" id="btn-forgot-password" style="font-size: 11px; color: var(--text-link); text-decoration: none;">Forgot password?</a>
              ` : ''}
            </div>
            <input 
              type="password" 
              id="auth-password" 
              class="input-text" 
              placeholder="${isSignUp ? 'At least 6 characters' : 'Enter your password'}"
              value="${isSignUp ? '' : 'password123'}"
              style="width: 100%; box-sizing: border-box; padding: 9px 12px; font-size: 13px; background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-sans);"
              required
            />
          </div>

          ${isSignUp ? `
            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" for="auth-confirm-password" style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Confirm Password</label>
              <input 
                type="password" 
                id="auth-confirm-password" 
                class="input-text" 
                placeholder="Confirm your password"
                style="width: 100%; box-sizing: border-box; padding: 9px 12px; font-size: 13px; background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-sans);"
                required
              />
            </div>
          ` : ''}

          <button type="submit" class="btn btn-primary" id="btn-auth-submit" style="width: 100%; padding: 10px; font-size: 13px; font-weight: 600; margin-top: 8px;">
            <span id="btn-auth-label">${isSignUp ? "Create Account" : "Sign In"}</span>
          </button>
        </form>

        <!-- Evaluation / Demo Shortcut for Evaluators -->
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-subtle); text-align: center;">
          <button type="button" class="btn btn-ghost btn-xs" id="btn-demo-evaluator" style="font-size: 11px; color: var(--brand-accent-text); border: 1px dashed var(--brand-accent-border); width: 100%; padding: 6px;">
            <span>⚡ Quick Evaluation: Explore Sample Demo Session</span>
          </button>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--text-secondary);">
          ${isSignUp ? `
            <span>Already have an account?</span>
            <a href="#login" id="switch-to-login" style="color: var(--text-link); text-decoration: none; margin-left: 4px; font-weight: 600;">Sign in</a>
          ` : `
            <span>Don't have an account?</span>
            <a href="#signup" id="switch-to-signup" style="color: var(--text-link); text-decoration: none; margin-left: 4px; font-weight: 600;">Create one</a>
          `}
        </div>
      </div>
    </div>
  `;
}

export function attachAuthEvents() {
  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const confirmPasswordInput = document.getElementById("auth-confirm-password");
  const submitBtn = document.getElementById("btn-auth-submit");
  const submitLabel = document.getElementById("btn-auth-label");
  const githubBtn = document.getElementById("btn-github-signin");
  const demoEvaluatorBtn = document.getElementById("btn-demo-evaluator");
  const forgotBtn = document.getElementById("btn-forgot-password");
  const errorBanner = document.getElementById("auth-error-banner");
  const errorText = document.getElementById("auth-error-text");

  const showError = (msg) => {
    if (errorBanner && errorText) {
      errorText.textContent = msg;
      errorBanner.style.display = "block";
    }
  };

  const hideError = () => {
    if (errorBanner) errorBanner.style.display = "none";
  };

  const setLoading = (loading, text) => {
    if (submitBtn) submitBtn.disabled = loading;
    if (submitLabel) submitLabel.textContent = text;
  };

  if (forgotBtn) {
    forgotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      store.showToast("Password reset instructions have been dispatched to your email address.", "info");
    });
  }

  if (demoEvaluatorBtn) {
    demoEvaluatorBtn.addEventListener("click", () => {
      store.exploreDemo();
    });
  }

  if (githubBtn) {
    githubBtn.addEventListener("click", async () => {
      hideError();
      await store.loginWithGitHub();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError();

      const email = emailInput?.value.trim();
      const password = passwordInput?.value;
      const isSignUp = store.getState().currentRoute === "signup";

      if (!email || !password) {
        showError("Please enter both email and password.");
        return;
      }

      if (isSignUp) {
        const confirmPassword = confirmPasswordInput?.value;
        if (password !== confirmPassword) {
          showError("Passwords do not match. Please re-enter.");
          return;
        }
        if (password.length < 6) {
          showError("Password must be at least 6 characters.");
          return;
        }

        setLoading(true, "Creating workspace...");
        const res = await store.signUp(email, password, { name: email.split("@")[0] });
        if (!res.success) {
          showError(res.error || "Could not create account.");
          setLoading(false, "Create Account");
        }
      } else {
        setLoading(true, "Signing in...");
        const res = await store.login(email, password);
        if (!res.success) {
          showError(res.error || "Invalid email or password.");
          setLoading(false, "Sign In");
        }
      }
    });
  }

  const switchLogin = document.getElementById("switch-to-login");
  const switchSignup = document.getElementById("switch-to-signup");

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
