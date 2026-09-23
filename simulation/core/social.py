from typing import List, Tuple, Dict, Optional, TYPE_CHECKING
import numpy as np

if TYPE_CHECKING:
    from simulation.core.organism import Organism
    from simulation.core.spatial import SpatialGrid


class SocialEngine:
    """
    Engine for social energy sharing, discrete signal communication token emissions,
    interaction history tracking, and cooperation rate metrics.
    """

    def __init__(self, transfer_efficiency: float = 0.8, signal_cost: float = 0.1):
        self.transfer_efficiency = transfer_efficiency
        self.signal_cost = signal_cost

        # Pairwise interaction history: H_ij = total energy given from i to j
        self.interaction_history: Dict[Tuple[str, str], float] = {}
        self.total_sharing_actions = 0
        self.total_social_opportunities = 0

    def process_social_interactions(
        self,
        organisms: List["Organism"],
        spatial_grid: "SpatialGrid",
    ) -> Tuple[int, float]:
        """
        Executes voluntary energy sharing and discrete signal emission step.
        Returns (sharing_events_count, total_energy_shared).
        """
        sharing_events = 0
        total_energy_shared = 0.0

        for org in organisms:
            if not org.is_alive:
                continue

            # Check share output channel (index 4) from neural brain
            share_intent = org.brain.last_outputs[4] if hasattr(org, "brain") else 0.0
            comm_intent = org.brain.last_outputs[6] if hasattr(org, "brain") else 0.0

            # 1. Discrete Signal Token Emission
            if comm_intent > 0.5 and org.energy > self.signal_cost:
                org.energy -= self.signal_cost
                # Emit discrete token {0, 1, 2, 3} based on comm_intent
                signal_token = int(comm_intent * 4.0) % 4
                org.current_action = f"SIGNAL_{signal_token}"

            # 2. Voluntary Energy Sharing
            if share_intent > 0.5 and org.energy > 20.0:
                neighbors = spatial_grid.query_radius(org.x, org.y, radius=5.0)
                neighbors = [n for n in neighbors if n.id != org.id and n.is_alive]
                self.total_social_opportunities += len(neighbors)

                if neighbors:
                    # Select recipient with lowest energy (pro-social targeting)
                    recipient = min(neighbors, key=lambda n: n.energy)
                    if recipient.energy < recipient.max_energy * 0.8:
                        share_amount = min(10.0, (org.energy - 10.0) * 0.5)
                        if share_amount > 0.0:
                            org.energy -= share_amount
                            gained = share_amount * self.transfer_efficiency
                            recipient.energy = min(recipient.max_energy, recipient.energy + gained)

                            sharing_events += 1
                            total_energy_shared += share_amount
                            self.total_sharing_actions += 1

                            # Update interaction history H_{donor, recipient}
                            pair_key = (org.id, recipient.id)
                            self.interaction_history[pair_key] = (
                                self.interaction_history.get(pair_key, 0.0) + share_amount
                            )
                            org.current_action = "SHARE"

        return sharing_events, total_energy_shared

    def compute_cooperation_rate(self) -> float:
        """
        Computes formal cooperation rate = cooperative sharing actions / eligible social opportunities.
        """
        if self.total_social_opportunities == 0:
            return 0.0
        return float(self.total_sharing_actions / self.total_social_opportunities)
