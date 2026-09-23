from typing import List, Dict, Tuple, Optional
import numpy as np

from shared.schemas import SimulationConfig, TelemetryFrame
from simulation.core.world import World
from simulation.core.resource import ResourceEngine
from simulation.core.genome import Genome
from simulation.core.brain import MLPBrain
from simulation.core.organism import Organism
from simulation.core.lineage import LineageTracker
from simulation.core.spatial import SpatialGrid
from simulation.core.ecology import EcologyEngine
from analysis.metrics import MetricsCalculator


from simulation.core.social import SocialEngine


class SimulationEngine:
    """
    Deterministic Discrete-Time Simulation Kernel for Artificial Life Lab.
    Executes the strict 13-step lifecycle pipeline per timestep with neural policy,
    lineage tracking, spatial hashing grid, and ecological predation.
    """

    def __init__(self, config: Optional[SimulationConfig] = None):
        self.config = config if config else SimulationConfig()
        self.seed = self.config.seed
        self.rng = np.random.default_rng(self.seed)

        # Initialize World & Environmental Fields
        self.world = World(
            width=self.config.world.width,
            height=self.config.world.height,
            boundary_condition=self.config.world.boundary_condition,
            base_temperature=self.config.world.temperature,
        )

        # Initialize Resource Regeneration Engine
        self.resource_engine = ResourceEngine(
            world=self.world,
            regeneration_rate=self.config.world.resource_regeneration_rate,
            carrying_capacity=self.config.world.carrying_capacity,
            distribution_mode=self.config.world.resource_distribution,
            seed=self.seed,
        )

        # Initialize Spatial Hash Grid, Lineage Tracker, & Social Engine
        self.spatial_grid = SpatialGrid(
            width=self.config.world.width,
            height=self.config.world.height,
            cell_size=20.0,
        )
        self.lineage_tracker = LineageTracker()
        self.social_engine = SocialEngine()

        self.step_count = 0
        self.org_id_counter = 0
        self.organisms: List[Organism] = []
        self.births_this_step = 0
        self.deaths_this_step = 0

        self.initialize_population()

    def generate_org_id(self) -> str:
        self.org_id_counter += 1
        return f"org-{self.org_id_counter:06d}"

    def initialize_population(self) -> None:
        """
        Seeds initial organism population uniformly across the 2D world.
        """
        self.organisms.clear()
        count = self.config.initial_organism_count

        for _ in range(count):
            rx = float(self.rng.uniform(0, self.world.width))
            ry = float(self.rng.uniform(0, self.world.height))
            genome = Genome()
            genome.mutate(self.rng, mutation_probability=0.5, mutation_std=0.02)
            brain = MLPBrain(rng=self.rng)

            org_id = self.generate_org_id()
            org = Organism(
                x=rx,
                y=ry,
                genome=genome,
                brain=brain,
                parent_id=None,
                generation=0,
                birth_time=0,
                initial_energy=40.0,
                organism_id=org_id,
                rng=self.rng,
            )
            self.organisms.append(org)
            self.lineage_tracker.register_birth(
                organism_id=org_id,
                parent_id=None,
                second_parent_id=None,
                generation=0,
                birth_time=0,
                traits=genome.traits,
            )

    def step(self) -> TelemetryFrame:
        """
        Executes a single discrete simulation step adhering strictly to the 13-step pipeline.
        """
        self.births_this_step = 0
        self.deaths_this_step = 0
        prev_pop = len([o for o in self.organisms if o.is_alive])

        # STEP 1: Environment updates
        # STEP 2: Resources regenerate via logistic kinematics
        self.resource_engine.step(timestep=self.step_count)

        # Re-index alive organisms into Spatial Hashing Grid
        self.spatial_grid.clear()
        alive_organisms = [o for o in self.organisms if o.is_alive]
        for org in alive_organisms:
            self.spatial_grid.insert(org)

        # Shuffle active organisms deterministically to eliminate spatial index priority bias
        self.rng.shuffle(alive_organisms)

        # STEP 3 & 4: Perception & Neural Decision Forward Pass
        for org in alive_organisms:
            if not org.is_alive:
                continue

            org.update_age()

            # Query nearby conspecifics via spatial grid
            nearby = self.spatial_grid.query_radius(org.x, org.y, radius=org.genome.traits["vision_range"])

            # Neural forward pass
            action_vec = org.think_and_act(
                world=self.world,
                conspecifics=nearby,
                predators=nearby,
            )

            # Map Neural Action Outputs
            move_x, move_y = action_vec[0], action_vec[1]
            eat_intent = action_vec[2]
            reproduce_intent = action_vec[5]

            # STEP 5: Movement execution & coordinate wrapping
            dx = move_x * org.genome.traits["speed"]
            dy = move_y * org.genome.traits["speed"]
            dist_moved = org.move(dx, dy)
            org.x, org.y = self.world.wrap_coordinates(org.x, org.y)

            # STEP 6: Energy consumed by metabolism
            org.consume_metabolism(dist_moved)
            if not org.is_alive:
                self.deaths_this_step += 1
                self.lineage_tracker.register_death(org.id, self.step_count, "starvation")

            # STEP 7: Organisms consume resources
            if org.is_alive and eat_intent > 0.3 and org.energy < org.max_energy:
                eaten = self.world.consume_food(org.x, org.y, amount=12.0)
                org.eat(eaten)

            # STEP 9 & 10: Reproduction & Neural/Genetic Mutation
            if org.is_alive and reproduce_intent > 0.5 and org.can_reproduce():
                offspring_cost = org.genome.traits["offspring_cost"]
                org.energy -= offspring_cost
                org.successful_offspring_count += 1

                # Inherit & Mutate Genome
                offspring_genome = org.genome.copy()
                offspring_genome.mutate(
                    self.rng,
                    mutation_probability=self.config.genome.mutation_probability,
                    mutation_std=self.config.genome.mutation_std,
                )

                # Inherit & Mutate Neural Brain Policy
                offspring_brain = org.brain.copy()
                offspring_brain.mutate(
                    self.rng,
                    mutation_probability=0.05,
                    mutation_std=0.1,
                )

                offspring_id = self.generate_org_id()
                offspring = Organism(
                    x=org.x + float(self.rng.uniform(-1.0, 1.0)),
                    y=org.y + float(self.rng.uniform(-1.0, 1.0)),
                    genome=offspring_genome,
                    brain=offspring_brain,
                    parent_id=org.id,
                    generation=org.generation + 1,
                    birth_time=self.step_count,
                    initial_energy=offspring_cost * 0.8,
                    organism_id=offspring_id,
                    rng=self.rng,
                )
                offspring.x, offspring.y = self.world.wrap_coordinates(offspring.x, offspring.y)
                self.organisms.append(offspring)
                self.births_this_step += 1

                self.lineage_tracker.register_birth(
                    organism_id=offspring_id,
                    parent_id=org.id,
                    second_parent_id=None,
                    generation=org.generation + 1,
                    birth_time=self.step_count,
                    traits=offspring_genome.traits,
                )

            # STEP 11: Death checks (health, age limits)
            if org.is_alive and org.age >= 500:
                org.die(cause="age")
                self.deaths_this_step += 1
                self.lineage_tracker.register_death(org.id, self.step_count, "age")

        # STEP 8: Social interactions, energy sharing & communication (batch executed)
        alive_for_social = [o for o in self.organisms if o.is_alive]
        self.social_engine.process_social_interactions(alive_for_social, self.spatial_grid)

        # Process Predation & Combat Engine
        kills, damage_inflicted = EcologyEngine.process_combat_and_predation(
            organisms=self.organisms,
            spatial_grid=self.spatial_grid,
            rng=self.rng,
        )
        self.deaths_this_step += kills

        # Filter active remaining organisms
        alive_remaining = [o for o in self.organisms if o.is_alive]

        # STEP 12: Calculate Metrics, Telemetry & Emergence Indicators
        pop_metrics = MetricsCalculator.compute_population_metrics(
            organisms=alive_remaining,
            previous_count=prev_pop,
        )
        trait_stats = MetricsCalculator.compute_trait_statistics(alive_remaining)
        r_spatial = EcologyEngine.compute_spatial_clustering_index(
            organisms=alive_remaining,
            world_width=self.world.width,
            world_height=self.world.height,
        )

        metrics_dict: Dict[str, float] = {
            "population_count": pop_metrics["population_count"],
            "growth_rate": pop_metrics["growth_rate"],
            "avg_energy": pop_metrics["avg_energy"],
            "avg_age": pop_metrics["avg_age"],
            "avg_generation": pop_metrics["avg_generation"],
            "spatial_clustering_r": r_spatial,
            "predation_kills": float(kills),
        }
        for gene, stats in trait_stats.items():
            metrics_dict[f"gene_{gene}_mean"] = stats["mean"]
            metrics_dict[f"gene_{gene}_std"] = stats["std"]

        # Extract active food resource patches (where food > 5.0)
        from shared.schemas import ResourcePatch
        food_indices = np.argwhere(self.world.food_field > 5.0)
        resource_patches = []
        for r, c in food_indices[:150]:
            resource_patches.append(
                ResourcePatch(
                    x=float(c * self.world.resolution + self.world.resolution / 2),
                    y=float(r * self.world.resolution + self.world.resolution / 2),
                    amount=float(self.world.food_field[r, c]),
                )
            )

        frame = TelemetryFrame(
            step=self.step_count,
            time=float(self.step_count),
            population_count=int(pop_metrics["population_count"]),
            births_this_step=self.births_this_step,
            deaths_this_step=self.deaths_this_step,
            metrics=metrics_dict,
            organisms=[o.to_state() for o in alive_remaining[:200]],
            resources=resource_patches,
        )

        # STEP 13: Advance generation/time
        self.step_count += 1
        return frame
