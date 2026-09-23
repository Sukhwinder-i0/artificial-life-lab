import pytest
import numpy as np
from analysis.statistics import BootstrapCalculator, EffectSizeCalculator, HypothesisTester


def test_bootstrap_95_confidence_interval():
    rng = np.random.default_rng(42)
    # Generate 100 samples from normal distribution N(50, 10^2)
    samples = list(rng.normal(50.0, 10.0, size=100))

    mean_val, ci_lower, ci_upper = BootstrapCalculator.compute_95_ci(samples, num_bootstraps=1000, seed=42)

    assert pytest.approx(mean_val, abs=1.5) == 50.0
    assert ci_lower < mean_val < ci_upper
    assert ci_lower >= 45.0
    assert ci_upper <= 55.0


def test_cohens_d_effect_size():
    group1 = [10, 12, 11, 13, 10]
    group2 = [20, 22, 21, 23, 20]

    d = EffectSizeCalculator.cohens_d(group1, group2)
    # Cohen's d should be negative (large effect magnitude around -10)
    assert d < -2.0


def test_hypothesis_tests_and_fdr():
    g1 = [1, 2, 3, 4, 5]
    g2 = [10, 11, 12, 13, 14]

    res = HypothesisTester.compare_two_groups(g1, g2, test_type="mann_whitney")
    assert res["p_value"] < 0.05

    # Test Benjamini-Hochberg FDR correction
    p_vals = [0.001, 0.02, 0.04, 0.80]
    sig = HypothesisTester.benjamini_hochberg_fdr(p_vals, fdr_q=0.05)
    assert sig[0] is True or sig[0] == 1
    assert sig[3] is False or sig[3] == 0
