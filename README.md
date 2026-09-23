# ARTIFICIAL LIFE LAB

> **A Production-Quality Computational Artificial-Life Laboratory for Studying Evolution, Emergent Social Behavior, and Population Dynamics**

---

## Overview

**ARTIFICIAL LIFE LAB** is an open scientific research platform for computational artificial-life experiments. It provides a discrete-time, agent-based simulation kernel coupled with neural organism policy evolution, multi-resource ecological kinetics, voluntary pro-social energy transfers, ungrounded communication signaling, and non-parametric statistical hypothesis testing.

Unlike educational simulations or games, **ARTIFICIAL LIFE LAB** prioritizes **scientific transparency and mathematical rigor**:
- Every simulation step follows an explicit **13-stage deterministic pipeline**.
- 100% reproducible execution driven by explicit `numpy.random.Generator` seeds.
- Includes a **Scientific Validation Suite** verifying 5 analytical benchmark models (Logistic carrying capacity, Lotka-Volterra predator-prey oscillations, Prisoner's Dilemma pay-off dynamics, Energy conservation invariants, and Neutral genetic drift).
- Automated **Publication-Ready Research Report Exporter** generating Markdown, HTML, and JSON data payloads with Bootstrap 95% Confidence Intervals and Mutual Information statistics.

---

## Key Features

### 1. Neural Organism Architecture & Perception
- **MLP Brain Policy**: 16 continuous sensory inputs $\to$ 16 hidden layer $\to$ 7 motor action outputs.
- **Sensory Processing**: Conspecific vision, resource gradients, obstacle detection, health/energy state, signal perception tokens, and social proximity.
- **Genome Mechanics**: Mutation probabilities, standard deviations, metabolic costs, speed, size, and vision range inheritance.

### 2. Ecological Dynamics & Spatial Indexing
- **Logistic Resource Dynamics**: Multi-resource growth with carrying capacity $K$ constraints:
  $$\frac{dR}{dt} = r R \left(1 - \frac{R}{K}\right)$$
- **Spatial Hashing Grid**: $O(N)$ spatial indexing for fast collision detection, vision radius queries, and energy transfer targeting.
- **Predation & Combat**: Size-based predation mechanics and competitive interactions.

### 3. Emergent Sociality & Communication
- **Pro-Social Energy Sharing**: Voluntary energy transfer ($E_j' = E_j + \eta_{transfer} C_{share}$) with tracking of pairwise interaction history $H_{ij}$.
- **Discrete Signal Emissions**: Ungrounded token emissions $M_i \in \{0, 1, 2, 3\}$ allowing emergence of signaling semantics without pre-programmed rules.

### 4. Scientific Analysis Suite & Statistics
- **Non-Parametric Bootstrap CIs**: Percentile bootstrap ($B = 2000$) estimating $95\%$ confidence bounds without assuming normal distribution.
- **Effect Size Metrics**: Cohen's $d = \frac{\mu_1 - \mu_2}{s_{pooled}}$ and Mann-Whitney U non-parametric tests.
- **Information Theory**: Emitted signal Shannon Entropy $H(M)$ and Mutual Information $I(M; Y)$ measuring statistical association between signals $M$ and environmental state/action $Y$.
- **Ablation Studies**: Automated comparative analysis (`Full Model` vs `No Comm` vs `No Coop` vs `No Spatial Structure`).

### 5. Automated Research Report Generator
- One-click compilation of Markdown (`.md`), HTML (`.html`), and structured JSON datasets (`.json`) embedding statistical hypothesis tests, parameter configurations, trait centroid breakdowns, and reproducibility metadata.

### 6. Interactive Web UI Platform
- Modern **Next.js 16 (Turbopack)** application with 8 real-time views:
  - **Simulation Canvas**: HTML5 Canvas with zoom/pan, vision radii, energy glow effects, and signal emission rings.
  - **Overview Dashboard**: High-level telemetry, live population graphs, and energy invariants.
  - **Brain Inspector**: Neural weight heatmaps and node activation visualizers.
  - **Speciation Visualizer**: Unsupervised Ward's hierarchical clustering morphometry radars and action entropy $H(A)$ profiles.
  - **Lineage Tree**: Interactive phylogenetic tree of organism lineage and ancestry.
  - **Experiment Builder**: Parameter sweep runner and batch replicate manager.
  - **Analysis Dashboard**: Bootstrap CIs, Cohen's $d$, Mutual Information, and Report Exporter modal.
  - **Settings**: Server API configuration.

---

## Scientific Documentation

Detailed technical documentation is available in the [`docs/`](docs/) directory:

- [**Scientific Model Specification**](docs/scientific-model.md): Detailed model assumptions, state variables, and discrete pipeline lifecycle.
- [**Equations & Mathematical Formulations**](docs/equations.md): Formal mathematical definitions for neural forward pass, energy mechanics, statistics, and information theory.
- [**Experiment Design & Methodology**](docs/experiment-design.md): Factorial parameter sweeps, random seed replication, and statistical hypothesis testing protocol.
- [**System Architecture**](docs/architecture.md): High-level system architecture, engine pipeline, and WebSocket data streams.
- [**Validation & Benchmark Suite**](docs/validation.md): Description of the 5 canonical benchmark validation models.
- [**Research Report Guide**](docs/RESEARCH_REPORT_GUIDE.md): Guide to generating, formatting, and interpreting automated scientific research reports.

---

## Repository Structure

```text
artificial-life-lab/
├── analysis/                     # Scientific Analysis Engine
│   ├── ablation.py               # Ablation study comparator & sensitivity analysis
│   ├── behavior.py               # Behavioral state-action entropy calculator
│   ├── clustering.py             # Unsupervised hierarchical speciation clustering
│   ├── information.py            # Shannon Entropy & Mutual Information I(M; Y)
│   ├── metrics.py                # Telemetry & emergence metric aggregators
│   ├── report_generator.py       # Automated Research Report Exporter
│   └── statistics.py             # Non-parametric Bootstrap CIs & Cohen's d
├── docs/                         # Scientific & Technical Documentation
├── experiments/                  # Experiment Engine & Storage Persistence
│   ├── runner.py                 # Factorial parameter sweep runner
│   └── schema.py                 # Experiment configuration schemas
├── frontend/                     # Next.js 16 Web Dashboard UI
│   ├── src/app/                  # App Router & page views
│   ├── src/components/           # UI components (Canvas, Speciation, Brain, etc.)
│   └── src/store/                # Zustand simulation state store
├── shared/                       # Shared Pydantic data schemas
├── simulation/                   # Core Simulation Kernel
│   ├── api/                      # FastAPI WebSocket & REST API server
│   └── core/                     # Core simulation models (world, engine, brain, etc.)
├── storage/                      # Columnar Parquet & CSV snapshot persistence
└── tests/                        # Automated Pytest suite & Benchmark validation suite
```

---

## Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+ & npm** (Tested on Next.js 16 / Node v20)

### 1. Backend Setup & Run API Server

```bash
# Clone repository
git clone https://github.com/your-org/artificial-life-lab.git
cd artificial-life-lab

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start FastAPI simulation server
python -m simulation.api.server
```
The server will run on `http://localhost:8000` with WebSocket endpoint at `ws://localhost:8000/ws/simulation`.

### 2. Frontend Setup & Run Development UI

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the laboratory.

### 3. Run Automated Tests & Benchmark Validation Suite

```bash
# Run complete Pytest test suite (including 5 analytical benchmark models)
.venv/bin/pytest -v tests/
```

---

## Verification & Test Results

The platform includes 33 unit and benchmark tests:
- **Benchmark 1**: Logistic Carrying Capacity Convergence ($0.8K \le N^* \le 1.2K$).
- **Benchmark 2**: Lotka-Volterra Predator-Prey Coupled Oscillations.
- **Benchmark 3**: Prisoner's Dilemma Evolutionary Pay-Off Dynamics.
- **Benchmark 4**: Closed-System Energy Conservation Invariant ($\sum E_{in} = \sum E_{out} + \Delta E$).
- **Benchmark 5**: Neutral Evolutionary Genetic Drift Linear Variance Growth.
- **Domain Unit Tests**: Neural forward pass, spatial hashing grid queries, pro-social sharing efficiency, bootstrap CIs, mutual information, report exporter format.

**Pass Rate**: **100% (33 / 33 passed cleanly)**.

---

## Citation & References

If you use **ARTIFICIAL LIFE LAB** in your research, please cite:

```bibtex
@article{artificial_life_lab_2026,
  title={Artificial Life Lab: A Scientifically Transparent Computational Ecosystem Engine for Evolutionary and Social Dynamics},
  author={Artificial Life Lab Research Team},
  year={2026},
  url={https://github.com/your-org/artificial-life-lab}
}
```

### Key Literature References
- Langton, C. G. (1989). *Artificial Life*. Addison-Wesley.
- Ray, T. S. (1991). An approach to the synthesis of life. *Artificial Life II*.
- Yaeger, L. (1994). Computational genetics, physiology, and behavior in PolyWorld. *Artificial Life IV*.
- Ofria, C., & Wilke, C. O. (2004). Avida: A software platform for research in computational evolutionary biology. *Artificial Life*, 10(2), 191-229.
