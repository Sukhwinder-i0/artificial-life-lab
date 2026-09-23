import pytest
import numpy as np
from simulation.core.organism import Organism
from simulation.core.genome import Genome
from simulation.core.spatial import SpatialGrid
from simulation.core.ecology import EcologyEngine


def test_spatial_grid_radius_query():
    grid = SpatialGrid(width=200.0, height=200.0, cell_size=20.0)

    org1 = Organism(x=50.0, y=50.0, organism_id="org-1")
    org2 = Organism(x=55.0, y=55.0, organism_id="org-2")
    org3 = Organism(x=150.0, y=150.0, organism_id="org-3")

    grid.insert(org1)
    grid.insert(org2)
    grid.insert(org3)

    nearby = grid.query_radius(50.0, 50.0, radius=15.0)
    nearby_ids = [o.id for o in nearby]

    assert "org-1" in nearby_ids
    assert "org-2" in nearby_ids
    assert "org-3" not in nearby_ids


def test_predation_combat_and_energy_transfer():
    rng = np.random.default_rng(777)
    grid = SpatialGrid(width=200.0, height=200.0, cell_size=20.0)

    attacker = Organism(
        x=50.0,
        y=50.0,
        genome=Genome(traits={"attack_strength": 15.0}),
        initial_energy=40.0,
        organism_id="attacker",
    )
    prey = Organism(
        x=51.0,
        y=51.0,
        genome=Genome(traits={"defense_strength": 0.0}),
        initial_energy=30.0,
        organism_id="prey",
    )
    prey.health = 5.0  # Vulnerable health

    # Force attacker brain output attack channel to 1.0
    attacker.brain.last_outputs = np.array([0, 0, 0, 1.0, 0, 0, 0], dtype=np.float64)

    grid.insert(attacker)
    grid.insert(prey)

    kills, damage = EcologyEngine.process_combat_and_predation([attacker, prey], grid, rng)

    assert kills == 1
    assert damage >= 5.0
    assert not prey.is_alive
    assert prey.cause_of_death == "predation"
    assert attacker.energy > 40.0  # Consumed meat energy
