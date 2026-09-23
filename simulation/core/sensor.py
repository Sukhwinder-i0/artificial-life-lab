from typing import List, Tuple, TYPE_CHECKING
import math
import numpy as np

if TYPE_CHECKING:
    from simulation.core.organism import Organism
    from simulation.core.world import World

SENSOR_VECTOR_DIM = 16


class SensorSystem:
    """
    Constructs a normalized 16-dimensional continuous sensory observation vector
    perceived by an organism from its local 2D environment.
    """

    @staticmethod
    def sense(
        org: "Organism",
        world: "World",
        conspecifics: List["Organism"],
        predators: List["Organism"],
    ) -> np.ndarray:
        vision_r = org.genome.traits.get("vision_range", 15.0)
        vec = np.zeros(SENSOR_VECTOR_DIM, dtype=np.float64)

        # 1-3: Food Sensing (Find nearest food in grid or gradient)
        food_dist, food_dx, food_dy = SensorSystem._sense_food(org, world, vision_r)
        vec[0] = food_dist
        vec[1] = food_dx
        vec[2] = food_dy

        # 4-6: Water Sensing
        water_dist, water_dx, water_dy = SensorSystem._sense_water(org, world, vision_r)
        vec[3] = water_dist
        vec[4] = water_dx
        vec[5] = water_dy

        # 7-9: Nearest Conspecific (Other organism) Sensing
        c_dist, c_dx, c_dy, density = SensorSystem._sense_organisms(org, conspecifics, vision_r)
        vec[6] = c_dist
        vec[7] = c_dx
        vec[8] = c_dy

        # 10-12: Nearest Predator / Threat Sensing
        p_dist, p_dx, p_dy, _ = SensorSystem._sense_organisms(org, predators, vision_r)
        vec[9] = p_dist
        vec[10] = p_dx
        vec[11] = p_dy

        # 13-16: Internal Physiological States & Density
        vec[12] = min(1.0, max(0.0, org.energy / org.max_energy))
        vec[13] = min(1.0, max(0.0, org.health / org.max_health))
        vec[14] = min(1.0, max(0.0, org.age / 500.0))
        vec[15] = min(1.0, density / 10.0)

        return vec

    @staticmethod
    def _sense_food(org: "Organism", world: "World", vision_r: float) -> Tuple[float, float, float]:
        best_val = world.get_food(org.x, org.y)
        best_dir = (0.0, 0.0)
        best_dist = 1.0

        for angle in np.linspace(0, 2 * np.pi, 8, endpoint=False):
            px = org.x + vision_r * 0.5 * np.cos(angle)
            py = org.y + vision_r * 0.5 * np.sin(angle)
            val = world.get_food(px, py)
            if val > best_val:
                best_val = val
                best_dir = (np.cos(angle), np.sin(angle))
                best_dist = 0.5

        if best_val > 0.0 and best_dir == (0.0, 0.0):
            best_dist = 0.0  # Currently standing on food

        return best_dist, best_dir[0], best_dir[1]

    @staticmethod
    def _sense_water(org: "Organism", world: "World", vision_r: float) -> Tuple[float, float, float]:
        r, c = world.pos_to_grid(org.x, org.y)
        w_val = float(world.water_field[r, c])
        norm_dist = 0.0 if w_val > 10.0 else 1.0
        return norm_dist, 0.0, 0.0

    @staticmethod
    def _sense_organisms(
        org: "Organism",
        others: List["Organism"],
        vision_r: float,
    ) -> Tuple[float, float, float, float]:
        min_dist = vision_r
        closest_dir = (0.0, 0.0)
        count = 0

        for other in others:
            if other.id == org.id or not other.is_alive:
                continue
            dx = other.x - org.x
            dy = other.y - org.y
            dist = math.hypot(dx, dy)

            if dist <= vision_r:
                count += 1
                if dist < min_dist:
                    min_dist = dist
                    if dist > 0.001:
                        closest_dir = (dx / dist, dy / dist)

        norm_dist = min(1.0, min_dist / vision_r)
        return norm_dist, closest_dir[0], closest_dir[1], float(count)
