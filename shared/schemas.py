from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field


class WorldConfig(BaseModel):
    width: float = Field(default=200.0, description="World width in continuous spatial units")
    height: float = Field(default=200.0, description="World height in continuous spatial units")
    boundary_condition: Literal["toroidal", "bounded"] = Field(default="toroidal")
    resource_density: float = Field(default=0.05, description="Initial resource spatial density")
    resource_regeneration_rate: float = Field(default=0.1, description="Logistic regeneration r")
    carrying_capacity: float = Field(default=100.0, description="Resource carrying capacity K")
    resource_distribution: Literal["uniform", "clustered", "patchy", "seasonal"] = Field(default="uniform")
    temperature: float = Field(default=20.0, description="Base environmental temperature")
    temperature_variability: float = Field(default=0.0, description="Thermal spatial variability")
    disaster_probability: float = Field(default=0.0, description="Stochastic catastrophe probability")
    population_capacity: int = Field(default=1000, description="Soft upper population limit")


class GenomeConfig(BaseModel):
    speed_min: float = 0.1
    speed_max: float = 5.0
    vision_range_min: float = 1.0
    vision_range_max: float = 50.0
    metabolic_rate_min: float = 0.01
    metabolic_rate_max: float = 2.0
    mutation_probability: float = 0.01
    mutation_std: float = 0.05
    reproduction_threshold_default: float = 50.0
    offspring_cost_default: float = 25.0


class SimulationConfig(BaseModel):
    seed: int = Field(default=42, description="Deterministic random seed")
    world: WorldConfig = Field(default_factory=WorldConfig)
    genome: GenomeConfig = Field(default_factory=GenomeConfig)
    initial_organism_count: int = Field(default=50, description="Starting organism population")
    max_steps: int = Field(default=10000, description="Maximum simulation timesteps")


class OrganismState(BaseModel):
    id: str
    parent_id: Optional[str] = None
    second_parent_id: Optional[str] = None
    generation: int
    birth_time: int
    age: int
    x: float
    y: float
    vx: float
    vy: float
    energy: float
    health: float
    genome: Dict[str, float]
    current_action: str = "IDLE"
    cause_of_death: Optional[str] = None


class ResourcePatch(BaseModel):
    x: float
    y: float
    amount: float


class TelemetryFrame(BaseModel):
    step: int
    time: float
    population_count: int
    births_this_step: int
    deaths_this_step: int
    metrics: Dict[str, float]
    organisms: List[OrganismState]
    resources: Optional[List[ResourcePatch]] = None
