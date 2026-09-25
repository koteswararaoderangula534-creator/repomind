/**
 * RepoMind Deep Forensic Repository & Database Analysis Studio.
 * 
 * Provides verifiable, deterministic static code & database diagnostics:
 * - Configured vs Actually Used Database detection
 * - Data entities, inferred schemas, and storage models
 * - Discrete AST database operations (Writes & Reads)
 * - End-to-end runtime data flow tracing (Frontend -> API -> Service -> DB -> UI)
 * - Integrity & concurrency findings with step-by-step ConcurrencyTimelines
 * - Root-cause hierarchy (Symptom -> Direct -> Underlying -> Architectural)
 * - Cross-check contradictory evidence audit & unverified external tracker
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderForensicPage(state) {
  const isJunior = state.juniorMode;
  const forensic = state.forensicData || {};
  const activeTab = state.forensicActiveTab || "databases";
  const filter = state.forensicFilter || { severity: "ALL", search: "" };
  const opFilter = state.forensicOpFilter || "ALL";

  const dbs = forensic.databases || [];
  const entities = forensic.entities || [];
  const writes = forensic.write_operations || [];
  const reads = forensic.read_operations || [];
  const flows = forensic.flows || [];
  let findings = forensic.findings || [];
  const rootCauses = forensic.root_causes || [];
  const crossChecks = forensic.cross_checks || [];
  const unverified = forensic.unverified_items || [];

  // Filter findings
  if (filter.severity && filter.severity !== "ALL") {
    findings = findings.filter(f => f.severity === filter.severity);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    findings = findings.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.file && f.file.toLowerCase().includes(q)) ||
      (f.function && f.function.toLowerCase().includes(q))
    );
  }

  // Filter operations
  let allOps = [...writes, ...reads];
  if (opFilter === "WRITES") {
    allOps = writes;
  } else if (opFilter === "READS") {
    allOps = reads;
  }

  const counts = {
    critical: (forensic.findings || []).filter(f => f.severity === "CRITICAL").length,
    high: (forensic.findings || []).filter(f => f.severity === "HIGH").length,
    medium: (forensic.findings || []).filter(f => f.severity === "MEDIUM").length,
    low: (forensic.findings || []).filter(f => f.severity === "LOW").length,
    totalOps: (writes.length + reads.length),
    totalDbs: dbs.length
  };

  return `
    <div class="workspace-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.ForensicAnalysis(20)}
            <span>Database & Runtime Forensic Engine</span>
          </h1>
          <p class="page-subtitle">
            Single-shot AST code-to-database contract verification, query truncation analysis, concurrency blast radius, and root-cause tracing.
          </p>
        </div>

        <div class="page-actions" style="display: flex; gap: var(--space-2); align-items: center;">
          <span class="badge badge-high" style="background: rgba(248, 81, 73, 0.15); color: var(--color-danger); border: 1px solid rgba(248, 81, 73, 0.3);">
            ${counts.critical} CRITICAL
          </span>
          <span class="badge badge-medium" style="background: rgba(210, 153, 34, 0.15); color: var(--color-warning); border: 1px solid rgba(210, 153, 34, 0.3);">
            ${counts.high} HIGH
          </span>
          <span class="badge badge-low" style="background: rgba(88, 166, 255, 0.15); color: var(--brand-accent-text); border: 1px solid rgba(88, 166, 255, 0.3);">
            ${counts.medium} MEDIUM
          </span>
          <button class="btn btn-primary btn-sm" id="btn-re-run-forensic">
            ${Icons.Check(14)}
            <span>Re-run Forensic Probe</span>
          </button>
        </div>
      </div>

      <!-- Junior Mode Callout -->
      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(16)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">Deep Forensic Engine (Junior-Friendly Mental Model)</div>
            <div class="junior-callout-text">
              Think of this as an X-ray for your data:
              <ul>
                <li><strong>Configured vs Actually Used:</strong> Just because a setting has a <code>SUPABASE_URL</code> does not mean the code uses it. If all code calls MongoDB, MongoDB is the real database!</li>
                <li><strong>Query Truncation:</strong> If a function uses <code>find_one()</code> to get attendance history, it only grabs 1 single card from the deck and hides the rest of the past days.</li>
                <li><strong>Race Conditions:</strong> When two people tap "Mark Attendance" at the exact same millisecond, an unprotected array can accidentally save the same student twice.</li>
              </ul>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Secondary Status Metric Bar -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="panel" style="padding: var(--space-3);">
          <div style="font-size: var(--font-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Engine Status</div>
          <div style="font-size: var(--font-lg); font-weight: 700; color: var(--color-success-light); margin-top: 2px;">
            100% Deterministic
          </div>
          <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 4px;">Verified in ${forensic.execution_time_seconds || 1.4}s</div>
        </div>

        <div class="panel" style="padding: var(--space-3);">
          <div style="font-size: var(--font-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Databases Detected</div>
          <div style="font-size: var(--font-lg); font-weight: 700; color: var(--text-primary); margin-top: 2px;">
            ${dbs.length} Platforms
          </div>
          <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 4px;">
            ${dbs.filter(d => d.status === "ACTUALLY USED").map(d => d.name).join(", ") || "None"} active
          </div>
        </div>

        <div class="panel" style="padding: var(--space-3);">
          <div style="font-size: var(--font-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Database Operations</div>
          <div style="font-size: var(--font-lg); font-weight: 700; color: var(--brand-accent-text); margin-top: 2px;">
            ${counts.totalOps} AST Calls
          </div>
          <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 4px;">${writes.length} writes / ${reads.length} reads</div>
        </div>

        <div class="panel" style="padding: var(--space-3);">
          <div style="font-size: var(--font-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Cross-Check Verification</div>
          <div style="font-size: var(--font-lg); font-weight: 700; color: var(--color-warning); margin-top: 2px;">
            ${crossChecks.filter(c => c.verdict === "CONFLICTING EVIDENCE").length} Conflicts
          </div>
          <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 4px;">Surface vs query divergences</div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: var(--space-2); border-bottom: 1px solid var(--border-default); margin-bottom: var(--space-4); overflow-x: auto; padding-bottom: 2px;">
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'databases' ? 'btn-active' : ''}" data-tab="databases" style="${activeTab === 'databases' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          ${Icons.Database(14)}
          <span>Databases & Topology (${dbs.length})</span>
        </button>
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'entities' ? 'btn-active' : ''}" data-tab="entities" style="${activeTab === 'entities' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          <span>Data Entities (${entities.length})</span>
        </button>
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'operations' ? 'btn-active' : ''}" data-tab="operations" style="${activeTab === 'operations' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          <span>AST Operations (${allOps.length})</span>
        </button>
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'dataflow' ? 'btn-active' : ''}" data-tab="dataflow" style="${activeTab === 'dataflow' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          <span>Data Flow Pipeline (${flows.length})</span>
        </button>
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'findings' ? 'btn-active' : ''}" data-tab="findings" style="${activeTab === 'findings' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          <span>Integrity & Races (${findings.length})</span>
        </button>
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'rootcauses' ? 'btn-active' : ''}" data-tab="rootcauses" style="${activeTab === 'rootcauses' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          <span>Root Causes (${rootCauses.length})</span>
        </button>
        <button class="btn btn-ghost btn-sm forensic-tab-btn ${activeTab === 'crosscheck' ? 'btn-active' : ''}" data-tab="crosscheck" style="${activeTab === 'crosscheck' ? 'border-bottom: 2px solid var(--brand-accent-text); color: var(--brand-accent-text);' : ''}">
          <span>Cross-Checks (${crossChecks.length})</span>
        </button>
      </div>

      <!-- Tab Content 1: Databases & Topology -->
      ${activeTab === 'databases' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: var(--font-sm); color: var(--text-muted);">
              Differentiating configured or mentioned databases from actual runtime engine queries.
            </div>
            <div style="display: flex; gap: var(--space-2);">
              <input 
                type="text" 
                id="input-supabase-probe" 
                placeholder="https://xyz.supabase.co" 
                class="form-input" 
                style="width: 260px; font-size: var(--font-xs);"
              />
              <button class="btn btn-secondary btn-sm" id="btn-probe-supabase">
                <span>Test Supabase Link</span>
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-4);">
            ${dbs.map(db => `
              <div class="panel" style="padding: var(--space-4); border-left: 3px solid ${db.status === 'ACTUALLY USED' ? 'var(--color-success-light)' : 'var(--border-default)'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2);">
                  <div>
                    <div style="font-size: var(--font-md); font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: var(--space-2);">
                      ${Icons.Database(16)}
                      <span>${db.name}</span>
                    </div>
                    <div style="font-size: var(--font-xs); color: var(--text-muted);">${db.category}</div>
                  </div>

                  <span class="badge ${db.status === 'ACTUALLY USED' ? 'badge-success' : 'badge-outline'}" style="font-size: 11px;">
                    ${db.status}
                  </span>
                </div>

                <div style="margin-top: var(--space-3); font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.5;">
                  <strong>Evidence:</strong> ${db.evidence}
                </div>

                ${db.driver_packages && db.driver_packages.length ? `
                  <div style="margin-top: var(--space-2); font-size: var(--font-xs);">
                    <span style="color: var(--text-muted);">Driver Packages:</span>
                    <span style="font-family: var(--font-mono); color: var(--text-secondary);">${db.driver_packages.join(", ")}</span>
                  </div>
                ` : ""}

                ${db.connection_uris && db.connection_uris.length ? `
                  <div style="margin-top: var(--space-2); font-size: var(--font-xs);">
                    <span style="color: var(--text-muted);">Connection URI (Redacted):</span>
                    <div style="font-family: var(--font-mono); font-size: 11px; background: var(--bg-canvas); padding: 4px 8px; border-radius: 4px; margin-top: 3px; word-break: break-all; border: 1px solid var(--border-subtle);">
                      ${db.connection_uris[0]}
                    </div>
                  </div>
                ` : ""}

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid var(--border-subtle); font-size: var(--font-xs);">
                  <span style="color: var(--text-muted);">Classification:</span>
                  <span class="badge badge-outline" style="font-family: var(--font-mono); font-size: 10px;">${db.classification}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Tab Content 2: Data Entities & Schema -->
      ${activeTab === 'entities' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${entities.map(ent => `
            <div class="panel" style="padding: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3);">
                <div>
                  <div style="font-size: var(--font-md); font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: var(--space-2);">
                    <span style="color: var(--brand-accent-text);">${Icons.Folder(16)}</span>
                    <span>${ent.name}</span>
                    <span style="font-family: var(--font-mono); font-size: var(--font-xs); color: var(--text-muted);">(${ent.collection_or_table})</span>
                  </div>
                  <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 2px;">
                    Database: <strong>${ent.database}</strong> | Primary Identifier: <code>${ent.primary_key_or_id}</code>
                  </div>
                </div>

                <div style="display: flex; gap: var(--space-2);">
                  <span class="badge badge-outline">Model: ${ent.storage_model}</span>
                </div>
              </div>

              <!-- Storage & Retention Analysis -->
              <div style="background: rgba(210, 153, 34, 0.1); border: 1px solid rgba(210, 153, 34, 0.25); border-radius: 4px; padding: var(--space-3); margin-bottom: var(--space-3);">
                <div style="font-size: var(--font-xs); font-weight: 600; color: var(--color-warning);">Historical Retention Behavior</div>
                <div style="font-size: var(--font-xs); color: var(--text-secondary); margin-top: 2px;">
                  ${ent.historical_retention}
                </div>
              </div>

              <!-- Inferred Schema Table -->
              <div style="margin-top: var(--space-2);">
                <div style="font-size: var(--font-xs); font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: var(--space-2);">
                  Inferred Schema Fields
                </div>
                <table class="table" style="font-size: var(--font-xs);">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Field</th>
                      <th style="width: 25%;">Inferred Type</th>
                      <th>Constraint Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(ent.inferred_schema).map(([field, type]) => `
                      <tr>
                        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--brand-accent-text);">${field}</td>
                        <td style="font-family: var(--font-mono); color: var(--text-secondary);">${type}</td>
                        <td>
                          ${ent.nested_arrays.includes(field) ? `
                            <span class="badge badge-medium" style="font-size: 10px;">Embedded Array (Race Risk)</span>
                          ` : field === ent.primary_key_or_id ? `
                            <span class="badge badge-success" style="font-size: 10px;">Primary Key</span>
                          ` : `
                            <span style="color: var(--text-muted);">Standard Attribute</span>
                          `}
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>

              ${ent.missing_constraints && ent.missing_constraints.length ? `
                <div style="margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid var(--border-subtle); font-size: var(--font-xs); color: var(--color-danger);">
                  <strong>Missing DB Constraints:</strong> ${ent.missing_constraints.join("; ")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Tab Content 3: AST Database Operations -->
      ${activeTab === 'operations' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: var(--space-2);">
              <button class="btn btn-sm ${opFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'} forensic-op-filter-btn" data-opfilter="ALL">
                All (${writes.length + reads.length})
              </button>
              <button class="btn btn-sm ${opFilter === 'WRITES' ? 'btn-primary' : 'btn-ghost'} forensic-op-filter-btn" data-opfilter="WRITES">
                Writes (${writes.length})
              </button>
              <button class="btn btn-sm ${opFilter === 'READS' ? 'btn-primary' : 'btn-ghost'} forensic-op-filter-btn" data-opfilter="READS">
                Reads (${reads.length})
              </button>
            </div>

            <span style="font-size: var(--font-xs); color: var(--text-muted);">
              Deterministic AST Calls extracted with zero execution
            </span>
          </div>

          <div class="panel" style="padding: 0;">
            <table class="table" style="font-size: var(--font-xs);">
              <thead>
                <tr>
                  <th style="width: 90px;">Op Type</th>
                  <th style="width: 150px;">Collection</th>
                  <th style="width: 220px;">Source Location</th>
                  <th>Filter / Arguments Expression</th>
                  <th style="width: 110px;">Classification</th>
                  <th style="width: 70px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${allOps.map(op => `
                  <tr>
                    <td>
                      <span class="badge ${op.operation === 'FIND_ONE' ? 'badge-high' : op.operation === 'PUSH' ? 'badge-medium' : op.operation === 'INSERT' ? 'badge-success' : 'badge-outline'}" style="font-size: 10px; font-family: var(--font-mono);">
                        ${op.operation}
                      </span>
                    </td>
                    <td style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 500;">
                      ${op.collection_or_table}
                    </td>
                    <td>
                      <div style="font-family: var(--font-mono); color: var(--brand-accent-text);">${op.function}()</div>
                      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${op.file}:${op.line}</div>
                    </td>
                    <td>
                      <code style="font-size: 11px; color: var(--text-secondary);">${op.filter_expr || "None"}</code>
                      ${op.fields_modified && op.fields_modified.length ? `
                        <div style="font-size: 10px; color: var(--color-warning); margin-top: 2px;">
                          Modifies: ${op.fields_modified.join(", ")}
                        </div>
                      ` : ""}
                    </td>
                    <td>
                      <span class="badge badge-outline" style="font-size: 9px; font-family: var(--font-mono);">
                        ${op.evidence_classification}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-ghost btn-xs btn-inspect-op" data-file="${op.file}" data-line="${op.line}" data-title="${op.function}" data-snippet="${encodeURIComponent(op.code_snippet)}">
                        View
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      ` : ""}

      <!-- Tab Content 4: Data Flow Pipeline -->
      ${activeTab === 'dataflow' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${flows.map(fl => `
            <div class="panel" style="padding: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                <div>
                  <h3 style="font-size: var(--font-md); font-weight: 600; color: var(--text-primary);">
                    Data Pipeline: ${fl.entity}
                  </h3>
                  <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 2px;">
                    Trigger: <code>${fl.frontend_trigger}</code> → Endpoint: <code>${fl.api_endpoint}</code>
                  </div>
                </div>

                <span class="badge badge-outline" style="font-family: var(--font-mono); font-size: 11px;">
                  Target: ${fl.database_target}
                </span>
              </div>

              <!-- Pipeline Flow Visualizer -->
              <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                ${fl.steps.map((st, idx) => `
                  <div style="display: grid; grid-template-columns: 140px 1fr; gap: var(--space-3); background: var(--bg-canvas); padding: var(--space-3); border-radius: 4px; border-left: 3px solid ${st.layer === 'Frontend' ? 'var(--brand-accent-text)' : st.layer === 'Database' ? 'var(--color-success-light)' : st.layer === 'Read Path' ? 'var(--color-danger)' : 'var(--border-default)'};">
                    <div>
                      <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em;">
                        Step ${idx + 1} · ${st.layer}
                      </div>
                      <div style="font-size: var(--font-xs); font-family: var(--font-mono); color: var(--text-primary); font-weight: 600; margin-top: 2px;">
                        ${st.component}
                      </div>
                    </div>

                    <div>
                      <div style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.4;">
                        ${st.action}
                      </div>
                      <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); margin-top: 4px;">
                        ${st.file}${st.line ? `:${st.line}` : ''}
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Tab Content 5: Integrity & Concurrency Findings -->
      ${activeTab === 'findings' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <!-- Filters Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <div style="display: flex; gap: var(--space-2);">
              <button class="btn btn-sm ${filter.severity === 'ALL' ? 'btn-primary' : 'btn-ghost'} forensic-sev-btn" data-sev="ALL">All</button>
              <button class="btn btn-sm ${filter.severity === 'CRITICAL' ? 'btn-primary' : 'btn-ghost'} forensic-sev-btn" data-sev="CRITICAL">Critical</button>
              <button class="btn btn-sm ${filter.severity === 'HIGH' ? 'btn-primary' : 'btn-ghost'} forensic-sev-btn" data-sev="HIGH">High</button>
              <button class="btn btn-sm ${filter.severity === 'MEDIUM' ? 'btn-primary' : 'btn-ghost'} forensic-sev-btn" data-sev="MEDIUM">Medium</button>
            </div>

            <span style="font-size: var(--font-xs); color: var(--text-muted);">
              Showing ${findings.length} forensic diagnostic findings
            </span>
          </div>

          <!-- Finding Cards -->
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${findings.map(fnd => `
              <div class="panel" style="padding: var(--space-4); border-left: 3px solid ${fnd.severity === 'CRITICAL' ? 'var(--color-danger)' : fnd.severity === 'HIGH' ? 'var(--color-warning)' : 'var(--brand-accent-text)'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2);">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span class="badge ${fnd.severity === 'CRITICAL' ? 'badge-high' : fnd.severity === 'HIGH' ? 'badge-medium' : 'badge-low'}" style="font-size: 10px;">
                      ${fnd.severity}
                    </span>
                    <span style="font-size: var(--font-sm); font-weight: 600; color: var(--text-primary);">
                      ${fnd.title}
                    </span>
                    <span class="badge badge-outline" style="font-size: 10px; font-family: var(--font-mono);">
                      ${fnd.category}
                    </span>
                  </div>

                  <span class="badge badge-outline" style="font-size: 10px; font-family: var(--font-mono);">
                    ${fnd.classification}
                  </span>
                </div>

                <div style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-2);">
                  <strong style="color: var(--text-primary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">EVIDENCE:</strong> ${fnd.evidence}
                </div>

                <div style="font-size: var(--font-xs); color: var(--text-muted); margin-bottom: var(--space-3);">
                  <strong style="color: var(--text-primary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">IMPACT:</strong> ${fnd.impact}
                </div>

                <!-- Concurrency Execution Timeline Diagram (if present) -->
                ${fnd.concurrency_timeline ? `
                  <div style="background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: 4px; padding: var(--space-3); margin-bottom: var(--space-3);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--color-warning); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-2);">
                      ${Icons.AlertTriangle(13)} WHY? (Concurrency Timeline & Collision Path)
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px; font-size: var(--font-xs); font-family: var(--font-mono);">
                      <div style="color: var(--text-muted);">Trigger: ${fnd.concurrency_timeline.trigger}</div>
                      <div style="color: var(--brand-accent-text);">• Step 1: ${fnd.concurrency_timeline.step1}</div>
                      <div style="color: var(--brand-accent-text);">• Step 2: ${fnd.concurrency_timeline.step2}</div>
                      <div style="color: var(--color-danger); font-weight: 600;">➔ Outcome: ${fnd.concurrency_timeline.outcome}</div>
                    </div>
                  </div>
                ` : ""}

                ${fnd.code_snippet ? `
                  <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px;">WHERE? (AST Code Snippet)</div>
                    <pre style="font-family: var(--font-mono); font-size: 11px; background: var(--bg-canvas); padding: var(--space-3); border-radius: 4px; border: 1px solid var(--border-subtle); overflow-x: auto; color: var(--text-secondary); margin: 0;"><code>${fnd.code_snippet}</code></pre>
                  </div>
                ` : ""}

                ${fnd.suggested_fix ? `
                  <div style="background: rgba(35, 134, 54, 0.1); border: 1px solid rgba(35, 134, 54, 0.3); border-radius: 4px; padding: var(--space-2) var(--space-3); font-size: var(--font-xs); color: var(--color-success-light); margin-bottom: var(--space-2);">
                    <strong style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">WHAT SHOULD I DO? (Minimum Safe Fix):</strong> ${fnd.suggested_fix}
                  </div>
                ` : ""}

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-2); font-size: 11px; color: var(--text-muted); padding-top: 8px; border-top: 1px solid var(--border-subtle);">
                  <span>Location: <code>${fnd.file}:${fnd.line}</code> in <code>${fnd.function}()</code></span>
                  <button class="btn btn-secondary btn-xs btn-inspect-fnd" data-file="${fnd.file}" data-line="${fnd.line}" data-title="${fnd.title}" data-snippet="${encodeURIComponent(fnd.code_snippet || '')}">
                    Inspect Source Context
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Tab Content 6: Root Cause Hierarchy -->
      ${activeTab === 'rootcauses' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="font-size: var(--font-sm); color: var(--text-muted);">
            Separating outward symptoms from direct code triggers, underlying assumptions, and architectural root origins.
          </div>

          ${rootCauses.map(rc => `
            <div class="panel" style="padding: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                <h3 style="font-size: var(--font-md); font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: var(--space-2);">
                  <span class="badge badge-high" style="font-size: 10px;">${rc.id}</span>
                  <span>${rc.title}</span>
                </h3>
                <span class="badge badge-outline" style="font-family: var(--font-mono); font-size: 10px;">${rc.evidence_tag}</span>
              </div>

              <!-- 4-Stage Root Cause Ladder -->
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                <div style="background: var(--bg-canvas); padding: var(--space-3); border-radius: 4px; border-left: 3px solid var(--color-warning);">
                  <div style="font-size: 10px; font-weight: 700; color: var(--color-warning); text-transform: uppercase;">1. Observed Symptom</div>
                  <div style="font-size: var(--font-xs); color: var(--text-primary); margin-top: 2px;">${rc.symptom}</div>
                </div>

                <div style="background: var(--bg-canvas); padding: var(--space-3); border-radius: 4px; border-left: 3px solid var(--brand-accent-text);">
                  <div style="font-size: 10px; font-weight: 700; color: var(--brand-accent-text); text-transform: uppercase;">2. Direct Code Trigger</div>
                  <div style="font-size: var(--font-xs); color: var(--text-primary); margin-top: 2px;">${rc.direct_cause}</div>
                </div>

                <div style="background: var(--bg-canvas); padding: var(--space-3); border-radius: 4px; border-left: 3px solid var(--border-default);">
                  <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">3. Underlying Assumption</div>
                  <div style="font-size: var(--font-xs); color: var(--text-primary); margin-top: 2px;">${rc.underlying_cause}</div>
                </div>

                <div style="background: var(--bg-canvas); padding: var(--space-3); border-radius: 4px; border-left: 3px solid var(--color-danger);">
                  <div style="font-size: 10px; font-weight: 700; color: var(--color-danger); text-transform: uppercase;">4. Architectural Root Cause</div>
                  <div style="font-size: var(--font-xs); color: var(--text-primary); margin-top: 2px;">${rc.architectural_cause}</div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <!-- Tab Content 7: Cross-Checks & Unverified External Tracker -->
      ${activeTab === 'crosscheck' ? `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <!-- Cross-Check Matrix -->
          <div class="panel" style="padding: var(--space-4);">
            <h3 style="font-size: var(--font-md); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-3);">
              Cross-Tier Evidence Verification Matrix
            </h3>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${crossChecks.map(cc => `
                <div style="background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: 4px; padding: var(--space-3);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <div style="font-size: var(--font-xs); font-weight: 600; color: var(--text-primary);">
                      ${cc.topic}
                    </div>
                    <span class="badge ${cc.verdict === 'CONFLICTING EVIDENCE' ? 'badge-high' : cc.verdict === 'DISCONNECTED' ? 'badge-medium' : 'badge-success'}" style="font-size: 10px;">
                      ${cc.verdict}
                    </span>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-2); font-size: var(--font-xs);">
                    <div style="background: var(--bg-surface); padding: var(--space-2); border-radius: 3px;">
                      <span style="color: var(--text-muted);">Aspect A:</span> <strong style="color: var(--text-secondary);">${cc.aspect_a}</strong>
                    </div>
                    <div style="background: var(--bg-surface); padding: var(--space-2); border-radius: 3px;">
                      <span style="color: var(--text-muted);">Aspect B:</span> <strong style="color: var(--text-secondary);">${cc.aspect_b}</strong>
                    </div>
                  </div>

                  <div style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.4;">
                    ${cc.details}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Unverified External Resources -->
          <div class="panel" style="padding: var(--space-4); border-left: 3px solid var(--color-warning);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <h3 style="font-size: var(--font-md); font-weight: 600; color: var(--text-primary);">
                Explicitly Unverified External Resources
              </h3>
              <span class="badge badge-outline" style="font-family: var(--font-mono); font-size: 10px;">[UNVERIFIED]</span>
            </div>

            <div style="font-size: var(--font-xs); color: var(--text-muted); margin-bottom: var(--space-3);">
              RepoMind never hallucinates database tables or policies that cannot be verified statically.
            </div>

            ${unverified.length ? unverified.map(uv => `
              <div style="background: var(--bg-canvas); border: 1px solid var(--border-default); border-radius: 4px; padding: var(--space-3); margin-bottom: var(--space-2);">
                <div style="font-size: var(--font-xs); font-weight: 600; color: var(--color-warning);">${uv.target}</div>
                <div style="font-size: var(--font-xs); color: var(--text-secondary); margin-top: 3px;"><strong>Reason:</strong> ${uv.reason}</div>
                <div style="font-size: var(--font-xs); color: var(--text-muted); margin-top: 3px;"><strong>Recommendation:</strong> ${uv.recommendation}</div>
              </div>
            `).join("") : `
              <div style="font-size: var(--font-xs); color: var(--text-muted);">All identified targets were successfully verified.</div>
            `}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

export function attachForensicEvents() {
  // Tab switching
  document.querySelectorAll(".forensic-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      if (tab) {
        store.setForensicTab(tab);
      }
    });
  });

  // Severity filter buttons
  document.querySelectorAll(".forensic-sev-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sev = btn.getAttribute("data-sev");
      if (sev) {
        store.setForensicFilter({ severity: sev });
      }
    });
  });

  // Operations filter buttons
  document.querySelectorAll(".forensic-op-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const opFilter = btn.getAttribute("data-opfilter");
      if (opFilter) {
        store.setForensicOpFilter(opFilter);
      }
    });
  });

  // Re-run forensic probe
  const btnReRun = document.getElementById("btn-re-run-forensic");
  if (btnReRun) {
    btnReRun.addEventListener("click", () => {
      store.runForensicAnalysis();
    });
  }

  // Supabase probe test button
  const btnProbe = document.getElementById("btn-probe-supabase");
  const inputProbe = document.getElementById("input-supabase-probe");
  if (btnProbe && inputProbe) {
    btnProbe.addEventListener("click", () => {
      const url = inputProbe.value.trim();
      if (!url) {
        store.showToast("Please enter a Supabase project URL", "info");
        return;
      }
      store.runForensicAnalysis(url);
    });
  }

  // Code inspection buttons for operations
  document.querySelectorAll(".btn-inspect-op").forEach(btn => {
    btn.addEventListener("click", () => {
      const file = btn.getAttribute("data-file") || "";
      const line = btn.getAttribute("data-line") || "";
      const title = btn.getAttribute("data-title") || "";
      const snippet = decodeURIComponent(btn.getAttribute("data-snippet") || "");
      store.openCodeInspector(title, file, line, snippet);
    });
  });

  // Code inspection buttons for findings
  document.querySelectorAll(".btn-inspect-fnd").forEach(btn => {
    btn.addEventListener("click", () => {
      const file = btn.getAttribute("data-file") || "";
      const line = btn.getAttribute("data-line") || "";
      const title = btn.getAttribute("data-title") || "";
      const snippet = decodeURIComponent(btn.getAttribute("data-snippet") || "");
      store.openCodeInspector(title, file, line, snippet);
    });
  });
}
