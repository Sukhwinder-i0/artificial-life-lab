import pytest
import math
from analysis.information import InformationTheoryCalculator


def test_shannon_entropy_calculation():
    # Uniform distribution over 4 categories => H = ln(4) = 1.3863
    probs = [0.25, 0.25, 0.25, 0.25]
    h = InformationTheoryCalculator.shannon_entropy(probs)
    assert pytest.approx(h, abs=1e-3) == math.log(4)


def test_mutual_information_perfect_correlation():
    # Signals M and Environmental States Y perfectly correlated
    signals = [0, 0, 1, 1, 2, 2, 3, 3]
    env_states = [0, 0, 1, 1, 2, 2, 3, 3]

    mi = InformationTheoryCalculator.mutual_information(signals, env_states)
    # MI for 4 equiprobable states = log2(4) = 2.0 bits
    assert pytest.approx(mi, abs=1e-3) == 2.0
