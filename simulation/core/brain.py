from typing import Dict, Tuple, Optional
import numpy as np

INPUT_DIM = 16
HIDDEN_DIM = 16
OUTPUT_DIM = 7


class MLPBrain:
    """
    Heritable Multi-Layer Perceptron (MLP) Neural Network Policy.
    Maps 16-dimensional sensory inputs to 7 continuous action channels.
    """

    def __init__(
        self,
        W1: Optional[np.ndarray] = None,
        b1: Optional[np.ndarray] = None,
        W2: Optional[np.ndarray] = None,
        b2: Optional[np.ndarray] = None,
        rng: Optional[np.random.Generator] = None,
    ):
        if rng is None:
            rng = np.random.default_rng()

        # Xavier / Glorot Initialization
        if W1 is not None:
            self.W1 = W1.copy()
        else:
            self.W1 = rng.normal(0, np.sqrt(2.0 / (INPUT_DIM + HIDDEN_DIM)), size=(INPUT_DIM, HIDDEN_DIM))

        if b1 is not None:
            self.b1 = b1.copy()
        else:
            self.b1 = np.zeros(HIDDEN_DIM, dtype=np.float64)

        if W2 is not None:
            self.W2 = W2.copy()
        else:
            self.W2 = rng.normal(0, np.sqrt(2.0 / (HIDDEN_DIM + OUTPUT_DIM)), size=(HIDDEN_DIM, OUTPUT_DIM))

        if b2 is not None:
            self.b2 = b2.copy()
        else:
            self.b2 = np.zeros(OUTPUT_DIM, dtype=np.float64)

        # Saved last forward pass activations for visualization
        self.last_inputs: np.ndarray = np.zeros(INPUT_DIM, dtype=np.float64)
        self.last_hidden: np.ndarray = np.zeros(HIDDEN_DIM, dtype=np.float64)
        self.last_outputs: np.ndarray = np.zeros(OUTPUT_DIM, dtype=np.float64)

    def forward(self, inputs: np.ndarray) -> np.ndarray:
        """
        Executes forward pass: Input (16) -> Hidden (16, Tanh) -> Output (7, Tanh/Sigmoid).
        Returns 7-dim action vector.
        """
        self.last_inputs = inputs.copy()

        # Hidden layer
        h_pre = np.dot(inputs, self.W1) + self.b1
        self.last_hidden = np.tanh(h_pre)

        # Output layer
        o_pre = np.dot(self.last_hidden, self.W2) + self.b2

        # Movement outputs [-1, 1] via Tanh
        out = np.zeros(OUTPUT_DIM, dtype=np.float64)
        out[0] = np.tanh(o_pre[0])  # move_x
        out[1] = np.tanh(o_pre[1])  # move_y

        # Discrete action probabilities [0, 1] via Sigmoid
        out[2:] = 1.0 / (1.0 + np.exp(-np.clip(o_pre[2:], -10.0, 10.0)))

        self.last_outputs = out.copy()
        return out

    def mutate(
        self,
        rng: np.random.Generator,
        mutation_probability: float = 0.05,
        mutation_std: float = 0.1,
    ) -> int:
        """
        Applies explicit Gaussian perturbation to neural weights and biases.
        Returns number of mutated weight parameters.
        """
        mutated_count = 0

        # Mutate W1
        mask_w1 = rng.random(size=self.W1.shape) < mutation_probability
        delta_w1 = rng.normal(0, mutation_std, size=self.W1.shape) * mask_w1
        self.W1 += delta_w1
        mutated_count += int(np.sum(mask_w1))

        # Mutate b1
        mask_b1 = rng.random(size=self.b1.shape) < mutation_probability
        self.b1 += rng.normal(0, mutation_std, size=self.b1.shape) * mask_b1

        # Mutate W2
        mask_w2 = rng.random(size=self.W2.shape) < mutation_probability
        delta_w2 = rng.normal(0, mutation_std, size=self.W2.shape) * mask_w2
        self.W2 += delta_w2
        mutated_count += int(np.sum(mask_w2))

        # Mutate b2
        mask_b2 = rng.random(size=self.b2.shape) < mutation_probability
        self.b2 += rng.normal(0, mutation_std, size=self.b2.shape) * mask_b2

        return mutated_count

    def copy(self) -> "MLPBrain":
        return MLPBrain(W1=self.W1, b1=self.b1, W2=self.W2, b2=self.b2)

    def get_parameter_count(self) -> int:
        return int(self.W1.size + self.b1.size + self.W2.size + self.b2.size)

    def compute_brain_cost(self, alpha_brain: float = 0.001) -> float:
        """
        Calculates energetic metabolic cost of active neural computation.
        """
        return float(alpha_brain * self.get_parameter_count())
