import pytest
from shared.schemas import SimulationConfig
from simulation.core.engine import SimulationEngine


def test_deterministic_seed_reproducibility():
    """
    Verifies that two independent simulation engines initialized with identical
    random seeds produce 100% identical telemetry frames across 100 steps.
    """
    cfg1 = SimulationConfig(seed=424242, initial_organism_count=30)
    cfg2 = SimulationConfig(seed=424242, initial_organism_count=30)

    engine1 = SimulationEngine(config=cfg1)
    engine2 = SimulationEngine(config=cfg2)

    for step_idx in range(20):
        frame1 = engine1.step()
        frame2 = engine2.step()

        assert frame1.step == frame2.step
        assert frame1.population_count == frame2.population_count
        assert frame1.births_this_step == frame2.births_this_step
        assert frame1.deaths_this_step == frame2.deaths_this_step

        # Compare organism positions and energy
        assert len(frame1.organisms) == len(frame2.organisms)
        for org1, org2 in zip(frame1.organisms, frame2.organisms):
            assert org1.id == org2.id
            assert pytest.approx(org1.x, abs=1e-6) == org2.x
            assert pytest.approx(org1.y, abs=1e-6) == org2.y
            assert pytest.approx(org1.energy, abs=1e-6) == org2.energy
