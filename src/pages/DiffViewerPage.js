/**
 * Page 8 — Diff Viewer
 * IDE-grade code review interface supporting Unified and Split (Before | After) diffs.
 * Includes line numbers, syntax coloring tokens, additions, deletions, and "WHY THIS CHANGED" banner.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderDiffViewerPage(state) {
  const isJunior = state.juniorMode;
  const diff = state.diffData;
  const mode = state.diffMode; // 'unified' | 'split'
  const whyText = isJunior ? diff.whyThisChanged.junior : diff.whyThisChanged.technical;

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.DiffViewer(18)}
            <span>Refactoring Diff Inspection</span>
          </h1>
          <p class="page-subtitle">
            Inspect staged changes at line-level granularity before running regression verification.
          </p>
        </div>

        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="diff-back-refactor-btn">
            ${Icons.Refactor(13)}
            <span>Adjust Refactor</span>
          </button>
          <button class="btn btn-primary btn-sm" id="diff-proceed-verify-btn">
            ${Icons.Verification(13)}
            <span>Verify With Test Suite</span>
          </button>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Understanding the Diff (Junior Mode)</div>
            <div class="junior-callout-text">
              In programming, a "diff" shows what lines were taken away (red with a minus <code>-</code>) and what lines were added (green with a plus <code>+</code>). Switch between "Unified" and "Split" view using the buttons below to compare before and after.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- The Professional Diff Container -->
      <div class="diff-container">
        <!-- Diff Header Toolbar -->
        <div class="diff-header">
          <div class="diff-file-path">
            ${Icons.FileCode(14)}
            <span>${diff.filePath}</span>
            <span class="diff-stats-badge">
              <span class="stat-add">+42</span>
              <span class="stat-del">-31</span>
            </span>
          </div>

          <!-- Unified / Split Mode Switcher -->
          <div style="display: flex; align-items: center; gap: 4px;">
            <div class="mode-toggle-container">
              <button 
                type="button" 
                class="mode-toggle-btn ${mode === 'unified' ? 'active' : ''}" 
                id="diff-mode-unified"
                title="Unified vertical diff"
              >
                Unified
              </button>
              <button 
                type="button" 
                class="mode-toggle-btn ${mode === 'split' ? 'active' : ''}" 
                id="diff-mode-split"
                title="Side-by-side Before | After diff"
              >
                Before | After
              </button>
            </div>
          </div>
        </div>

        <!-- "WHY THIS CHANGED" Banner -->
        <div class="diff-why-banner">
          <span class="diff-why-tag">WHY THIS CHANGED</span>
          <span class="diff-why-text">${whyText}</span>
        </div>

        <!-- Diff Viewer Body -->
        ${mode === "unified" ? renderUnifiedDiff(diff.unifiedDiff) : renderSplitDiff()}
      </div>

      <!-- Action Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4);">
        <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
          Git staged diff status: Ready for verification • Target branch: <code>main</code>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-reject-diff">
            <span>Reject Refactor</span>
          </button>
          <button class="btn btn-primary btn-sm" id="btn-verify-now">
            ${Icons.Verification(13)}
            <span>Run 42 Verification Tests</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderUnifiedDiff(lines) {
  return `
    <div class="diff-unified-view">
      ${lines.map(line => {
        const lineClass = line.type === 'addition' ? 'addition' : line.type === 'deletion' ? 'deletion' : '';
        return `
          <div class="diff-line ${lineClass}">
            <span class="diff-line-num">${line.lineNum !== undefined ? line.lineNum : ''}</span>
            <span class="diff-line-prefix">${line.prefix || ' '}</span>
            <span class="diff-line-text">${escapeHtml(line.text)}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderSplitDiff() {
  const beforeLines = [
    { num: 84, text: "def process_order(order_data: dict, user_id: str, db_session) -> dict:", del: false },
    { num: 85, text: "    # 1. Validation logic", del: true },
    { num: 86, text: "    if not order_data.get(\"items\") or len(order_data[\"items\"]) == 0:", del: true },
    { num: 87, text: "        raise ValueError(\"Order must contain at least one item\")", del: true },
    { num: 88, text: "    for item in order_data[\"items\"]:", del: true },
    { num: 89, text: "        if item.get(\"quantity\", 0) <= 0:", del: true },
    { num: 90, text: "            raise ValueError(f\"Invalid item quantity for item {item.get('id')}\")", del: true },
    { num: 91, text: "    # 2. Payment processing inline", del: true },
    { num: 92, text: "    total_amount = sum(item[\"price\"] * item[\"quantity\"] for item in order_data[\"items\"])", del: true },
    { num: 93, text: "    stripe_token = order_data.get(\"stripe_token\")", del: true },
    { num: 94, text: "    if not stripe_token:", del: true },
    { num: 95, text: "        raise ValueError(\"Missing payment token\")", del: true },
    { num: 96, text: "    charge = stripe.Charge.create(amount=int(total_amount * 100), ...)", del: true },
    { num: 97, text: "    # 3. Database persistence inline", del: true },
    { num: 98, text: "    order_record = Order(user_id=user_id, ...)", del: true },
    { num: 99, text: "    db_session.add(order_record)", del: true },
    { num: 100, text: "    # 4. Email notifications inline", del: true },
    { num: 101, text: "    notification_worker.dispatch_email_sync(payload)", del: true },
    { num: 102, text: "    return {\"order_id\": order_record.id, \"status\": \"completed\"}", del: false }
  ];

  const afterLines = [
    { num: 84, text: "def validate_order(order_data: dict) -> None:", add: true },
    { num: 85, text: "    if not order_data.get(\"items\"): raise ValueError(\"Empty items\")", add: true },
    { num: 86, text: "", add: true },
    { num: 87, text: "def process_payment(user_id: str, amount: float, token: str) -> str:", add: true },
    { num: 88, text: "    return stripe.Charge.create(amount=int(amount * 100), ...).id", add: true },
    { num: 89, text: "", add: true },
    { num: 90, text: "def save_order(db_session, user_id, amount, charge_id) -> Order:", add: true },
    { num: 91, text: "    record = Order(user_id=user_id, total_amount=amount, charge_id=charge_id)", add: true },
    { num: 92, text: "    db_session.add(record); db_session.commit(); return record", add: true },
    { num: 93, text: "", add: true },
    { num: 94, text: "def send_notification(email: str, order_id: str, amount: float) -> None:", add: true },
    { num: 95, text: "    notification_worker.dispatch_email_async({\"to\": email, \"order_id\": order_id})", add: true },
    { num: 96, text: "", add: true },
    { num: 97, text: "def process_order(order_data: dict, user_id: str, db_session) -> dict:", add: false },
    { num: 98, text: "    validate_order(order_data)", add: true },
    { num: 99, text: "    total = sum(i[\"price\"] * i[\"quantity\"] for i in order_data[\"items\"])", add: true },
    { num: 100, text: "    charge_id = process_payment(user_id, total, order_data[\"stripe_token\"])", add: true },
    { num: 101, text: "    record = save_order(db_session, user_id, total, charge_id)", add: true },
    { num: 102, text: "    send_notification(order_data.get(\"user_email\"), record.id, total)", add: true },
    { num: 103, text: "    return {\"order_id\": record.id, \"status\": \"completed\"}", add: false }
  ];

  return `
    <div class="diff-split-view">
      <div class="diff-split-column">
        <div class="diff-split-header">BEFORE (Monolithic Function)</div>
        ${beforeLines.map(l => `
          <div class="diff-line ${l.del ? 'deletion' : ''}">
            <span class="diff-line-num">${l.num}</span>
            <span class="diff-line-prefix">${l.del ? '-' : ' '}</span>
            <span class="diff-line-text">${escapeHtml(l.text)}</span>
          </div>
        `).join("")}
      </div>

      <div class="diff-split-column">
        <div class="diff-split-header">AFTER (Decomposed SRP Modules)</div>
        ${afterLines.map(l => `
          <div class="diff-line ${l.add ? 'addition' : ''}">
            <span class="diff-line-num">${l.num}</span>
            <span class="diff-line-prefix">${l.add ? '+' : ' '}</span>
            <span class="diff-line-text">${escapeHtml(l.text)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function attachDiffViewerEvents() {
  const unifiedBtn = document.getElementById("diff-mode-unified");
  const splitBtn = document.getElementById("diff-mode-split");
  const backRefactorBtn = document.getElementById("diff-back-refactor-btn");
  const proceedVerifyBtn = document.getElementById("diff-proceed-verify-btn");
  const verifyNowBtn = document.getElementById("btn-verify-now");
  const rejectBtn = document.getElementById("btn-reject-diff");

  if (unifiedBtn) {
    unifiedBtn.addEventListener("click", () => store.setState({ diffMode: "unified" }));
  }
  if (splitBtn) {
    splitBtn.addEventListener("click", () => store.setState({ diffMode: "split" }));
  }

  if (backRefactorBtn) {
    backRefactorBtn.addEventListener("click", () => store.setRoute("app/refactor"));
  }

  [proceedVerifyBtn, verifyNowBtn].forEach(btn => {
    btn?.addEventListener("click", () => store.setRoute("app/verification"));
  });

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      store.openConfirmationDialog({
        title: "Reject Refactor Staging?",
        message: "This will discard the generated decomposition plan for process_order(). No files have been written to disk.",
        confirmLabel: "Discard Changes",
        cancelLabel: "Keep Staging",
        isDangerous: true,
        onConfirm: () => {
          store.setState({ refactorStatus: "draft" });
          store.showToast("Refactor changes discarded", "info");
          store.setRoute("refactor");
        }
      });
    });
  }
}
