"""Unit tests for RepoMind Risk Engine."""

import pytest
from app.services.risk_service import (
    risk_service,
    get_risk_level,
    calculate_file_impact,
    calculate_architecture_impact,
    calculate_dependency_impact,
    calculate_test_risk,
    calculate_sensitivity_risk,
    calculate_complexity_risk,
)


def test_scenario_1_small_isolated_change():
    """Small isolated change within 1 file, 1 caller, strong tests -> LOW."""
    res = risk_service.evaluate_risk(
        affected_files_count=1,
        total_repo_files=100,
        layers_count=1,
        is_cross_layer=False,
        caller_count=1,
        is_shared_service=False,
        related_tests_count=6,
        is_security_sensitive=False,
        is_database_write=False,
        is_public_api=False,
        changed_functions_count=1,
    )
    assert res["level"] == "LOW"
    assert res["score"] < 25


def test_scenario_2_moderate_multifile_change():
    """Moderate multi-file change (3 files, 2 layers, 4 callers, 4 tests) -> MODERATE."""
    res = risk_service.evaluate_risk(
        affected_files_count=3,
        total_repo_files=100,
        layers_count=2,
        is_cross_layer=True,
        caller_count=4,
        is_shared_service=False,
        related_tests_count=4,
        is_security_sensitive=False,
        is_database_write=False,
        is_public_api=False,
        changed_functions_count=2,
    )
    assert res["level"] == "MODERATE"
    assert 25 <= res["score"] < 50


def test_scenario_3_multilayer_many_callers_benchmark():
    """Multi-layer change with many callers (6 files, 3 layers, 9 callers, 4 tests, auth) -> HIGH (62/100)."""
    res = risk_service.evaluate_risk(
        affected_files_count=6,
        total_repo_files=150,
        layers_count=3,
        is_cross_layer=True,
        caller_count=9,
        is_shared_service=True,
        related_tests_count=4,
        is_security_sensitive=True,
        is_database_write=True,
        is_public_api=True,
        changed_functions_count=1,
    )
    assert res["level"] == "HIGH"
    assert 50 <= res["score"] < 75
    # Confirm exact benchmark alignment around 60-68 HIGH range
    assert 60 <= res["score"] <= 68
    assert "(High)" in res["displayLabel"]


def test_scenario_4_large_security_sensitive_weak_tests():
    """Large security-sensitive change touching many files with 0 tests -> CRITICAL."""
    res = risk_service.evaluate_risk(
        affected_files_count=14,
        total_repo_files=80,
        layers_count=4,
        is_cross_layer=True,
        caller_count=16,
        is_shared_service=True,
        related_tests_count=0,
        is_security_sensitive=True,
        is_database_write=True,
        is_public_api=True,
        changed_functions_count=6,
    )
    assert res["level"] == "CRITICAL"
    assert res["score"] >= 75


def test_scenario_5_boundary_values():
    """Exact classification boundary checks: 24, 25, 49, 50, 74, 75."""
    assert get_risk_level(0) == "LOW"
    assert get_risk_level(24) == "LOW"
    assert get_risk_level(24.4) == "LOW"
    assert get_risk_level(25) == "MODERATE"
    assert get_risk_level(49) == "MODERATE"
    assert get_risk_level(49.4) == "MODERATE"
    assert get_risk_level(50) == "HIGH"
    assert get_risk_level(74) == "HIGH"
    assert get_risk_level(74.4) == "HIGH"
    assert get_risk_level(75) == "CRITICAL"
    assert get_risk_level(100) == "CRITICAL"


def test_scenario_6_no_tests_detected():
    """Zero tests detected triggers high test risk."""
    risk = calculate_test_risk(related_tests_count=0, affected_files_count=4)
    assert risk >= 90.0


def test_scenario_7_no_dependency_information_available():
    """0 callers produces low isolated caller subscore."""
    dep_score = calculate_dependency_impact(caller_count=0, is_shared_service=False)
    assert dep_score == 5.0


def test_scenario_8_security_sensitive_change():
    """Security sensitive flag elevates sensitivity subscore."""
    sens_normal = calculate_sensitivity_risk(is_security_sensitive=False, is_database_write=False, is_public_api=False)
    sens_secure = calculate_sensitivity_risk(is_security_sensitive=True, is_database_write=True, is_public_api=True)
    assert sens_secure > sens_normal
    assert sens_secure >= 90.0


def test_scenario_9_large_repo_small_relative_change():
    """Large repository (5,000 files) dampens file impact for small change."""
    score_small_repo = calculate_file_impact(affected_files_count=2, total_repo_files=10)
    score_large_repo = calculate_file_impact(affected_files_count=2, total_repo_files=5000)
    assert score_large_repo <= score_small_repo


def test_scenario_10_small_repo_large_relative_change():
    """Small repository (10 files) with 6 files affected (60%) amplifies score."""
    score_normal = calculate_file_impact(affected_files_count=6, total_repo_files=200)
    score_amplified = calculate_file_impact(affected_files_count=6, total_repo_files=10)
    assert score_amplified > score_normal
    assert score_amplified >= 80.0
