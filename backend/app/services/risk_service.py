"""Static & Evidence-Based Risk Engine for RepoMind.

Implements normalized 0-100 risk scoring across 6 measurable engineering dimensions:
A. File Impact — 20%
B. Architectural Layer Impact — 20%
C. Caller / Dependency Impact — 20%
D. Test Coverage / Verification Risk — 20%
E. Security / Data / API Sensitivity — 10%
F. Change Complexity — 10%

Classification System:
  0–24:   LOW
  25–49:  MODERATE
  50–74:  HIGH
  75–100: CRITICAL
"""

from typing import Any, Optional


def get_risk_level(score: float) -> str:
    """Classifies a normalized 0-100 score into standardized risk levels."""
    s = round(score)
    if s < 25:
        return "LOW"
    if s < 50:
        return "MODERATE"
    if s < 75:
        return "HIGH"
    return "CRITICAL"


def calculate_file_impact(affected_files_count: int, total_repo_files: int = 0) -> float:
    """Calculates File Impact subscore (0-100) with repo size proportionality."""
    count = max(0, affected_files_count)
    if count == 0:
        return 0.0

    if count == 1:
        score = 18.0
    elif count == 2:
        score = 28.0
    elif count <= 5:
        score = 35.0 + (count - 3) * 8.0
    elif count <= 10:
        score = 60.0 + (count - 6) * 4.0  # 6 files -> 68.0
    else:
        score = min(100.0, 80.0 + (count - 10) * 2.0)

    if total_repo_files > 0:
        ratio = count / total_repo_files
        if ratio >= 0.5:
            score = min(100.0, score + 20.0)
        elif ratio >= 0.2:
            score = min(100.0, score + 10.0)
        elif total_repo_files > 2000 and ratio < 0.005:
            score = max(15.0, score - 8.0)

    return min(100.0, max(0.0, score))


def calculate_architecture_impact(layers_count: int = 1, is_cross_layer: bool = False) -> float:
    """Calculates Architectural Layer Impact subscore (0-100)."""
    layers = max(1, layers_count)
    if layers == 1:
        score = 30.0 if is_cross_layer else 18.0
    elif layers == 2:
        score = 48.0 if is_cross_layer else 42.0
    elif layers == 3:
        score = 72.0 if is_cross_layer else 68.0
    else:
        score = min(100.0, 85.0 + (layers - 4) * 5.0)

    return min(100.0, max(0.0, score))


def calculate_dependency_impact(caller_count: int = 0, is_shared_service: bool = False) -> float:
    """Calculates Caller / Dependency Impact subscore (0-100)."""
    callers = max(0, caller_count)
    if callers == 0:
        score = 5.0
    elif callers <= 2:
        score = 20.0
    elif callers <= 5:
        score = 38.0 + (callers - 3) * 6.0
    elif callers <= 10:
        score = 58.0 + (callers - 6) * 3.5  # 9 callers -> ~68.5
    else:
        score = min(100.0, 80.0 + (callers - 10) * 2.0)

    if is_shared_service:
        score = min(100.0, score + 8.0)

    return min(100.0, max(0.0, score))


def calculate_test_risk(related_tests_count: int = 0, affected_files_count: int = 1) -> float:
    """Calculates Test Risk subscore (0-100). Higher score = Higher risk due to weak test coverage."""
    tests = max(0, related_tests_count)
    files = max(1, affected_files_count)

    if tests == 0:
        return 95.0

    ratio = tests / files
    if tests <= 2:
        return 65.0 if ratio >= 1.0 else 80.0

    if tests <= 5:
        if ratio >= 2.0:
            return 30.0
        if ratio >= 1.0:
            return 42.0
        return 55.0  # 4 tests for 6 files -> 55.0

    if tests <= 10:
        return 18.0 if ratio >= 1.5 else 28.0

    return 12.0


def calculate_sensitivity_risk(
    is_security_sensitive: bool = False,
    is_database_write: bool = False,
    is_public_api: bool = False,
) -> float:
    """Calculates Security / Data / API Sensitivity subscore (0-100)."""
    score = 15.0
    if is_public_api:
        score += 20.0
    if is_database_write:
        score += 20.0
    if is_security_sensitive:
        score += 40.0
    return min(100.0, score)


def calculate_complexity_risk(
    changed_functions_count: int = 1,
    cyclomatic_complexity: Optional[int] = None,
    has_sufficient_evidence: bool = True,
) -> dict[str, Any]:
    """Calculates Change Complexity subscore (0-100)."""
    if not has_sufficient_evidence:
        return {"score": 35.0, "insufficientEvidence": True}

    if cyclomatic_complexity is not None:
        cc = cyclomatic_complexity
        if cc > 15:
            score = 85.0
        elif cc > 8:
            score = 60.0
        elif cc > 4:
            score = 40.0
        else:
            score = 20.0
    else:
        func_count = max(1, changed_functions_count)
        if func_count > 5:
            score = 75.0
        elif func_count > 2:
            score = 50.0
        else:
            score = 32.0

    return {"score": min(100.0, max(0.0, score)), "insufficientEvidence": False}


