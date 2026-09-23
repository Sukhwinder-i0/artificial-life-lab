from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class ExperimentSpec(BaseModel):
    experiment_id: str
    name: str
    research_question: str
    hypothesis: str
    independent_variables: Dict[str, List[Any]] = Field(
        default_factory=dict,
        description="Parameters to sweep over e.g. {'carrying_capacity': [10.0, 50.0, 100.0]}"
    )
    dependent_variables: List[str] = Field(
        default_factory=lambda: ["cooperation_rate", "avg_fitness", "population_count", "survival_rate"]
    )
    control_variables: Dict[str, Any] = Field(default_factory=dict)
    replicates_per_condition: int = 10
    max_generations: int = 100
    base_random_seed: int = 42


class RunResult(BaseModel):
    run_id: str
    condition_params: Dict[str, Any]
    seed: int
    final_population: int
    avg_energy: float
    cooperation_rate: float
    spatial_clustering_r: float
    metrics_summary: Dict[str, float]


class ExperimentResults(BaseModel):
    experiment_id: str
    total_runs: int
    completed_runs: int
    runs: List[RunResult]
    condition_summaries: Dict[str, Dict[str, Any]]
