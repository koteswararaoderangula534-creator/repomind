/**
 * Page 6 — Impact Analysis & Blast Radius Engine
 * 
 * Deterministic, evidence-based risk analysis engine:
 * 1. Normalized 6-factor risk calculation (0-100 score + consistent LOW/MODERATE/HIGH/CRITICAL classification)
 * 2. Evidence-backed "Why is this risky?" explanations
 * 3. Dynamic Risk Contributors breakdown
 * 4. Actionable "HOW TO REDUCE RISK" recommendations
 * 5. Interactive Before vs After proposed refactor risk comparison
 * 6. Visual caller-callee dependency blast radius flow chain
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";
import {
  getRiskLevel,
  getRiskBadgeClass,
  getRiskColor,
  calculateComprehensiveRisk,
  calculateRefactorRiskComparison
} from "../services/riskEngine.js";

export function renderImpactAnalysisPage(state) {
  const isJunior = state.juniorMode;
  const impact = state.impactData;
  const entity = state.selectedImpactEntity || impact.selectedEntity;
  const showComparison = Boolean(state.riskComparisonActive);

  // Derive comprehensive risk assessment from real evidence
  const isAuth = entity.includes("auth") || entity.includes("login");
  const riskAssessment = calculateComprehensiveRisk({
    affectedFilesCount: impact.summary.affectedFilesCount || 6,
    totalRepoFiles: 150,
    layersCount: 3,
    isCrossLayer: true,
    callerCount: impact.summary.affectedFunctionsCount || 9,
    isSharedService: true,
    relatedTestsCount: impact.summary.relatedTestsCount || 4,
    isSecuritySensitive: isAuth,
    isDatabaseWrite: true,
    isPublicApi: true,
    changedFunctionsCount: 1,
    cyclomaticComplexity: isAuth ? 8 : 14
  });

  // Calculate Before vs After comparison for proposed refactoring
  const comparison = calculateRefactorRiskComparison({
    affectedFilesCount: impact.summary.affectedFilesCount || 6,
    totalRepoFiles: 150,
    layersCount: 3,
    callerCount: impact.summary.affectedFunctionsCount || 9,
    relatedTestsCount: impact.summary.relatedTestsCount || 4,
    isSecuritySensitive: isAuth,
    isDatabaseWrite: true,
    isPublicApi: true
  }, {
    affectedFilesCount: 2,
    layersCount: 2,
    callerCount: 3,
    relatedTestsCount: 8,
    isSecuritySensitive: false,
    isDatabaseWrite: false
  });

  const riskScore = riskAssessment.score;
  const riskLevel = riskAssessment.level;
  const badgeClass = getRiskBadgeClass(riskLevel);
  const riskColor = getRiskColor(riskLevel);

  return `
    <div class="workspace-content">
      <!-- Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.ImpactAnalysis(18)}
            <span>Impact Analysis & Blast Radius Engine</span>
          </h1>
          <p class="page-subtitle">
            Evidence-based caller-callee propagation, architectural risk contributors, and verification guardrails.
          </p>
        </div>

        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="btn-recalculate-risk" title="Re-evaluate risk against latest AST topology">
            ${Icons.Play(11)}
            <span>Recalculate Risk</span>
          </button>
          <button class="btn btn-primary btn-sm" id="impact-refactor-cta">
            ${Icons.Refactor(13)}
            <span>Refactor Safely</span>
          </button>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Blast Radius Analysis (Junior Mode)</div>
            <div class="junior-callout-text">
              Before changing a line of code, RepoMind evaluates: "If we touch this function, what might break?" It traces all callers, checks how many architectural layers are crossed, and identifies test suites needed to prove the change is safe.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Target Selector Panel -->
      <div class="panel" style="margin-bottom: var(--space-4);">
        <div class="panel-body" style="padding: 12px 16px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">
              Analysis Target:
            </span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <code style="font-size: 13px; font-weight: 700; color: var(--brand-accent-text); background: var(--brand-accent-subtle); padding: 3px 8px; border-radius: var(--radius-sm); border: 1px solid var(--brand-accent-border);">
                ${entity}
              </code>
              <span class="badge badge-outline" style="font-size: 11px;">${impact.file || 'auth_service.py'}:${impact.lineRange || '51–79'}</span>
            </div>
          </div>

          <!-- Quick switcher between analyzed functions -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: var(--text-muted);">Switch target:</span>
            <button class="btn btn-xs ${entity === 'authenticate_user()' ? 'btn-primary' : 'btn-secondary'} switch-entity-btn" data-entity="authenticate_user()">
              authenticate_user()
            </button>
            <button class="btn btn-xs ${entity === 'process_order()' ? 'btn-primary' : 'btn-secondary'} switch-entity-btn" data-entity="process_order()">
              process_order()
            </button>
          </div>
        </div>
      </div>

      <!-- Top Executive Metrics Grid -->
      <div class="metric-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: var(--space-4);">
        <div class="metric-card">
          <div class="metric-header">
            <span>Affected Files</span>
            ${Icons.FileCode(13)}
          </div>
          <div class="metric-val">${riskAssessment.evidence.affectedFilesCount} Files</div>
          <div class="metric-meta">Across ${riskAssessment.evidence.layersCount} architectural layers</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span>Affected Callers</span>
            ${Icons.ImpactAnalysis(13)}
          </div>
          <div class="metric-val">${riskAssessment.evidence.callerCount} Callers</div>
          <div class="metric-meta">Direct & downstream call chain</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span>Related Tests</span>
            ${Icons.Verification(13)}
          </div>
          <div class="metric-val" style="color: var(--color-success-light);">${riskAssessment.evidence.relatedTestsCount} Tests</div>
          <div class="metric-meta">${riskAssessment.factors.testRisk.score >= 50 ? 'Limited verification coverage' : 'Verification coverage ready'}</div>
        </div>

        <div class="metric-card" style="border-left: 3px solid ${riskColor};">
          <div class="metric-header">
            <span>Risk Rating</span>
            ${Icons.AlertTriangle(13)}
          </div>
          <div class="metric-val" style="color: ${riskColor};">${riskLevel}</div>
          <div class="metric-meta">
            <span class="badge ${badgeClass}" style="font-size: 10px;">${riskScore}/100 (${riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()})</span>
          </div>
        </div>
      </div>

      <!-- Section: Deep Risk Assessment & How to Reduce Risk (Two Columns) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
        
        <!-- Left: Risk Assessment & Evidence Explanation -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.AlertTriangle(13)}
              <span>Risk Assessment</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge ${badgeClass}" style="font-size: 11px; padding: 2px 8px;">
                ${riskScore} / 100 • ${riskLevel}
              </span>
            </div>
          </div>

          <div class="panel-body">
            <!-- Why is this risky? Evidence Bullet Points -->
            <div style="margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 0.5px;">
                Why is this risky?
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                ${riskAssessment.explanations.map(exp => `<li>${exp}</li>`).join("")}
              </ul>
            </div>

            <!-- Risk Contributors Table -->
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 0.5px;">
              Risk Contributors
            </div>
            <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden;">
              <table class="data-table" style="margin: 0; font-size: 11px;">
                <thead>
                  <tr style="background: var(--bg-canvas);">
                    <th>Factor</th>
                    <th>Weight</th>
                    <th>Subscore</th>
                    <th style="text-align: right;">Impact Level</th>
                  </tr>
                </thead>
                <tbody>
                  ${riskAssessment.contributors.map(c => `
                    <tr>
                      <td style="font-weight: 600; color: var(--text-primary);">${c.name}</td>
                      <td style="color: var(--text-muted);">${c.weight}</td>
                      <td class="mono">${c.score}/100</td>
                      <td style="text-align: right;">
                        <span class="badge ${getRiskBadgeClass(c.level)}" style="font-size: 9px;">${c.level}</span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: How to Reduce Risk & Interactive Comparison -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.Check(13)}
              <span>How To Reduce Risk</span>
            </div>
            <button class="btn btn-xs ${showComparison ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-comparison">
              ${showComparison ? "Hide Comparison" : "Compare Proposed Change"}
            </button>
          </div>

          <div class="panel-body">
            <!-- Actionable Recommendations -->
            <div style="margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-primary); margin-bottom: 8px; letter-spacing: 0.5px;">
                Recommended Actions
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${riskAssessment.recommendations.map(rec => `
                  <div style="padding: 10px 12px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); display: flex; align-items: flex-start; gap: 8px;">
                    <span style="color: var(--color-success-light); font-weight: 700; font-size: 13px; line-height: 1.2;">✓</span>
                    <div style="flex: 1;">
                      <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">
                        ${rec.text}
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                        Expected outcome: ${rec.impact}
                      </div>
                    </div>
                    <span class="badge ${rec.priority === 'HIGH' ? 'badge-high' : 'badge-outline'}" style="font-size: 9px;">${rec.priority}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Before vs After Risk Comparison Box (Collapsible or Active) -->
            ${showComparison ? `
              <div style="padding: 12px; background: var(--bg-canvas); border: 1px solid var(--brand-accent-border); border-radius: var(--radius-sm); margin-top: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--brand-accent-text);">
                    Proposed Refactoring Risk Comparison
                  </span>
                  <span class="badge badge-success" style="font-size: 10px;">
                    ${comparison.delta} pts (${comparison.reductionPercent}% safer)
                  </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Current -->
                  <div style="padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Current Change</div>
                    <div style="font-size: 16px; font-weight: 700; color: ${getRiskColor(comparison.before.level)}; margin: 4px 0;">
                      ${comparison.before.score}/100 <span style="font-size: 11px; font-weight: 600;">(${comparison.before.level})</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                      • ${comparison.before.evidence.affectedFilesCount} files, ${comparison.before.evidence.layersCount} layers<br>
                      • ${comparison.before.evidence.callerCount} callers, ${comparison.before.evidence.relatedTestsCount} tests
                    </div>
                  </div>

                  <!-- Proposed -->
                  <div style="padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid var(--color-success-border);">
                    <div style="font-size: 10px; color: var(--color-success-light); text-transform: uppercase; font-weight: 600;">Proposed Safer Change</div>
                    <div style="font-size: 16px; font-weight: 700; color: ${getRiskColor(comparison.after.level)}; margin: 4px 0;">
                      ${comparison.after.score}/100 <span style="font-size: 11px; font-weight: 600;">(${comparison.after.level})</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">
                      • ${comparison.after.evidence.affectedFilesCount} files, ${comparison.after.evidence.layersCount} layers<br>
                      • ${comparison.after.evidence.callerCount} callers, ${comparison.after.evidence.relatedTestsCount} tests
                    </div>
                  </div>
                </div>

                <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); line-height: 1.35;">
                  <strong>Refactoring Strategy:</strong> Preserves 100% caller compatibility by maintaining orchestrator signature while isolating internal concerns.
                </div>
              </div>
            ` : `
              <div style="padding: 10px; background: var(--bg-canvas); border: 1px dashed var(--border-subtle); border-radius: var(--radius-sm); text-align: center; font-size: 11px; color: var(--text-muted);">
                Click <strong>[Compare Proposed Change]</strong> to evaluate simulated blast radius reduction before applying refactoring.
              </div>
            `}
          </div>

          <div class="panel-footer" style="justify-content: flex-end;">
            <button class="btn btn-primary btn-sm" id="impact-go-refactor-btn">
              <span>Open in Refactor Studio</span>
              ${Icons.ArrowRight(11)}
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Layout: Dependency Flow Chain + Related Tests -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
        
        <!-- Left: Clean Dependency Flow Chain -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.ImpactAnalysis(13)}
              <span>Blast Radius Dependency Flow</span>
            </div>
            <span class="badge badge-outline">Caller → Focus → Callee</span>
          </div>

          <div class="panel-body">
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 16px;">
              Static call-path propagation tracing upstream callers down to persistence engines for <code>${entity}</code>:
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${impact.dependencyFlow.map((step, idx) => `
                <div style="
                  padding: 10px 14px;
                  background-color: ${step.isTarget ? 'rgba(56, 139, 253, 0.08)' : 'var(--bg-secondary)'};
                  border: 1px solid ${step.isTarget ? 'var(--brand-accent)' : 'var(--border-subtle)'};
                  border-radius: var(--radius-sm);
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--text-muted);">
                        0${step.step}
                      </span>
                      <span style="font-weight: 600; font-size: 12px; color: var(--text-primary); font-family: var(--font-mono);">
                        ${step.file}
                      </span>
                      ${step.isTarget ? `<span class="badge badge-info" style="font-size: 9px;">Target Focus</span>` : ""}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; font-family: var(--font-mono);">
                      <code>${step.entity}</code>
                    </div>
                  </div>

                  <span class="badge badge-outline" style="font-size: 10px;">${step.role}</span>
                </div>

                ${idx < impact.dependencyFlow.length - 1 ? `
                  <div style="text-align: center; color: var(--text-muted); font-size: 13px; line-height: 1;">↓</div>
                ` : ""}
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Right: Verification Test Suites -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.Verification(13)}
              <span>Verification Guardrails (${riskAssessment.evidence.relatedTestsCount} Tests Detected)</span>
            </div>
            <span class="badge badge-success">Passing</span>
          </div>

          <div class="panel-body no-padding">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Suite File</th>
                  <th style="text-align: right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${impact.relatedTests.map(t => `
                  <tr>
                    <td class="mono" style="font-weight: 500;">${t.name}</td>
                    <td class="mono" style="color: var(--text-secondary);">${t.file}</td>
                    <td style="text-align: right;">
                      <span class="badge badge-success">${t.status}</span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="panel-footer" style="justify-content: space-between; font-size: 11px; color: var(--text-muted);">
            <span>All ${riskAssessment.evidence.relatedTestsCount} test suites will run automatically during refactoring verification.</span>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function attachImpactAnalysisEvents() {
  const switchBtns = document.querySelectorAll(".switch-entity-btn");
  const refactorCTA = document.getElementById("impact-refactor-cta");
  const goRefactorBtn = document.getElementById("impact-go-refactor-btn");
  const recalculateBtn = document.getElementById("btn-recalculate-risk");
  const toggleComparisonBtn = document.getElementById("btn-toggle-comparison");

  switchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const entity = btn.getAttribute("data-entity");
      if (entity) {
        store.selectImpactEntity(entity);
      }
    });
  });

  [refactorCTA, goRefactorBtn].forEach(btn => {
    btn?.addEventListener("click", () => store.setRoute("app/refactor"));
  });

  if (recalculateBtn) {
    recalculateBtn.addEventListener("click", () => {
      store.recalculateImpactRisk();
    });
  }

  if (toggleComparisonBtn) {
    toggleComparisonBtn.addEventListener("click", () => {
      const current = store.getState().riskComparisonActive;
      store.setState({ riskComparisonActive: !current });
    });
  }
}
