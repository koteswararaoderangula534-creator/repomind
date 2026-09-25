/**
 * Frontend Unit Test Suite for RepoMind Risk Engine
 * Validates the 10 mandated scenarios from Section 25:
 * 1. Small isolated change -> LOW
 * 2. Moderate multi-file change -> MODERATE
 * 3. Multi-layer change with many callers -> HIGH (62/100 benchmark)
 * 4. Large security-sensitive change with weak tests -> CRITICAL
 * 5. Boundary values (24, 25, 49, 50, 74, 75)
 * 6. No tests detected -> high test risk
 * 7. No dependency information available
 * 8. Security-sensitive change
 * 9. Large repository with small relative change
 * 10. Small repository with large relative change
 */

import {
  getRiskLevel,
  getRiskBadgeClass,
  getRiskColor,
  calculateFileImpact,
  calculateArchitectureImpact,
  calculateDependencyImpact,
  calculateTestRisk,
  calculateSensitivityRisk,
  calculateComplexityRisk,
  calculateComprehensiveRisk,
  calculateRefactorRiskComparison
} from "../src/services/riskEngine.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log("=== REPOMIND RISK ENGINE TEST SUITE ===");

// 1. Small isolated change -> LOW
console.log("Testing Scenario 1: Small isolated change...");
const s1 = calculateComprehensiveRisk({
  affectedFilesCount: 1,
  totalRepoFiles: 100,
  layersCount: 1,
  isCrossLayer: false,
  callerCount: 1,
  isSharedService: false,
  relatedTestsCount: 6,
  isSecuritySensitive: false,
  isDatabaseWrite: false,
  isPublicApi: false,
  changedFunctionsCount: 1
});
assert(s1.level === "LOW", `Scenario 1 level should be LOW, got ${s1.level}`);
assert(s1.score < 25, `Scenario 1 score should be < 25, got ${s1.score}`);

// 2. Moderate multi-file change -> MODERATE
console.log("Testing Scenario 2: Moderate multi-file change...");
const s2 = calculateComprehensiveRisk({
  affectedFilesCount: 3,
  totalRepoFiles: 100,
  layersCount: 2,
  isCrossLayer: true,
  callerCount: 4,
  isSharedService: false,
  relatedTestsCount: 4,
  isSecuritySensitive: false,
  isDatabaseWrite: false,
  isPublicApi: false,
  changedFunctionsCount: 2
});
assert(s2.level === "MODERATE", `Scenario 2 level should be MODERATE, got ${s2.level}`);
assert(s2.score >= 25 && s2.score < 50, `Scenario 2 score should be 25-49, got ${s2.score}`);

// 3. Multi-layer change with many callers -> HIGH (62/100 benchmark)
console.log("Testing Scenario 3: Multi-layer change with many callers (62/100 benchmark)...");
const s3 = calculateComprehensiveRisk({
  affectedFilesCount: 6,
  totalRepoFiles: 150,
  layersCount: 3,
  isCrossLayer: true,
  callerCount: 9,
  isSharedService: false,
  relatedTestsCount: 4,
  isSecuritySensitive: true,
  isDatabaseWrite: true,
  isPublicApi: true,
  changedFunctionsCount: 1
});
assert(s3.level === "HIGH", `Scenario 3 level should be HIGH, got ${s3.level}`);
assert(s3.score >= 50 && s3.score < 75, `Scenario 3 score should be 50-74, got ${s3.score}`);
assert(s3.score >= 60 && s3.score <= 68, `Scenario 3 score should align with ~62 benchmark, got ${s3.score}`);
assert(s3.displayLabel.includes("High"), `Display label should say (High), got ${s3.displayLabel}`);

// 4. Large security-sensitive change with weak tests -> CRITICAL
console.log("Testing Scenario 4: Large security-sensitive change with weak tests...");
const s4 = calculateComprehensiveRisk({
  affectedFilesCount: 14,
  totalRepoFiles: 80,
  layersCount: 4,
  isCrossLayer: true,
  callerCount: 16,
  isSharedService: true,
  relatedTestsCount: 0,
  isSecuritySensitive: true,
  isDatabaseWrite: true,
  isPublicApi: true,
  changedFunctionsCount: 6
});
assert(s4.level === "CRITICAL", `Scenario 4 level should be CRITICAL, got ${s4.level}`);
assert(s4.score >= 75, `Scenario 4 score should be >= 75, got ${s4.score}`);

