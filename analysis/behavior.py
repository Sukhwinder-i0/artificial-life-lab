from typing import List, Dict, Any
import math
import numpy as np


class BehaviorAnalyzer:
    """
    Analyzes categorical organism action frequencies and computes behavioral entropy:
    H_behavior = - sum p_i ln(p_i).
    """

    @staticmethod
    def analyze_behavior_distribution(actions: List[str]) -> Dict[str, Any]:
        """
        Computes categorical action frequencies and Shannon behavioral entropy.
        """
        if not actions:
            return {"frequencies": {}, "entropy": 0.0, "total_actions": 0}

        counts: Dict[str, int] = {}
        for act in actions:
            # Group SIGNAL_0, SIGNAL_1 into SIGNAL category
            key = act.split("_")[0] if act.startswith("SIGNAL") else act
            counts[key] = counts.get(key, 0) + 1

        total = len(actions)
        frequencies = {k: float(v / total) for k, v in counts.items()}

        probs = list(frequencies.values())
        entropy = -sum(p * math.log(p) for p in probs if p > 0)

        return {
            "frequencies": frequencies,
            "counts": counts,
            "entropy": float(entropy),
            "total_actions": total,
        }
