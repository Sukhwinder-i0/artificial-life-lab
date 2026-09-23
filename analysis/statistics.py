from typing import List, Tuple, Dict, Any
import numpy as np
from scipy import stats


class BootstrapCalculator:
    """
    Computes non-parametric percentile Bootstrap 95% Confidence Intervals (95% CI).
    """

    @staticmethod
    def compute_95_ci(data: List[float], num_bootstraps: int = 2000, seed: int = 42) -> Tuple[float, float, float]:
        """
        Returns (sample_mean, ci_lower_95, ci_upper_95).
        """
        arr = np.array(data, dtype=np.float64)
        if len(arr) == 0:
            return 0.0, 0.0, 0.0
        if len(arr) == 1:
            return float(arr[0]), float(arr[0]), float(arr[0])

        rng = np.random.default_rng(seed)
        n = len(arr)
        boot_means = np.empty(num_bootstraps, dtype=np.float64)

        for b in range(num_bootstraps):
            resample = rng.choice(arr, size=n, replace=True)
            boot_means[b] = np.mean(resample)

        mean_val = float(np.mean(arr))
        ci_lower = float(np.percentile(boot_means, 2.5))
        ci_upper = float(np.percentile(boot_means, 97.5))
        return mean_val, ci_lower, ci_upper


class EffectSizeCalculator:
    """
    Calculates standardized effect size indicators (Cohen's d).
    """

    @staticmethod
    def cohens_d(group1: List[float], group2: List[float]) -> float:
        """
        Computes Cohen's d: d = (mean_1 - mean_2) / s_pooled.
        """
        a1 = np.array(group1, dtype=np.float64)
        a2 = np.array(group2, dtype=np.float64)

        n1, n2 = len(a1), len(a2)
        if n1 < 2 or n2 < 2:
            return 0.0

        m1, m2 = np.mean(a1), np.mean(a2)
        v1, v2 = np.var(a1, ddof=1), np.var(a2, ddof=1)

        s_pooled = np.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2))
        if s_pooled < 1e-9:
            return 0.0

        return float((m1 - m2) / s_pooled)


class HypothesisTester:
    """
    Executes parametric (Welch's t-test) and non-parametric (Mann-Whitney U) tests
    with Benjamini-Hochberg False Discovery Rate (FDR) corrections.
    """

    @staticmethod
    def compare_two_groups(
        group1: List[float],
        group2: List[float],
        test_type: str = "mann_whitney",
    ) -> Dict[str, float]:
        a1 = np.array(group1, dtype=np.float64)
        a2 = np.array(group2, dtype=np.float64)

        if len(a1) < 2 or len(a2) < 2:
            return {"statistic": 0.0, "p_value": 1.0}

        if test_type == "welch_t":
            res = stats.ttest_ind(a1, a2, equal_var=False)
        else:
            res = stats.mannwhitneyu(a1, a2, alternative="two-sided")

        return {"statistic": float(res.statistic), "p_value": float(res.pvalue)}

    @staticmethod
    def benjamini_hochberg_fdr(p_values: List[float], fdr_q: float = 0.05) -> List[bool]:
        """
        Applies Benjamini-Hochberg procedure to adjust p-values for multiple comparisons.
        """
        m = len(p_values)
        if m == 0:
            return []

        sorted_indices = np.argsort(p_values)
        sorted_p = np.array(p_values)[sorted_indices]
        significant = np.zeros(m, dtype=bool)

        max_k = -1
        for k in range(m):
            if sorted_p[k] <= (k + 1) / m * fdr_q:
                max_k = k

        if max_k >= 0:
            significant[sorted_indices[: max_k + 1]] = True

        return list(significant)
