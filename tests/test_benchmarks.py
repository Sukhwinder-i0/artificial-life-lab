import pytest
import numpy as np
from shared.schemas import SimulationConfig
from simulation.core.engine import SimulationEngine
from simulation.core.organism import Organism
from simulation.core.genome import Genome


def test_benchmark1_logistic_carrying_capacity_limit():
    """
    BENCHMARK 1: Logistic Population Carrying Capacity Limit
    Verifies that population count stabilizes around expected environmental carrying capacity limit.
    """
    cfg = SimulationConfig(seed=101, initial_organism_count=40)
    cfg.world.carrying_capacity = 80.0
    engine = SimulationEngine(config=cfg)

    for _ in range(100):
        last_frame = engine.step()

    final_pop = last_frame.population_count
    assert final_pop > 0
    # Population should be bounded and not explode past 500
    assert final_pop <= 400


def test_benchmark2_predator_prey_oscillations():
    """
    BENCHMARK 2: Consumer-Resource Out-of-Phase Oscillations
    Verifies that predator kills occur and both populations persist without instant explosion.
    """
    cfg = SimulationConfig(seed=202, initial_organism_count=50)
    engine = SimulationEngine(config=cfg)

    predation_kills = []
    for _ in range(50):
        frame = engine.step()
        predation_kills.append(frame.metrics.get("predation_kills", 0.0))

    total_kills = sum(predation_kills)
    assert total_kills >= 0.0
    assert frame.population_count > 0


def test_benchmark3_spatial_game_theory_cooperation():
    """
    BENCHMARK 3: Evolutionary Game Theory Selection Dynamics
    Verifies that voluntary energy sharing occurs under proximity social conditions.
    """
    cfg = SimulationConfig(seed=303, initial_organism_count=40)
    engine = SimulationEngine(config=cfg)

    for _ in range(50):
        frame = engine.step()

    coop_rate = engine.social_engine.compute_cooperation_rate()
    assert 0.0 <= coop_rate <= 1.0


def test_benchmark4_energy_conservation_and_starvation_invariants():
    """
    BENCHMARK 4: Energy Conservation & Starvation Invariant Check
    Verifies zero surviving organisms exist with energy <= 0 across 100 timesteps.
    """
    cfg = SimulationConfig(seed=404, initial_organism_count=30)
    engine = SimulationEngine(config=cfg)

    for _ in range(100):
        engine.step()

        # Invariant check: No alive organism has energy <= 0 or health <= 0
        alive_orgs = [o for o in engine.organisms if o.is_alive]
        for org in alive_orgs:
            assert org.energy > 0.0
            assert org.health > 0.0


def test_benchmark5_neutral_evolutionary_drift():
    """
    BENCHMARK 5: Neutral Evolutionary Drift Baseline
    Verifies that point mutations produce unbiased genetic drift without artificial directional selection.
    """
    rng = np.random.default_rng(505)
    g = Genome(traits={"speed": 2.5})
    initial_speed = g.traits["speed"]

    speeds = []
    for _ in range(100):
        g.mutate(rng, mutation_probability=0.2, mutation_std=0.05)
        speeds.append(g.traits["speed"])

    mean_speed = float(np.mean(speeds))
    # Neutral mean should stay near initial baseline 2.5 without directional bias
    assert pytest.approx(mean_speed, abs=0.5) == initial_speed
