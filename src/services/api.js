/**
 * RepoMind Frontend API Client
 * Connects the UI to the FastAPI backend (http://localhost:8000/api)
 * with transparent fallback to offline mock data when the backend is unreachable.
 */

import {
  REPOSITORY_DATA,
  CODE_HEALTH_FINDINGS,
  ARCHITECTURE_GRAPH_DATA,
  IMPACT_ANALYSIS_DATA,
  REFACTOR_DATA,
  DIFF_VIEWER_DATA,
  VERIFICATION_DATA,
  ASK_AI_SAMPLE_QUERIES,
  FORENSIC_REPORT_DATA
} from "../data/mockData.js";

const isHttps = typeof window !== "undefined" && window.location && window.location.protocol === "https:";
const isLocalhost = typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// On local dev: connects to FastAPI backend (http://localhost:8000/api).
// On production HTTPS (e.g. Vercel): uses relative /api or custom window.REPOMIND_API_URL,
// avoiding mixed-content block while gracefully falling back to offline verified mock data.
const BACKEND_BASE_URL = (typeof window !== "undefined" && window.REPOMIND_API_URL)
  ? window.REPOMIND_API_URL
  : (isHttps && !isLocalhost)
    ? "/api"
    : "http://localhost:8000/api";

class ApiService {
  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
    this.isBackendOnline = false;
    this.checkHealth();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: "GET", signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const body = await res.json();
        this.isBackendOnline = body.success === true;
        return this.isBackendOnline;
      }
    } catch {
      this.isBackendOnline = false;
    }
    return false;
  }

  async analyzeRepository(url, branch = "main") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, branch })
      });
      const data = await res.json();
      if (data.success && data.data) {
        this.isBackendOnline = true;
        return data.data;
      }
    } catch (err) {
      console.warn("Backend unavailable, using fallback mock:", err);
    }
    return REPOSITORY_DATA;
  }

  async fetchOverview(repoId = "repo-student-mgmt") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/overview`);
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return REPOSITORY_DATA;
  }

  async fetchArchitecture(repoId = "repo-student-mgmt") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/architecture`);
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return ARCHITECTURE_GRAPH_DATA;
  }

  async fetchFindings(repoId = "repo-student-mgmt", severity = "ALL") {
    try {
      const url = new URL(`${this.baseUrl}/repositories/${repoId}/findings`);
      if (severity && severity !== "ALL") url.searchParams.set("severity", severity);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return CODE_HEALTH_FINDINGS;
  }

  async analyzeImpact(repoId = "repo-student-mgmt", entity = "authenticate_user()", file = "auth_service.py") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, file })
      });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return IMPACT_ANALYSIS_DATA;
  }

  async askQuery(repoId = "repo-student-mgmt", query = "How does authentication work?") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return ASK_AI_SAMPLE_QUERIES[0];
  }

  async generateRefactor(repoId = "repo-student-mgmt", targetFunction = "process_order()", file = "orders.py") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/refactor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_function: targetFunction, file })
      });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return REFACTOR_DATA;
  }

  async fetchDiff(repoId = "repo-student-mgmt", refactorId = "REF-ORDER-01") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/diff/${refactorId}`);
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return DIFF_VIEWER_DATA;
  }

  async verifyRefactor(repoId = "repo-student-mgmt", refactorId = "REF-ORDER-01") {
    try {
      const res = await fetch(`${this.baseUrl}/repositories/${repoId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refactor_id: refactorId })
      });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch {
      // Fallback
    }
    return VERIFICATION_DATA;
  }

  async fetchForensicReport(repoId = "repo-student-mgmt", supabaseUrl = null) {
    try {
      let res;
      if (supabaseUrl) {
        res = await fetch(`${this.baseUrl}/repositories/${repoId}/forensic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supabase_url: supabaseUrl })
        });
      } else {
        res = await fetch(`${this.baseUrl}/repositories/${repoId}/forensic`);
      }
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch (err) {
      console.warn("Backend unavailable, using fallback forensic mock:", err);
    }
    return FORENSIC_REPORT_DATA;
  }
}

export const apiService = new ApiService();
