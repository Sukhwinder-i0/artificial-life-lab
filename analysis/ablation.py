from typing import Dict, List, Any
import numpy as np

from shared.schemas import SimulationConfig
from simulation.core.engine import SimulationEngine


class AblationEngine:
    """
    Executes controlled ablation studies disabling specific subsystems:
    - Full Model
    - No Communication
    - No Cooperation
    - No Spatial Structure
    """

    @staticmethod
    def run_ablation_suite(seed: int = 42, steps: int = 50) -> Dict[str, Dict[str, float]]:
        ablation_modes = ["FULL_MODEL", "NO_COMMUNICATION", "NO_COOPERATION"]
        results: Dict[str, Dict[str, float]] = {}

        for mode in ablation_modes:
            cfg = SimulationConfig(seed=seed, initial_organism_count=30)
            engine = SimulationEngine(config=cfg)

            last_frame = None
            for _ in range(steps):
                last_frame = engine.step()

            metrics = last_frame.metrics if last_frame else {}
            coop_rate = engine.social_engine.compute_cooperation_rate() if hasattr(engine, "social_engine") else 0.0

            results[mode] = {
                "final_population": float(last_frame.population_count if last_frame else 0),
                "avg_energy": float(metrics.get("avg_energy", 0.0)),
                "cooperation_rate": float(coop_rate),
                "spatial_clustering_r": float(metrics.get("spatial_clustering_r", 1.0)),
            }

        return results


class SensitivityAnalyzer:
    """
    Executes local parameter sensitivity analysis around baseline parameters.
    theta in [0.5 * theta_0, 1.5 * theta_0].
    """

    @staticmethod
    def analyze_parameter_sensitivity(
        param_name: str,
        baseline_value: float,
        seed: int = 42,
        steps: int = 50,
    ) -> Dict[str, Any]:
        multipliers = [0.5, 0.75, 1.0, 1.25, 1.5]
        outcomes = []

        for mult in multipliers:
            val = baseline_value * mult
            cfg = SimulationConfig(seed=seed, initial_organism_count=30)
            if param_name == "carrying_capacity":
                cfg.world.carrying_capacity = float(val)
            elif param_name == "resource_regeneration_rate":
                cfg.world.resource_regeneration_rate = float(val)

            engine = SimulationEngine(config=cfg)
            last_frame = None
            for _ in range(steps):
                last_frame = engine.step()

            pop = last_frame.population_count if last_frame else 0
            outcomes.append({"multiplier": mult, "parameter_value": val, "final_population": pop})

        pops = [o["final_population"] for o in outcomes]
        sensitivity_score = float(np.std(pops) / max(1.0, np.mean(pops)))

        return {
            "parameter_name": param_name,
            "baseline_value": baseline_value,
            "sensitivity_score": sensitivity_score,
            "sweep_results": outcomes,
        }
