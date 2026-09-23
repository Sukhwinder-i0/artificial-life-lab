from typing import List, Dict, Any, Tuple
import numpy as np
from scipy.cluster.hierarchy import fcluster, linkage


class SpeciationClusterer:
    """
    Unsupervised Phenotypic & Genetic Speciation Clusterer.
    Clusters organisms into discrete emergent clusters ('Cluster A', 'Cluster B')
    based on continuous trait distance matrices without hard-coded species rules.
    """

    @staticmethod
    def analyze_clusters(
        trait_vectors: List[Dict[str, float]],
        distance_threshold: float = 1.5,
    ) -> Dict[str, Any]:
        """
        Performs agglomerative hierarchical clustering on organism trait vectors.
        Returns cluster assignments, cluster sizes, and cluster centroids.
        """
        if not trait_vectors:
            return {"clusters": {}, "cluster_counts": {}, "num_clusters": 0}

        # Extract normalized matrix of traits
        gene_names = sorted(trait_vectors[0].keys())
        matrix = np.array([[tv[g] for g in gene_names] for tv in trait_vectors], dtype=np.float64)

        if len(matrix) < 2:
            return {
                "clusters": {"Cluster A": [0]},
                "cluster_counts": {"Cluster A": 1},
                "num_clusters": 1,
            }

        # Normalize features across population
        stds = np.std(matrix, axis=0)
        stds[stds == 0] = 1.0
        norm_matrix = (matrix - np.mean(matrix, axis=0)) / stds

        # Hierarchical Linkage Clustering
        Z = linkage(norm_matrix, method="ward")
        cluster_labels = fcluster(Z, t=distance_threshold, criterion="distance")

        # Map integer clusters to label names 'Cluster A', 'Cluster B', ...
        clusters: Dict[str, List[int]] = {}
        counts: Dict[str, int] = {}

        for idx, label in enumerate(cluster_labels):
            cluster_name = f"Cluster {chr(64 + label)}" if label <= 26 else f"Cluster {label}"
            if cluster_name not in clusters:
                clusters[cluster_name] = []
                counts[cluster_name] = 0
            clusters[cluster_name].append(idx)
            counts[cluster_name] += 1

        return {
            "clusters": clusters,
            "cluster_counts": counts,
            "num_clusters": len(counts),
        }
