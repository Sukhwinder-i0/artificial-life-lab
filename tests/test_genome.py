import pytest
import numpy as np
from simulation.core.genome import Genome, GENOME_TRAIT_DEFAULTS


def test_genome_trait_bounds_clamping():
    # Attempt setting speed beyond max bound 5.0
    g = Genome(traits={"speed": 10.0, "vision_range": -5.0})

    assert g.traits["speed"] == 5.0  # Clamped to max bound 5.0
    assert g.traits["vision_range"] == 1.0  # Clamped to min bound 1.0


def test_gaussian_point_mutation_and_deltas():
    rng = np.random.default_rng(12345)
    g = Genome()
    initial_speed = g.traits["speed"]

    # Force 100% mutation probability on point mutation
    deltas = g.mutate(rng, mutation_probability=1.0, mutation_std=0.1)

    assert "speed" in deltas
    assert g.traits["speed"] != initial_speed
    assert pytest.approx(g.traits["speed"] - initial_speed, abs=1e-5) == deltas["speed"]


def test_sexual_recombination_crossover():
    rng = np.random.default_rng(999)
    parent_a = Genome(traits={"speed": 1.0, "vision_range": 10.0})
    parent_b = Genome(traits={"speed": 4.0, "vision_range": 40.0})

    child = Genome.crossover(parent_a, parent_b, rng)

    assert child.traits["speed"] in (1.0, 4.0)
    assert child.traits["vision_range"] in (10.0, 40.0)
