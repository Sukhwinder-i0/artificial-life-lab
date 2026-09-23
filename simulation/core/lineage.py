from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class LineageNode(BaseModel):
    id: str
    parent_id: Optional[str] = None
    second_parent_id: Optional[str] = None
    generation: int
    birth_time: int
    death_time: Optional[int] = None
    cause_of_death: Optional[str] = None
    offspring_ids: List[str] = []
    traits: Dict[str, float] = {}


class LineageTracker:
    """
    Maintains evolutionary parent-offspring graph lineage relationships,
    descent trees, and survival spans for A-Life organisms.
    """

    def __init__(self):
        self.nodes: Dict[str, LineageNode] = {}

    def register_birth(
        self,
        organism_id: str,
        parent_id: Optional[str],
        second_parent_id: Optional[str],
        generation: int,
        birth_time: int,
        traits: Dict[str, float],
    ) -> LineageNode:
        node = LineageNode(
            id=organism_id,
            parent_id=parent_id,
            second_parent_id=second_parent_id,
            generation=generation,
            birth_time=birth_time,
            offspring_ids=[],
            traits=traits.copy(),
        )
        self.nodes[organism_id] = node

        # Link parent offspring
        if parent_id and parent_id in self.nodes:
            self.nodes[parent_id].offspring_ids.append(organism_id)
        if second_parent_id and second_parent_id in self.nodes:
            self.nodes[second_parent_id].offspring_ids.append(organism_id)

        return node

    def register_death(self, organism_id: str, death_time: int, cause: str) -> None:
        if organism_id in self.nodes:
            node = self.nodes[organism_id]
            node.death_time = death_time
            node.cause_of_death = cause

    def get_ancestors(self, organism_id: str, max_depth: int = 10) -> List[str]:
        ancestors = []
        curr = organism_id
        depth = 0
        while curr and curr in self.nodes and depth < max_depth:
            node = self.nodes[curr]
            if node.parent_id:
                ancestors.append(node.parent_id)
                curr = node.parent_id
            else:
                break
            depth += 1
        return ancestors

    def get_descendants(self, organism_id: str, max_depth: int = 5) -> List[str]:
        descendants = []
        if organism_id not in self.nodes:
            return descendants

        queue = [(organism_id, 0)]
        while queue:
            curr_id, depth = queue.pop(0)
            if depth >= max_depth:
                continue
            if curr_id in self.nodes:
                for child_id in self.nodes[curr_id].offspring_ids:
                    descendants.append(child_id)
                    queue.append((child_id, depth + 1))
        return descendants

    def export_tree(self, max_nodes: int = 100) -> List[Dict[str, Any]]:
        """
        Exports recent lineage node data for frontend graph rendering.
        """
        recent_keys = list(self.nodes.keys())[-max_nodes:]
        return [self.nodes[k].model_dump() for kk in recent_keys if (k := kk) in self.nodes]
