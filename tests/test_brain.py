import pytest
import numpy as np
from simulation.core.brain import MLPBrain, INPUT_DIM, OUTPUT_DIM


def test_mlp_brain_forward_pass_bounds():
    rng = np.random.default_rng(42)
    brain = MLPBrain(rng=rng)

    inputs = rng.uniform(0.0, 1.0, size=INPUT_DIM)
    outputs = brain.forward(inputs)

    assert len(outputs) == OUTPUT_DIM
    # Movement outputs move_x, move_y in [-1.0, 1.0]
    assert -1.0 <= outputs[0] <= 1.0
    assert -1.0 <= outputs[1] <= 1.0

    # Action probabilities in [0.0, 1.0]
    for act_prob in outputs[2:]:
        assert 0.0 <= act_prob <= 1.0


def test_mlp_brain_mutation_and_copy():
    rng = np.random.default_rng(123)
    brain1 = MLPBrain(rng=rng)
    brain2 = brain1.copy()

    # Initial weights must match
    assert np.array_equal(brain1.W1, brain2.W1)

    # Mutate brain1
    mutated_count = brain1.mutate(rng, mutation_probability=1.0, mutation_std=0.2)
    assert mutated_count > 0
    assert not np.array_equal(brain1.W1, brain2.W1)
