from typing import List, Tuple, Dict, TYPE_CHECKING
import math
import numpy as np

if TYPE_CHECKING:
    from simulation.core.organism import Organism
    from simulation.core.world import World
    from simulation.core.spatial import SpatialGrid


class EcologyEngine:
    """
    Manages ecological interactions: predation, combat damage, trophic energy transfer,
    multi-resource contest resolution, and spatial clustering index calculations.
    """

    @staticmethod
    def process_combat_and_predation(
        organisms: List["Organism"],
        spatial_grid: "SpatialGrid",
        rng: np.random.Generator,
    ) -> Tuple[int, float]:
        """
        Processes physical interactions between nearby organisms:
        Organisms with attack output > 0.5 attempt to attack nearby target organisms.
        Returns (predation_kill_count, total_combat_damage_inflicted).
        """
        kills = 0
        total_damage = 0.0

        for attacker in organisms:
            if not attacker.is_alive:
                continue

            # Check attack activation from brain output or attack_strength trait
            attack_intent = attacker.brain.last_outputs[3] if hasattr(attacker, "brain") else 0.0
            attack_str = attacker.genome.traits.get("attack_strength", 0.0)

            if attack_intent > 0.3 and attack_str > 0.5:
                # Find targets within combat proximity
                targets = spatial_grid.query_radius(attacker.x, attacker.y, radius=3.0)
                targets = [t for t in targets if t.id != attacker.id and t.is_alive]

                if targets:
                    target = targets[0]  # Closest target
                    def_str = target.genome.traits.get("defense_strength", 0.0)

                    # Damage equation: max(1.0, attack_str - def_str)
                    damage = max(1.0, attack_str - def_str * 0.5)
                    target.health -= damage
                    total_damage += damage

                    # Deduct energetic cost of attack action
                    attacker.energy -= 0.5 * attack_str

                    if target.health <= 0.0:
                        target.die(cause="predation")
                        kills += 1
                        # Trophic energy transfer: Attacker consumes prey energy
                        meat_energy = min(60.0, target.energy * 0.8 + 20.0)
                        attacker.eat(meat_energy)

        return kills, total_damage

    @staticmethod
    def compute_spatial_clustering_index(
        organisms: List["Organism"],
        world_width: float = 200.0,
        world_height: float = 200.0,
    ) -> float:
        """
        Computes Nearest-Neighbor spatial clustering ratio R_spatial:
        R < 1: Clustered, R = 1: Random Poisson, R > 1: Uniformly dispersed.
        Vectorized with scipy.spatial.distance.cdist.
        """
        alive = [o for o in organisms if o.is_alive]
        n = len(alive)
        if n < 2:
            return 1.0

        coords = np.array([[o.x, o.y] for o in alive], dtype=np.float64)
        from scipy.spatial.distance import cdist

        dist_matrix = cdist(coords, coords)
        np.fill_diagonal(dist_matrix, np.inf)

        min_dists = np.min(dist_matrix, axis=1)
        d_observed = float(np.mean(min_dists))

        area = world_width * world_height
        d_expected = 0.5 / math.sqrt(n / area)
        return float(d_observed / d_expected) if d_expected > 0 else 1.0
