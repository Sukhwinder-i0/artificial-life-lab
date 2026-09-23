import pytest
from simulation.core.world import World


def test_toroidal_boundary_wrapping():
    world = World(width=200.0, height=200.0, boundary_condition="toroidal")

    # Test coordinate overflow
    x_wrap, y_wrap = world.wrap_coordinates(210.0, -10.0)
    assert pytest.approx(x_wrap) == 10.0
    assert pytest.approx(y_wrap) == 190.0


def test_bounded_boundary_limits():
    world = World(width=200.0, height=200.0, boundary_condition="bounded")

    # Test clamping
    x_bound, y_bound = world.wrap_coordinates(250.0, -50.0)
    assert x_bound == 200.0
    assert y_bound == 0.0


def test_grid_mapping_and_consumption():
    world = World(width=100.0, height=100.0, grid_resolution=1.0)
    world.food_field[5, 5] = 50.0

    r, c = world.pos_to_grid(5.2, 5.8)
    assert r == 5 and c == 5

    consumed = world.consume_food(5.2, 5.8, amount=20.0)
    assert consumed == 20.0
    assert pytest.approx(world.food_field[5, 5]) == 30.0
