/**
 * Page 4 — Architecture Visualization
 * Clean, structured system topology answering: "What talks to what?"
 * Prioritizes clarity and readability over decorative chaos.
 */

import { Icons } from "../components/Icons.js";
import { store } from "../state/store.js";

export function renderArchitecturePage(state) {
  const isJunior = state.juniorMode;
  const arch = state.archData;
  const selectedNodeId = state.selectedArchNodeId;

  // Find all nodes flattened
  const allNodes = arch.layers.flatMap(layer => layer.nodes);
  const selectedNode = allNodes.find(n => n.id === selectedNodeId) || allNodes[2]; // default to auth or api

  // Compute inbound and outbound edges for selected node
  const inboundEdges = arch.edges.filter(e => e.to === selectedNode.id);
  const outboundEdges = arch.edges.filter(e => e.from === selectedNode.id);

  return `
    <div class="workspace-content">
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">
            ${Icons.Architecture(18)}
            <span>Architecture & Dependencies</span>
          </h1>
          <p class="page-subtitle">
            Understand architectural boundaries, communication protocols, and service interdependencies.
          </p>
        </div>

        <div class="page-actions">
          <span class="badge badge-outline">4 Architectural Tiers</span>
          <span class="badge badge-outline">12 Active Edges</span>
        </div>
      </div>

      ${isJunior ? `
        <div class="junior-callout">
          <div class="junior-callout-icon">${Icons.Info(15)}</div>
          <div class="junior-callout-content">
            <div class="junior-callout-title">System Architecture (Junior Mode)</div>
            <div class="junior-callout-text">
              Think of this page like a company org-chart for the code. Requests start at the top (the Web UI or Admin CLI), travel into the API Gateway, get processed by specialized Services, and finally store their data in PostgreSQL or call external tools like Stripe. Click any box to see who it talks to.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Two-Column Architecture Layout: Left = Graph Layers, Right = Node Inspector ("What talks to what?") -->
      <div style="display: grid; grid-template-columns: 2fr 1.1fr; gap: var(--space-4);">
        
        <!-- Left Column: Layered System Layout -->
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${arch.layers.map(layer => `
            <div class="panel">
              <div class="panel-header" style="padding: 6px 12px;">
                <div class="panel-title" style="font-size: 11px;">
                  <span>${layer.name}</span>
                </div>
                <span class="badge badge-outline" style="font-size: 10px;">${layer.nodes.length} Components</span>
              </div>

              <div class="panel-body" style="padding: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
                ${layer.nodes.map(node => {
                  const isSelected = node.id === selectedNode.id;
                  const isConnected = inboundEdges.some(e => e.from === node.id) || outboundEdges.some(e => e.to === node.id);

                  return `
                    <div 
                      class="arch-node-card" 
                      data-node-id="${node.id}"
                      style="
                        padding: 10px;
                        background-color: ${isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'};
                        border: 1px solid ${isSelected ? 'var(--brand-accent)' : isConnected ? 'var(--border-strong)' : 'var(--border-subtle)'};
                        border-radius: var(--radius-sm);
                        cursor: pointer;
                        transition: all 0.15s ease;
                      "
                    >
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                        <span style="font-weight: 600; font-size: 12px; color: var(--text-primary);">${node.name}</span>
                        ${node.port ? `<span class="badge badge-outline" style="font-size: 9px; padding: 0 4px;">${node.port}</span>` : ""}
                      </div>

                      <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 6px;">
                        ${node.tech}
                      </div>

                      <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.3;">
                        ${node.description}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Right Column: Node Inspector ("What talks to what?") -->
        <div class="panel" style="position: sticky; top: var(--space-4); height: fit-content;">
          <div class="panel-header">
            <div class="panel-title">
              ${Icons.ImpactAnalysis(13)}
              <span>What Talks to What?</span>
            </div>
            <span class="badge badge-info">${selectedNode.name}</span>
          </div>

          <div class="panel-body">
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                ${selectedNode.name}
              </div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 6px;">
                ${selectedNode.tech} ${selectedNode.files ? `• ${selectedNode.files}` : ''}
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                ${selectedNode.description}
              </p>
            </div>

            <!-- Inbound Calls (Who talks to this) -->
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">
                Inbound Ingress (${inboundEdges.length})
              </div>
              ${inboundEdges.length === 0 ? `
                <div style="font-size: 11px; color: var(--text-muted); font-style: italic;">No upstream inbound calls (Entry Point).</div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${inboundEdges.map(edge => {
                    const fromNode = allNodes.find(n => n.id === edge.from);
                    return `
                      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 11px;">
                        <div>
                          <span style="font-weight: 600; color: var(--text-primary);">${fromNode ? fromNode.name : edge.from}</span>
                          <span style="color: var(--text-muted); font-family: var(--font-mono); margin-left: 6px;">${edge.label}</span>
                        </div>
                        <span class="badge badge-outline" style="font-size: 10px;">${edge.protocol}</span>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}
            </div>

            <!-- Outbound Dependencies (What this talks to) -->
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">
                Outbound Calls (${outboundEdges.length})
              </div>
              ${outboundEdges.length === 0 ? `
                <div style="font-size: 11px; color: var(--text-muted); font-style: italic;">No outbound dependencies (Leaf Node).</div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${outboundEdges.map(edge => {
                    const toNode = allNodes.find(n => n.id === edge.to);
                    return `
                      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 11px;">
                        <div>
                          <span style="font-weight: 600; color: var(--text-primary);">${toNode ? toNode.name : edge.to}</span>
                          <span style="color: var(--text-muted); font-family: var(--font-mono); margin-left: 6px;">${edge.label}</span>
                        </div>
                        <span class="badge badge-outline" style="font-size: 10px;">${edge.protocol}</span>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}
            </div>

            <!-- Action buttons -->
            <div style="padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 6px;">
              <button class="btn btn-secondary btn-sm" id="arch-inspect-code-btn" style="width: 100%;">
                ${Icons.FileCode(13)}
                <span>Inspect Associated Code</span>
              </button>
              <button class="btn btn-primary btn-sm" id="arch-trace-impact-btn" style="width: 100%;">
                ${Icons.ImpactAnalysis(13)}
                <span>Trace Impact Radius</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;
}

export function attachArchitectureEvents() {
  const cards = document.querySelectorAll(".arch-node-card");
  const inspectCodeBtn = document.getElementById("arch-inspect-code-btn");
  const traceImpactBtn = document.getElementById("arch-trace-impact-btn");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const nodeId = card.getAttribute("data-node-id");
      if (nodeId) {
        store.setState({ selectedArchNodeId: nodeId });
      }
    });
  });

  if (inspectCodeBtn) {
    inspectCodeBtn.addEventListener("click", () => {
      const state = store.getState();
      const allNodes = state.archData.layers.flatMap(l => l.nodes);
      const selected = allNodes.find(n => n.id === state.selectedArchNodeId);
      const file = selected?.files || "auth_service.py";
      store.openCodeInspector(selected?.name || file, file, "1-50", `# Module: ${file}\n# Architecture component: ${selected?.name}\nimport sys\nimport os\n\n# Verified entrypoint bindings`);
    });
  }

  if (traceImpactBtn) {
    traceImpactBtn.addEventListener("click", () => store.setRoute("app/impact"));
  }
}
