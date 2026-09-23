from typing import Optional, List, Dict, Tuple, Any
import uuid
import math
import numpy as np
from simulation.core.genome import Genome
from simulation.core.brain import MLPBrain
from simulation.core.sensor import SensorSystem
from shared.schemas import OrganismState


class Organism:
    """
    Individual Organism entity maintaining continuous state, heritable genome,
    MLP neural network brain policy, metabolic energy reserves, spatial position,
    and lifecycle tracking.
    """

    def __init__(
        self,
        x: float,
        y: float,
        genome: Optional[Genome] = None,
        brain: Optional[MLPBrain] = None,
        parent_id: Optional[str] = None,
        second_parent_id: Optional[str] = None,
        generation: int = 0,
        birth_time: int = 0,
        initial_energy: float = 30.0,
        organism_id: Optional[str] = None,
        rng: Optional[np.random.Generator] = None,
    ):
        self.id = organism_id if organism_id else f"org-{uuid.uuid4().hex[:8]}"
        self.parent_id = parent_id
        self.second_parent_id = second_parent_id
        self.generation = generation
        self.birth_time = birth_time
        self.age = 0

        self.x = x
        self.y = y
        self.vx = 0.0
        self.vy = 0.0

        self.energy = initial_energy
        self.max_energy = 150.0
        self.health = 100.0
        self.max_health = 100.0

        self.genome = genome if genome else Genome()
        self.brain = brain if brain else MLPBrain(rng=rng)
        self.current_action = "IDLE"
        self.cause_of_death: Optional[str] = None
        self.is_alive = True

        # Lifetime statistics
        self.successful_offspring_count = 0
        self.lifetime_energy_consumed = 0.0
        self.lifetime_distance_traveled = 0.0

    def think_and_act(
        self,
        world: Any,
        conspecifics: List["Organism"],
        predators: List["Organism"],
    ) -> np.ndarray:
        """
        Executes sensory observation and neural network brain forward pass.
        Returns 7-dim action vector.
        """
        if not self.is_alive:
            return np.zeros(7, dtype=np.float64)

        sensory_vec = SensorSystem.sense(self, world, conspecifics, predators)
        action_vec = self.brain.forward(sensory_vec)

        # Brain energetic computation cost
        brain_cost = self.brain.compute_brain_cost(alpha_brain=0.0005)
        self.energy -= brain_cost
        if self.energy <= 0.0:
            self.die(cause="starvation")

        return action_vec

    def update_age(self) -> None:
        if self.is_alive:
            self.age += 1

    def move(self, dx: float, dy: float, max_speed_override: Optional[float] = None) -> float:
        """
        Executes continuous movement vector (dx, dy).
        Returns continuous distance moved.
        """
        if not self.is_alive:
            return 0.0

        max_s = max_speed_override if max_speed_override is not None else self.genome.traits["speed"]
        dist = math.hypot(dx, dy)

        if dist > max_s and dist > 0:
            scale = max_s / dist
            dx *= scale
            dy *= scale
            dist = max_s

        self.vx = dx
        self.vy = dy
        self.x += dx
        self.y += dy
        self.lifetime_distance_traveled += dist
        self.current_action = "MOVE" if dist > 0.01 else "REST"
        return dist

    def consume_metabolism(self, distance_moved: float) -> float:
        """
        Deducts basal metabolism and kinetic movement energy costs.
        E_cost = m_basal + alpha * d
        """
        if not self.is_alive:
            return 0.0

        m_basal = self.genome.traits["metabolic_rate"]
        alpha_movement = 0.05
        movement_cost = alpha_movement * distance_moved

        total_cost = m_basal + movement_cost
        self.energy -= total_cost

        if self.energy <= 0.0:
            self.die(cause="starvation")

        return total_cost

    def eat(self, food_energy: float) -> float:
        """
        Consumes available food energy up to max_energy.
        """
        if not self.is_alive or food_energy <= 0.0:
            return 0.0

        space = self.max_energy - self.energy
        gain = min(space, food_energy)
        self.energy += gain
        self.lifetime_energy_consumed += gain
        self.current_action = "EAT"
        return gain

    def can_reproduce(self) -> bool:
        """
        Organism can reproduce if alive and energy >= reproduction_threshold.
        """
        if not self.is_alive:
            return False
        thresh = self.genome.traits["reproduction_threshold"]
        return self.energy >= thresh

    def die(self, cause: str = "starvation") -> None:
        """
        Logs cause of death and flags organism as deceased.
        """
        if self.is_alive:
            self.is_alive = False
            self.energy = 0.0
            self.cause_of_death = cause
            self.current_action = "DEAD"

    def to_state(self) -> OrganismState:
        return OrganismState(
            id=self.id,
            parent_id=self.parent_id,
            second_parent_id=self.second_parent_id,
            generation=self.generation,
            birth_time=self.birth_time,
            age=self.age,
            x=self.x,
            y=self.y,
            vx=self.vx,
            vy=self.vy,
            energy=self.energy,
            health=self.health,
            genome=self.genome.traits.copy(),
            current_action=self.current_action,
            cause_of_death=self.cause_of_death,
        )
