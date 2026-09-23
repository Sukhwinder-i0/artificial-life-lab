from typing import List, Dict, Any
import numpy as np
from simulation.core.organism import Organism


class MetricsCalculator:
    """
    Computes statistical metrics and telemetry over organisms and environmental fields.
    """

    @staticmethod
    def compute_population_metrics(
        organisms: List[Organism],
        previous_count: int = 0,
    ) -> Dict[str, float]:
        alive = [org for org in organisms if org.is_alive]
        n_current = len(alive)

        # Per-capita growth rate r = ln(N_{t+1} / N_t)
        if previous_count > 0 and n_current > 0:
            growth_rate = float(np.log(n_current / previous_count))
        else:
            growth_rate = 0.0

        if n_current == 0:
            return {
                "population_count": 0.0,
                "growth_rate": growth_rate,
                "avg_energy": 0.0,
                "avg_age": 0.0,
                "avg_generation": 0.0,
            }

        energies = [org.energy for org in alive]
        ages = [org.age for org in alive]
        generations = [org.generation for org in alive]

        return {
            "population_count": float(n_current),
            "growth_rate": growth_rate,
            "avg_energy": float(np.mean(energies)),
            "avg_age": float(np.mean(ages)),
            "avg_generation": float(np.mean(generations)),
        }

    @staticmethod
    def compute_trait_statistics(organisms: List[Organism]) -> Dict[str, Dict[str, float]]:
        alive = [org for org in organisms if org.is_alive]
        if not alive:
            return {}

        traits_summary: Dict[str, Dict[str, float]] = {}
        gene_names = alive[0].genome.traits.keys()

        for gene in gene_names:
            vals = [org.genome.traits[gene] for org in alive]
            traits_summary[gene] = {
                "mean": float(np.mean(vals)),
                "std": float(np.std(vals)),
                "variance": float(np.var(vals)),
                "min": float(np.min(vals)),
                "max": float(np.max(vals)),
                "median": float(np.median(vals)),
            }

        return traits_summary
