# MODEL CARD: Artificial Life Lab Simulation Platform

## 1. System Purpose & Intent
**ARTIFICIAL LIFE LAB** is an open-source computational laboratory for studying emergent evolutionary phenomena, natural selection, adaptation, social interactions, and ecological population dynamics.

> [!IMPORTANT]
> **This system is NOT a game, a chatbot, or a black-box AI model.**
> It is an agent-based computational world grounded in explicit physical rules, discrete-time energy conservation, mathematical resource regeneration models, and heritable quantitative genetics.

---

## 2. Explicit Model Assumptions
1. **Discrete Timestep Execution**: Time advances in uniform discrete increments $\Delta t = 1.0$.
2. **2D Spatial Geometry**: Organism positions and movement vectors operate in a 2D Euclidean continuous/grid space.
3. **Metabolic Energy Currency**: Energy $E \ge 0$ is the fundamental conserved currency of organism survival, movement, action, and offspring production.
4. **Local Sensory Perception**: Organisms observe their local environment within a finite vision radius $r_{vis}$, without global knowledge of the full world state.
5. **No Biological Identity Claims**: Genomes, traits, and neural parameters represent abstract mathematical quantitative models inspired by evolutionary systems. They do not claim to mirror exact DNA sequences or real biological species.

---

## 3. Explicit Model Non-Claims & Boundaries
- **No Hard-coded Outcomes**: Organism behavior, cooperation rates, and speciation clusters are strictly emergent metrics. They are never programmed as explicit outcome rules.
- **No Automatic Biological Proof**: Simulation results demonstrate emergent behaviors within the specified artificial world parameters. They do not prove real-world evolutionary biology hypotheses without real-world empirical validation.

---

## 4. Parameter Meanings & Bounds Summary

| Parameter | Symbol | Scientific Meaning | Default | Bound Range |
| :--- | :--- | :--- | :--- | :--- |
| `world_width` | $W$ | Spatial width bound | 200.0 | $[50, 2000]$ |
| `world_height` | $H$ | Spatial height bound | 200.0 | $[50, 2000]$ |
| `resource_regeneration_rate` | $r$ | Logistic regeneration rate coefficient | 0.1 | $[0.01, 1.0]$ |
| `resource_carrying_capacity` | $K$ | Maximum local resource capacity | 100.0 | $[1.0, 1000.0]$ |
| `basal_metabolism` | $m_{basal}$ | Energy cost per step to remain alive | 0.1 | $[0.01, 5.0]$ |
| `mutation_probability` | $\mu$ | Per-gene point mutation probability | 0.01 | $[0.0, 0.5]$ |
| `mutation_std` | $\sigma$ | Standard deviation of Gaussian trait delta | 0.05 | $[0.001, 1.0]$ |
