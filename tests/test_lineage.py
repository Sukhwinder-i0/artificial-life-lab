import pytest
from simulation.core.lineage import LineageTracker


def test_lineage_tracker_birth_and_death():
    tracker = LineageTracker()

    # Register root ancestor
    tracker.register_birth(
        organism_id="org-000001",
        parent_id=None,
        second_parent_id=None,
        generation=0,
        birth_time=0,
        traits={"speed": 1.5},
    )

    # Register offspring
    tracker.register_birth(
        organism_id="org-000002",
        parent_id="org-000001",
        second_parent_id=None,
        generation=1,
        birth_time=10,
        traits={"speed": 1.7},
    )

    assert "org-000001" in tracker.nodes
    assert "org-000002" in tracker.nodes
    assert tracker.nodes["org-000001"].offspring_ids == ["org-000002"]

    # Register death
    tracker.register_death("org-000001", death_time=50, cause="age")
    assert tracker.nodes["org-000001"].death_time == 50
    assert tracker.nodes["org-000001"].cause_of_death == "age"


def test_lineage_ancestor_and_descendant_traversal():
    tracker = LineageTracker()

    tracker.register_birth("org-1", None, None, 0, 0, {})
    tracker.register_birth("org-2", "org-1", None, 1, 10, {})
    tracker.register_birth("org-3", "org-2", None, 2, 20, {})

    ancestors = tracker.get_ancestors("org-3")
    assert ancestors == ["org-2", "org-1"]

    descendants = tracker.get_descendants("org-1")
    assert "org-2" in descendants
    assert "org-3" in descendants
