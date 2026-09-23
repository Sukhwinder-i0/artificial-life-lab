from typing import List, Dict, Tuple, TYPE_CHECKING
import math

if TYPE_CHECKING:
    from simulation.core.organism import Organism


class SpatialGrid:
    """
    Spatial Hashing Grid partition for O(N) spatial neighbor queries,
    vision radius checks, and collision/combat detection.
    """

    def __init__(self, width: float = 200.0, height: float = 200.0, cell_size: float = 20.0):
        self.width = width
        self.height = height
        self.cell_size = cell_size
        self.cols = max(1, int(width / cell_size))
        self.rows = max(1, int(height / cell_size))

        self.cells: Dict[Tuple[int, int], List["Organism"]] = {}

    def clear(self) -> None:
        self.cells.clear()

    def _get_cell_key(self, x: float, y: float) -> Tuple[int, int]:
        c = max(0, min(self.cols - 1, int(x / self.cell_size)))
        r = max(0, min(self.rows - 1, int(y / self.cell_size)))
        return r, c

    def insert(self, org: "Organism") -> None:
        if not org.is_alive:
            return
        key = self._get_cell_key(org.x, org.y)
        if key not in self.cells:
            self.cells[key] = []
        self.cells[key].append(org)

    def query_radius(self, x: float, y: float, radius: float) -> List["Organism"]:
        """
        Returns all organisms within bounding box / radius around (x, y).
        """
        results: List["Organism"] = []
        min_r = max(0, int((y - radius) / self.cell_size))
        max_r = min(self.rows - 1, int((y + radius) / self.cell_size))
        min_c = max(0, int((x - radius) / self.cell_size))
        max_c = min(self.cols - 1, int((x + radius) / self.cell_size))

        for r in range(min_r, max_r + 1):
            for c in range(min_c, max_c + 1):
                cell_orgs = self.cells.get((r, c), [])
                for org in cell_orgs:
                    dist_sq = (org.x - x) ** 2 + (org.y - y) ** 2
                    if dist_sq <= radius ** 2:
                        results.append(org)

        return results
