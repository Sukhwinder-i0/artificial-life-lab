import pytest
from simulation.core.organism import Organism
from simulation.core.genome import Genome


def test_organism_metabolism_and_movement():
    genome = Genome(traits={"speed": 5.0})
    org = Organism(x=10.0, y=10.0, genome=genome, initial_energy=50.0)

    # Move organism by 3.0 units in x direction
    dist = org.move(dx=3.0, dy=0.0)
    assert dist == 3.0
    assert org.x == 13.0

    # Consume metabolism
    cost = org.consume_metabolism(dist)
    # Basal metabolism = 0.1, movement cost = 0.05 * 3 = 0.15 => total = 0.25
    assert pytest.approx(cost, abs=1e-4) == 0.25
    assert pytest.approx(org.energy, abs=1e-4) == 49.75


def test_starvation_and_death():
    org = Organism(x=10.0, y=10.0, initial_energy=0.1)

    # Consume metabolism exceeding energy
    org.consume_metabolism(distance_moved=5.0)

    assert not org.is_alive
    assert org.energy == 0.0
    assert org.cause_of_death == "starvation"
    assert org.current_action == "DEAD"


def test_reproduction_threshold_check():
    genome = Genome(traits={"reproduction_threshold": 60.0})
    org = Organism(x=10.0, y=10.0, genome=genome, initial_energy=50.0)

    assert not org.can_reproduce()

    org.energy = 75.0
    assert org.can_reproduce()
