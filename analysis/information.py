from typing import List, Tuple, Dict
import math
import numpy as np


class InformationTheoryCalculator:
    """
    Information theory metrics: Shannon Entropy and Mutual Information I(M; Y)
    for signal communication analysis.
    """

    @staticmethod
    def shannon_entropy(probabilities: List[float]) -> float:
        """
        Computes Shannon entropy H = - sum p_i ln(p_i) in nats.
        """
        probs = np.array(probabilities, dtype=np.float64)
        probs = probs[probs > 0]
        if len(probs) == 0:
            return 0.0
        return float(-np.sum(probs * np.log(probs)))

    @staticmethod
    def normalized_entropy(counts: List[int]) -> float:
        """
        Computes normalized entropy H_norm = H / ln(K) in [0, 1].
        """
        total = sum(counts)
        if total == 0 or len(counts) <= 1:
            return 0.0

        probs = [c / total for c in counts if c > 0]
        h = InformationTheoryCalculator.shannon_entropy(probs)
        h_max = math.log(len(counts))
        return float(h / h_max) if h_max > 0 else 0.0

    @staticmethod
    def mutual_information(signals: List[int], environmental_states: List[int]) -> float:
        """
        Computes empirical Mutual Information I(M; Y) between emitted signal tokens M
        and environmental states / actions Y in bits.
        I(M; Y) = sum P(m,y) log2( P(m,y) / (P(m) * P(y)) )
        """
        if len(signals) != len(environmental_states) or len(signals) == 0:
            return 0.0

        n = len(signals)
        joint_counts: Dict[Tuple[int, int], int] = {}
        m_counts: Dict[int, int] = {}
        y_counts: Dict[int, int] = {}

        for m, y in zip(signals, environmental_states):
            joint_counts[(m, y)] = joint_counts.get((m, y), 0) + 1
            m_counts[m] = m_counts.get(m, 0) + 1
            y_counts[y] = y_counts.get(y, 0) + 1

        mi = 0.0
        for (m, y), count in joint_counts.items():
            p_my = count / n
            p_m = m_counts[m] / n
            p_y = y_counts[y] / n
            if p_my > 0 and p_m > 0 and p_y > 0:
                mi += p_my * math.log2(p_my / (p_m * p_y))

        return max(0.0, float(mi))
