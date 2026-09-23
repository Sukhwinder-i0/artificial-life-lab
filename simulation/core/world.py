from typing import Tuple, Literal
import numpy as np


class World:
    """
    Continuous 2D spatial environment containing scalar fields:
    - FoodField: Consumable metabolic nutrient grid
    - WaterField: Hydration resource grid
    - TemperatureField: Thermal environment map
    - HazardField: Environmental stress/hazard map
    """

    def __init__(
        self,
        width: float = 200.0,
        height: float = 200.0,
        boundary_condition: Literal["toroidal", "bounded"] = "toroidal",
        grid_resolution: float = 1.0,
        base_temperature: float = 20.0,
    ):
        self.width = width
        self.height = height
        self.boundary_condition = boundary_condition
        self.resolution = grid_resolution

        self.cols = max(1, int(width / grid_resolution))
        self.rows = max(1, int(height / grid_resolution))

        # Initialize scalar fields as 2D NumPy arrays
        self.food_field = np.zeros((self.rows, self.cols), dtype=np.float64)
        self.carrying_capacity_field = np.full((self.rows, self.cols), 100.0, dtype=np.float64)
        self.water_field = np.ones((self.rows, self.cols), dtype=np.float64) * 50.0
        self.temperature_field = np.full((self.rows, self.cols), base_temperature, dtype=np.float64)
        self.hazard_field = np.zeros((self.rows, self.cols), dtype=np.float64)

    def wrap_coordinates(self, x: float, y: float) -> Tuple[float, float]:
        """
        Applies boundary conditions to continuous coordinates (x, y).
        """
        if self.boundary_condition == "toroidal":
            x_wrapped = x % self.width
            y_wrapped = y % self.height
            return x_wrapped, y_wrapped
        else:
            # Bounded: Clamp strictly inside world bounds
            x_bounded = max(0.0, min(self.width, x))
            y_bounded = max(0.0, min(self.height, y))
            return x_bounded, y_bounded

    def pos_to_grid(self, x: float, y: float) -> Tuple[int, int]:
        """
        Maps continuous spatial coordinate (x, y) to discrete field grid index (r, c).
        """
        x_w, y_w = self.wrap_coordinates(x, y)
        c = max(0, min(self.cols - 1, int(x_w / self.resolution)))
        r = max(0, min(self.rows - 1, int(y_w / self.resolution)))
        return r, c

    def get_food(self, x: float, y: float) -> float:
        r, c = self.pos_to_grid(x, y)
        return float(self.food_field[r, c])

    def consume_food(self, x: float, y: float, amount: float) -> float:
        r, c = self.pos_to_grid(x, y)
        available = self.food_field[r, c]
        taken = min(available, amount)
        self.food_field[r, c] -= taken
        return float(taken)

    def get_temperature(self, x: float, y: float) -> float:
        r, c = self.pos_to_grid(x, y)
        return float(self.temperature_field[r, c])

    def get_hazard(self, x: float, y: float) -> float:
        r, c = self.pos_to_grid(x, y)
        return float(self.hazard_field[r, c])
