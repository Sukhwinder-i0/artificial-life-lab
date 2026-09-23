import os
import json
from typing import Dict, List, Any, Optional
import pandas as pd


class StorageManager:
    """
    Persistence Manager storing experiment metadata in JSON files and
    high-frequency simulation telemetry in CSV/Parquet columnar data.
    """

    def __init__(self, base_dir: str = "storage"):
        self.base_dir = base_dir
        self.exp_dir = os.path.join(base_dir, "experiments")
        self.runs_dir = os.path.join(base_dir, "runs")

        os.makedirs(self.exp_dir, exist_ok=True)
        os.makedirs(self.runs_dir, exist_ok=True)

    def save_experiment_metadata(self, experiment_id: str, metadata: Dict[str, Any]) -> str:
        filepath = os.path.join(self.exp_dir, f"{experiment_id}.json")
        with open(filepath, "w") as f:
            json.dump(metadata, f, indent=2)
        return filepath

    def load_experiment_metadata(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        filepath = os.path.join(self.exp_dir, f"{experiment_id}.json")
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r") as f:
            return json.load(f)

    def save_run_telemetry(self, run_id: str, telemetry_frames: List[Dict[str, Any]]) -> str:
        """
        Saves run telemetry frames to columnar CSV format.
        """
        filepath = os.path.join(self.runs_dir, f"{run_id}.csv")
        rows = []
        for frame in telemetry_frames:
            row = {
                "step": frame.get("step", 0),
                "time": frame.get("time", 0.0),
                "population_count": frame.get("population_count", 0),
                "births": frame.get("births_this_step", 0),
                "deaths": frame.get("deaths_this_step", 0),
            }
            metrics = frame.get("metrics", {})
            for k, v in metrics.items():
                row[f"metric_{k}"] = v
            rows.append(row)

        df = pd.DataFrame(rows)
        df.to_csv(filepath, index=False)
        return filepath

    def load_run_telemetry(self, run_id: str) -> Optional[pd.DataFrame]:
        filepath = os.path.join(self.runs_dir, f"{run_id}.csv")
        if not os.path.exists(filepath):
            return None
        return pd.read_csv(filepath)
