from typing import Literal
import numpy as np
from simulation.core.world import World


class ResourceEngine:
    """
    Manages resource regeneration kinematics and spatial distribution models.
    Implements discrete logistic growth: R_{t+1} = R_t + r * R_t * (1 - R_t / K)
    """

    def __init__(
        self,
        world: World,
        regeneration_rate: float = 0.1,
        carrying_capacity: float = 100.0,
        distribution_mode: Literal["uniform", "clustered", "patchy", "seasonal"] = "uniform",
        seed: int = 42,
    ):
        self.world = world
        self.r = regeneration_rate
        self.K_default = carrying_capacity
        self.distribution_mode = distribution_mode
        self.rng = np.random.default_rng(seed)

        self.initialize_field()

    def initialize_field(self) -> None:
        """
        Initializes carrying capacity and starting food amounts according to distribution mode.
        """
        rows, cols = self.world.rows, self.world.cols
        self.world.carrying_capacity_field.fill(self.K_default)

        if self.distribution_mode == "uniform":
            self.world.food_field.fill(self.K_default * 0.5)

        elif self.distribution_mode in ("clustered", "patchy"):
            # Create Gaussian resource hotspots
            self.world.food_field.fill(0.0)
            num_patches = 5 if self.distribution_mode == "clustered" else 12
            for _ in range(num_patches):
                cr = self.rng.integers(0, rows)
                cc = self.rng.integers(0, cols)
                sigma = self.rng.uniform(2.0, 6.0)

                R_grid, C_grid = np.ogrid[:rows, :cols]
                dist_sq = (R_grid - cr) ** 2 + (C_grid - cc) ** 2
                patch = self.K_default * np.exp(-dist_sq / (2 * sigma ** 2))
                self.world.food_field += patch

            np.clip(self.world.food_field, 0.0, self.K_default, out=self.world.food_field)

        elif self.distribution_mode == "seasonal":
            self.world.food_field.fill(self.K_default * 0.5)

    def step(self, timestep: int = 0) -> None:
        """
        Executes discrete-time logistic regeneration for food resources.
        """
        R = self.world.food_field
        K = self.world.carrying_capacity_field

        # Logistic growth delta: r * R * (1 - R / K)
        # Avoid divide-by-zero where K == 0
        K_safe = np.where(K > 0, K, 1.0)
        growth = self.r * R * (1.0 - (R / K_safe))

        R_next = R + growth
        # Clamp to [0, K]
        np.clip(R_next, 0.0, K, out=self.world.food_field)
