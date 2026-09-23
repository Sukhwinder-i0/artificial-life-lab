import pytest
import numpy as np
from simulation.core.organism import Organism
from simulation.core.spatial import SpatialGrid
from simulation.core.social import SocialEngine


def test_social_energy_sharing_transfer():
    grid = SpatialGrid(width=200.0, height=200.0, cell_size=20.0)
    social_engine = SocialEngine(transfer_efficiency=0.8, signal_cost=0.1)

    donor = Organism(x=50.0, y=50.0, initial_energy=80.0, organism_id="donor")
    recipient = Organism(x=51.0, y=51.0, initial_energy=20.0, organism_id="recipient")

    # Force donor brain output share channel (index 4) to 1.0
    donor.brain.last_outputs = np.array([0, 0, 0, 0, 1.0, 0, 0], dtype=np.float64)

    grid.insert(donor)
    grid.insert(recipient)

    events, energy_shared = social_engine.process_social_interactions([donor, recipient], grid)

    assert events == 1
    assert energy_shared == 10.0
    assert donor.energy == 70.0
    assert recipient.energy == 28.0  # 20.0 + (10.0 * 0.8)


def test_cooperation_rate_calculation():
    social_engine = SocialEngine()
    social_engine.total_sharing_actions = 15
    social_engine.total_social_opportunities = 50

    rate = social_engine.compute_cooperation_rate()
    assert pytest.approx(rate) == 0.30
