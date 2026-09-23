from typing import Dict, Tuple, Optional
import numpy as np

# Trait definitions: (default_value, min_bound, max_bound)
GENOME_TRAIT_DEFAULTS: Dict[str, Tuple[float, float, float]] = {
    "speed": (1.0, 0.1, 5.0),
    "vision_range": (15.0, 1.0, 50.0),
    "vision_resolution": (8.0, 4.0, 36.0),
    "metabolic_rate": (0.1, 0.01, 2.0),
    "reproduction_threshold": (50.0, 10.0, 200.0),
    "offspring_cost": (25.0, 5.0, 100.0),
    "attack_strength": (5.0, 0.0, 20.0),
    "defense_strength": (2.0, 0.0, 20.0),
    "social_tendency": (0.0, -1.0, 1.0),
    "communication_tendency": (0.0, 0.0, 1.0),
    "risk_preference": (0.0, -1.0, 1.0),
    "exploration_tendency": (0.2, 0.0, 1.0),
}


class Genome:
    """
    Heritable Quantitative Genome containing explicit continuous trait parameters.
    """

    def __init__(self, traits: Optional[Dict[str, float]] = None):
        self.traits: Dict[str, float] = {}

        # Populate default traits
        for gene, (def_val, _, _) in GENOME_TRAIT_DEFAULTS.items():
            self.traits[gene] = def_val

        # Override with custom traits if provided
        if traits is not None:
            for gene, val in traits.items():
                if gene in GENOME_TRAIT_DEFAULTS:
                    _, min_b, max_b = GENOME_TRAIT_DEFAULTS[gene]
                    self.traits[gene] = max(min_b, min(max_b, float(val)))

    def copy(self) -> "Genome":
        return Genome(traits=self.traits.copy())

    def mutate(
        self,
        rng: np.random.Generator,
        mutation_probability: float = 0.01,
        mutation_std: float = 0.05,
    ) -> Dict[str, float]:
        """
        Applies explicit Gaussian point mutations: g' = clamp(g + N(0, sigma^2), min, max).
        Returns a dictionary of logged mutation deltas: {trait_name: delta_value}.
        """
        mutation_logs: Dict[str, float] = {}

        for gene, val in self.traits.items():
            if rng.random() < mutation_probability:
                _, min_b, max_b = GENOME_TRAIT_DEFAULTS[gene]
                delta = float(rng.normal(0.0, mutation_std * (max_b - min_b)))
                new_val = max(min_b, min(max_b, val + delta))
                actual_delta = new_val - val

                self.traits[gene] = new_val
                if abs(actual_delta) > 1e-9:
                    mutation_logs[gene] = actual_delta

        return mutation_logs

    @staticmethod
    def crossover(
        parent_a: "Genome",
        parent_b: "Genome",
        rng: np.random.Generator,
    ) -> "Genome":
        """
        Sexual recombination: inherits each gene from Parent A or B with 50% probability.
        """
        child_traits: Dict[str, float] = {}
        for gene in GENOME_TRAIT_DEFAULTS.keys():
            val_a = parent_a.traits.get(gene, GENOME_TRAIT_DEFAULTS[gene][0])
            val_b = parent_b.traits.get(gene, GENOME_TRAIT_DEFAULTS[gene][0])
            child_traits[gene] = val_a if rng.random() < 0.5 else val_b

        return Genome(traits=child_traits)
