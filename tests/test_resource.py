import pytest
import numpy as np
from simulation.core.world import World
from simulation.core.resource import ResourceEngine


def test_logistic_resource_regeneration():
    world = World(width=10.0, height=10.0, grid_resolution=1.0)
    engine = ResourceEngine(
        world=world,
        regeneration_rate=0.1,
        carrying_capacity=100.0,
        distribution_mode="uniform",
        seed=42,
    )

    # Set initial resource to 50.0
    world.food_field.fill(50.0)

    # Step regeneration once
    # Expected logistic delta = 0.1 * 50 * (1 - 50 / 100) = 2.5
    engine.step(timestep=1)

    expected_val = 52.5
    assert pytest.approx(world.food_field[0, 0], abs=1e-4) == expected_val


def test_resource_carrying_capacity_clamping():
    world = World(width=10.0, height=10.0, grid_resolution=1.0)
    engine = ResourceEngine(
        world=world,
        regeneration_rate=0.5,
        carrying_capacity=100.0,
        distribution_mode="uniform",
        seed=42,
    )

    # Set initial resource equal to carrying capacity K = 100.0
    world.food_field.fill(100.0)

    # Step regeneration
    engine.step(timestep=1)

    # Value should not exceed carrying capacity K
    assert world.food_field[0, 0] <= 100.0
    assert pytest.approx(world.food_field[0, 0]) == 100.0
