# High-Level Architecture Specification - Artificial Life Lab

## 1. System Overview
The **Artificial Life Lab** is designed as a high-performance, modular computational monorepo. It strictly separates scientific simulation runtime, experiment administration, data analysis, persistence, and interactive visualization.

```
                  +-----------------------------------+
                  |      Frontend (Next.js / React)   |
                  |  Canvas 2D | Recharts | Zustand   |
                  +-----------------+-----------------+
                                    |
                            WebSocket / REST
                                    v
                  +-----------------------------------+
                  |    API & Server Layer (FastAPI)   |
                  +-----------------+-----------------+
                                    |
                 +------------------+------------------+
                 |                                     |
                 v                                     v
  +-----------------------------+       +-----------------------------+
  |  Simulation Kernel (Python) |       |   Experiment & Analysis     |
  | NumPy | Engine | Organisms  |       | Metrics | Stats | Schemas   |
  +--------------+--------------+       +--------------+--------------+
                 |                                     |
                 +------------------+------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |  Storage Layer (Parquet / JSON)   |
                  +-----------------------------------+
```

---

## 2. Directory Layout & Module Responsibilities

```
artificial-life-lab/
├── docs/                      # Comprehensive scientific & system documentation
│   ├── scientific-model.md
│   ├── equations.md
│   ├── experiment-design.md
│   ├── architecture.md
│   └── validation.md
├── MODEL_CARD.md              # Model assumptions, boundaries, and non-claims
├── REFERENCES.md              # Academic bibliography
├── shared/                    # Shared Pydantic data schemas & constants
│   ├── __init__.py
│   └── schemas.py
├── simulation/                # Core discrete-time scientific simulation engine
│   ├── __init__.py
│   ├── core/                  # World, resources, organisms, genetics, engine
│   │   ├── world.py
│   │   ├── resource.py
│   │   ├── organism.py
│   │   ├── genome.py
│   │   └── engine.py
│   └── api/                   # FastAPI server & WebSocket handlers
│       ├── __init__.py
│       └── server.py
├── experiments/               # Experiment design, parameter sweep & batch runners
│   ├── __init__.py
│   ├── schema.py
│   └── runner.py
├── analysis/                  # Statistical calculators, bootstrap, entropy, MI
│   ├── __init__.py
│   └── metrics.py
├── storage/                   # File persistence manager (Parquet / JSON runs)
│   ├── __init__.py
│   └── persistence.py
├── tests/                     # Unit, integration, property & reproducibility tests
│   ├── test_world.py
│   ├── test_resource.py
│   ├── test_organism.py
│   ├── test_genome.py
│   └── test_reproducibility.py
└── frontend/                  # Next.js scientific laboratory user interface
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   ├── components/        # Canvas 2D, charts, panels, inspector
    │   └── store/             # Zustand client state store
    ├── public/
    ├── package.json
    └── tailwind.config.js
```

---

## 3. Communication Protocols

### 3.1 REST API Endpoints
- `GET /api/health`: Health status & system environment metadata.
- `GET /api/simulation/config`: Default parameters and bounds.
- `POST /api/simulation/start`: Instantiate a new simulation run with given configuration and seed.
- `POST /api/simulation/step`: Advance simulation by $N$ steps synchronously.
- `POST /api/simulation/pause`: Pause active background simulation run.

### 3.2 WebSocket Streaming Protocol
Endpoint: `/ws/simulation`

Server payload stream frame (JSON at 10-60 Hz configurable rate):
```json
{
  "step": 1420,
  "time": 14.2,
  "population_count": 342,
  "metrics": {
    "avg_energy": 45.2,
    "avg_speed": 1.42,
    "avg_vision": 12.4,
    "cooperation_rate": 0.18
  },
  "organisms": [
    {
      "id": "org-1042",
      "x": 124.5,
      "y": 82.1,
      "energy": 52.4,
      "generation": 4,
      "color": "#3b82f6"
    }
  ],
  "resource_grid_summary": {
    "total_resources": 14500.0,
    "grid_dim": [50, 50]
  }
}
```

---

## 4. Performance & Scalability Design
1. **Vectorized Operations**: NumPy arrays represent grid environmental fields and bulk distance computations.
2. **Decoupled Engine & API**: Simulation runs on a dedicated event thread; WebSockets stream state snapshots non-blockingly without throttling the core step calculation.
3. **Data Tiering**: High-frequency frame rendering remains in-memory; summary metrics logged every $N=10$ steps are persisted to Parquet/JSON disk storage.
4. **Isolated Kernel Boundary**: The `simulation/core/` engine exposes strict functional inputs/outputs. If C++/Rust acceleration is needed in Phase 10, the kernel can be replaced seamlessly behind Python C-extensions without altering frontend or analysis components.