// 5. Boundary values (24, 25, 49, 50, 74, 75)
console.log("Testing Scenario 5: Boundary classification values...");
assert(getRiskLevel(0) === "LOW", "0 should be LOW");
assert(getRiskLevel(24) === "LOW", "24 should be LOW");
assert(getRiskLevel(24.4) === "LOW", "24.4 should be LOW");
assert(getRiskLevel(25) === "MODERATE", "25 should be MODERATE");
assert(getRiskLevel(49) === "MODERATE", "49 should be MODERATE");
assert(getRiskLevel(49.4) === "MODERATE", "49.4 should be MODERATE");
assert(getRiskLevel(50) === "HIGH", "50 should be HIGH");
assert(getRiskLevel(74) === "HIGH", "74 should be HIGH");
assert(getRiskLevel(74.4) === "HIGH", "74.4 should be HIGH");
assert(getRiskLevel(75) === "CRITICAL", "75 should be CRITICAL");
assert(getRiskLevel(100) === "CRITICAL", "100 should be CRITICAL");

// Badge & color consistency
assert(getRiskBadgeClass("HIGH") === "badge-risk-high", "High badge should match");
assert(getRiskBadgeClass(62) === "badge-risk-high", "62 score should give badge-risk-high");
assert(getRiskBadgeClass(25) === "badge-risk-moderate", "25 score should give badge-risk-moderate");
assert(getRiskBadgeClass(15) === "badge-risk-low", "15 score should give badge-risk-low");
assert(getRiskBadgeClass(80) === "badge-risk-critical", "80 score should give badge-risk-critical");

// 6. No tests detected -> high test risk
console.log("Testing Scenario 6: No tests detected...");
const tRiskZero = calculateTestRisk(0, 5);
assert(tRiskZero >= 90, `No tests should give high test risk, got ${tRiskZero}`);

// 7. No dependency information available
console.log("Testing Scenario 7: No dependency information available...");
const depZero = calculateDependencyImpact(0, false);
assert(depZero <= 10, `0 callers should produce low caller subscore, got ${depZero}`);

// 8. Security-sensitive change
console.log("Testing Scenario 8: Security-sensitive change...");
const sensLow = calculateSensitivityRisk({ isSecuritySensitive: false, isDatabaseWrite: false, isPublicApi: false });
const sensHigh = calculateSensitivityRisk({ isSecuritySensitive: true, isDatabaseWrite: true, isPublicApi: true });
assert(sensHigh > sensLow, "Security sensitivity should increase subscore");
assert(sensHigh >= 90, `Full security scope should produce high sensitivity subscore, got ${sensHigh}`);

// 9. Large repository with small relative change
console.log("Testing Scenario 9: Large repo with small relative change...");
const fileSmallRepo = calculateFileImpact(2, 10);
const fileLargeRepo = calculateFileImpact(2, 5000);
assert(fileLargeRepo <= fileSmallRepo, "Large repo should dampen relative file impact");

// 10. Small repository with large relative change
console.log("Testing Scenario 10: Small repo with large relative change...");
const fileNormal = calculateFileImpact(6, 200);
const fileBigRatio = calculateFileImpact(6, 10);
assert(fileBigRatio > fileNormal, "Small repo with large ratio should amplify impact");
assert(fileBigRatio >= 80, `Small repo 60% impact should be >= 80, got ${fileBigRatio}`);

// Bonus: Before vs After proposed refactor comparison
console.log("Testing Refactor Risk Reduction Comparison (Before vs After)...");
const comp = calculateRefactorRiskComparison({
  affectedFilesCount: 6,
  totalRepoFiles: 150,
  layersCount: 3,
  callerCount: 9,
  relatedTestsCount: 4,
  isSecuritySensitive: true,
  isDatabaseWrite: true,
  isPublicApi: true
});
assert(comp.before.score >= 60 && comp.before.level === "HIGH", "Current before should be HIGH");
assert(comp.after.score < comp.before.score, "Proposed refactor should reduce risk");
assert(comp.isSafer === true, "isSafer flag should be true");
assert(comp.reductionPercent > 0, "Reduction percent should be positive");

console.log("\n✅ ALL 10 FRONTEND RISK ENGINE SCENARIOS & COMPARISON CHECKS PASSED!");
