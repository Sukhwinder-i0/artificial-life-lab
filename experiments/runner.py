import itertools
from typing import Dict, List, Any
import numpy as np

from shared.schemas import SimulationConfig
from simulation.core.engine import SimulationEngine
from experiments.schema import ExperimentSpec, RunResult, ExperimentResults
from storage.persistence import StorageManager


class ExperimentRunner:
    """
    Automated Batch & Parameter Sweep Experiment Runner.
    Executes controlled factorial combinations across independent random seeds.
    """

    def __init__(self, spec: ExperimentSpec, storage_manager: StorageManager):
        self.spec = spec
        self.storage = storage_manager

    def generate_parameter_combinations(self) -> List[Dict[str, Any]]:
        """
        Generates Cartesian product of all independent variable conditions.
        """
        if not self.spec.independent_variables:
            return [{}]

        keys = list(self.spec.independent_variables.keys())
        values = list(self.spec.independent_variables.values())
        combinations = []
        for combo in itertools.product(*values):
            combinations.append(dict(zip(keys, combo)))
        return combinations

    def run_experiment(self, max_steps_per_run: int = 50) -> ExperimentResults:
        """
        Executes parameter sweep batch across all conditions and random seeds.
        """
        conditions = self.generate_parameter_combinations()
        run_results: List[RunResult] = []
        current_seed = self.spec.base_random_seed

        for cond_idx, cond in enumerate(conditions):
            for rep in range(self.spec.replicates_per_condition):
                seed = current_seed
                current_seed += 1
                run_id = f"{self.spec.experiment_id}-c{cond_idx}-r{rep}"

                # Configure simulation
                cfg = SimulationConfig(seed=seed, initial_organism_count=30)
                if "carrying_capacity" in cond:
                    cfg.world.carrying_capacity = float(cond["carrying_capacity"])
                if "resource_regeneration_rate" in cond:
                    cfg.world.resource_regeneration_rate = float(cond["resource_regeneration_rate"])

                engine = SimulationEngine(config=cfg)

                # Step simulation
                last_frame = None
                for _ in range(max_steps_per_run):
                    last_frame = engine.step()

                metrics = last_frame.metrics if last_frame else {}
                coop_rate = engine.social_engine.compute_cooperation_rate() if hasattr(engine, "social_engine") else 0.0

                result = RunResult(
                    run_id=run_id,
                    condition_params=cond,
                    seed=seed,
                    final_population=last_frame.population_count if last_frame else 0,
                    avg_energy=metrics.get("avg_energy", 0.0),
                    cooperation_rate=coop_rate,
                    spatial_clustering_r=metrics.get("spatial_clustering_r", 1.0),
                    metrics_summary=metrics,
                )
                run_results.append(result)

        # Aggregate Condition Summaries
        cond_summaries: Dict[str, Dict[str, Any]] = {}
        for cond_idx, cond in enumerate(conditions):
            cond_key = str(cond) if cond else "control"
            cond_runs = [r for r in run_results if r.condition_params == cond]
            pops = [r.final_population for r in cond_runs]
            coops = [r.cooperation_rate for r in cond_runs]

            cond_summaries[cond_key] = {
                "condition_params": cond,
                "n_replicates": len(cond_runs),
                "pop_mean": float(np.mean(pops)),
                "pop_std": float(np.std(pops)),
                "cooperation_rate_mean": float(np.mean(coops)),
                "cooperation_rate_std": float(np.std(coops)),
            }

        exp_results = ExperimentResults(
            experiment_id=self.spec.experiment_id,
            total_runs=len(run_results),
            completed_runs=len(run_results),
            runs=run_results,
            condition_summaries=cond_summaries,
        )

        # Save metadata and results
        self.storage.save_experiment_metadata(self.spec.experiment_id, exp_results.model_dump())
        return exp_results