class RiskService:
    """Evaluates multi-factor risk, contributors, and actionable risk reduction guidance."""

    def evaluate_risk(
        self,
        affected_files_count: int = 1,
        total_repo_files: int = 0,
        layers_count: int = 1,
        is_cross_layer: bool = False,
        caller_count: int = 0,
        is_shared_service: bool = False,
        related_tests_count: int = 0,
        is_security_sensitive: bool = False,
        is_database_write: bool = False,
        is_public_api: bool = False,
        changed_functions_count: int = 1,
        cyclomatic_complexity: Optional[int] = None,
        has_sufficient_evidence: bool = True,
    ) -> dict[str, Any]:
        """Calculates normalized overall risk and returns structured factors and guidance."""
        file_score = calculate_file_impact(affected_files_count, total_repo_files)
        arch_score = calculate_architecture_impact(layers_count, is_cross_layer)
        dep_score = calculate_dependency_impact(caller_count, is_shared_service)
        test_score = calculate_test_risk(related_tests_count, affected_files_count)
        sens_score = calculate_sensitivity_risk(is_security_sensitive, is_database_write, is_public_api)
        comp_res = calculate_complexity_risk(changed_functions_count, cyclomatic_complexity, has_sufficient_evidence)
        comp_score = comp_res["score"]

        raw_score = (
            file_score * 0.20
            + arch_score * 0.20
            + dep_score * 0.20
            + test_score * 0.20
            + sens_score * 0.10
            + comp_score * 0.10
        )
        score = round(raw_score)
        level = get_risk_level(score)

        factors = {
            "fileImpact": {"score": round(file_score), "weight": 0.20, "level": get_risk_level(file_score)},
            "architectureImpact": {"score": round(arch_score), "weight": 0.20, "level": get_risk_level(arch_score)},
            "dependencyImpact": {"score": round(dep_score), "weight": 0.20, "level": get_risk_level(dep_score)},
            "testRisk": {"score": round(test_score), "weight": 0.20, "level": get_risk_level(test_score)},
            "sensitivityRisk": {"score": round(sens_score), "weight": 0.10, "level": get_risk_level(sens_score)},
            "complexityRisk": {
                "score": round(comp_score),
                "weight": 0.10,
                "level": get_risk_level(comp_score),
                "insufficientEvidence": comp_res.get("insufficientEvidence", False),
            },
        }

        evidence = {
            "affectedFilesCount": affected_files_count,
            "totalRepoFiles": total_repo_files,
            "layersCount": layers_count,
            "isCrossLayer": is_cross_layer,
            "callerCount": caller_count,
            "isSharedService": is_shared_service,
            "relatedTestsCount": related_tests_count,
            "isSecuritySensitive": is_security_sensitive,
            "isDatabaseWrite": is_database_write,
            "isPublicApi": is_public_api,
            "changedFunctionsCount": changed_functions_count,
        }

        # Human-readable explanations
        explanations = []
        if affected_files_count > 0:
            explanations.append(f"{affected_files_count} file(s) are affected across the repository")
        if layers_count > 1:
            explanations.append(f"Change crosses {layers_count} architectural layers")
        else:
            explanations.append("Change is isolated within 1 architectural layer")
        if caller_count > 0:
            explanations.append(f"{caller_count} downstream caller(s) depend on the affected code")
        if related_tests_count == 0:
            explanations.append("No automated tests were detected for the affected components")
        else:
            explanations.append(f"{related_tests_count} related test suite(s) detected")
        if is_security_sensitive:
            explanations.append("Security-sensitive authentication or token validation paths are touched")
        if is_shared_service:
            explanations.append("The affected service is shared across multiple modules")

        # Actionable recommendations
        recommendations = []
        if test_score >= 50:
            recommendations.append("Add automated tests for affected callers before executing refactoring.")
        if arch_score >= 50:
            recommendations.append("Consider splitting the refactor across architectural layer boundaries.")
        if dep_score >= 50:
            recommendations.append("Review downstream callers and maintain signature backwards-compatibility.")
        if file_score >= 50:
            recommendations.append("Reduce the number of affected files by splitting into atomic changes.")
        if sens_score >= 50:
            recommendations.append("Isolate credential and token modifications with explicit boundary validation.")

        contributors = [
            {"name": "Architecture", "score": factors["architectureImpact"]["score"], "level": factors["architectureImpact"]["level"]},
            {"name": "Dependencies", "score": factors["dependencyImpact"]["score"], "level": factors["dependencyImpact"]["level"]},
            {"name": "Test Coverage", "score": factors["testRisk"]["score"], "level": factors["testRisk"]["level"]},
            {"name": "Change Scope", "score": factors["fileImpact"]["score"], "level": factors["fileImpact"]["level"]},
            {"name": "Security Sensitivity", "score": factors["sensitivityRisk"]["score"], "level": factors["sensitivityRisk"]["level"]},
            {"name": "Complexity", "score": factors["complexityRisk"]["score"], "level": factors["complexityRisk"]["level"]},
        ]

        return {
            "rawScore": raw_score,
            "score": score,
            "level": level,
            "displayLabel": f"{score}/100 ({level.title()})",
            "factors": factors,
            "evidence": evidence,
            "explanations": explanations,
            "contributors": contributors,
            "recommendations": recommendations,
        }


risk_service = RiskService()
