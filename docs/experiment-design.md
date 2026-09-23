# Experiment Design Framework Specification - Artificial Life Lab

## 1. Experimental Methodology Standard
The **Artificial Life Lab** experiment engine treats every simulation batch as a formal, hypothesis-driven scientific trial.

### 1.1 Core Principles
1. **Explicit Hypotheses**: Every experiment must declare a research question and a testable falsifiable hypothesis prior to execution.
2. **Strict Controlled Variables**: All parameters outside the designated independent variables are kept identical across treatment and control arms.
3. **Replication & Determinism**: Experiments run across $N_{replicates} \ge 30$ independent random seeds. Seed sequences are saved in experiment metadata.
4. **No Post-hoc Data Fabrication**: All statistical tables, confidence intervals, and visualization points are computed directly from raw run artifacts.

---

## 2. Experiment Schema & Configuration

Every experiment specification is represented by a JSON/Pydantic schema:

```json
{
  "experiment_id": "EXP-RES-001",
  "name": "Resource Scarcity and Social Cooperation Evolution",
  "research_question": "Does severe environmental resource scarcity select for increased energy-sharing cooperation rate?",
  "hypothesis": "Lower resource carrying capacity increases selection pressure for altruistic energy sharing under proximity conditions.",
  "independent_variables": {
    "resource_carrying_capacity": [10.0, 25.0, 50.0, 75.0, 100.0]
  },
  "dependent_variables": [
    "cooperation_rate",
    "mean_fitness",
    "population_size",
    "survival_rate"
  ],
  "control_variables": {
    "world_width": 200,
    "world_height": 200,
    "mutation_rate": 0.01,
    "metabolic_rate": 0.1,
    "sharing_efficiency": 0.8
  },
  "replicates_per_condition": 50,
  "generations": 5000,
  "base_random_seed": 42000
}
```

---

## 3. Statistical Analysis Protocol

### 3.1 Metrics Estimation
- **Point Estimate**: Sample Mean $\bar{x}$ and Median $\tilde{x}$.
- **Uncertainty Bounds**: Non-parametric percentile Bootstrap 95% Confidence Interval ($B = 2000$ iterations).

### 3.2 Hypothesis Testing & Significance
- **Two-Group Comparison**:
  - Normality test (Shapiro-Wilk).
  - If normal: Welch's $t$-test (does not assume equal variance).
  - If non-normal: Mann-Whitney U test (rank-based non-parametric).
- **Multi-Group Comparison**:
  - One-way ANOVA or Kruskal-Wallis non-parametric ANOVA.

### 3.3 Multiple Testing Corrections
When performing pairwise comparisons across $k$ parameter conditions:
- **Bonferroni Adjustment**: Adjusted $\alpha' = \frac{\alpha}{m}$ where $m$ is total number of tests.
- **Benjamini-Hochberg False Discovery Rate (FDR)**: Rank $p$-values $p_{(1)} \le \dots \le p_{(m)}$ and find max $k$ such that $p_{(k)} \le \frac{k}{m} Q$.

### 3.4 Effect Size Calculation
- Report **Cohen's $d$** for parametric comparisons and **Rank-Biserial Correlation $r$** for non-parametric comparisons.

---

## 4. Standard Experiment Template Library

### Template 1: Resource Scarcity & Cooperation
- **Question**: How does resource abundance affect population survival and energy sharing cooperation?
- **Treatment Arm**: Vary carrying capacity $K \in \{10, 25, 50, 75, 100\}$.
- **Control Arm**: Social energy sharing disabled ($C_{share} = 0$).
- **Primary Metric**: `cooperation_rate`, `mean_lifespan`, `extinction_frequency`.

### Template 2: Resource Heterogeneity & Ecological Specialization
- **Question**: Under what spatial resource distribution patterns does dietary specialization emerge?
- **Treatment Arm**: Resource distribution modes $\in \{\text{Uniform}, \text{Patchy Clustered}, \text{Dynamic Seasonal}\}$.
- **Metrics**: Resource consumption entropy $H_{norm}$, trait variance $\sigma_{speed}^2$.

### Template 3: Costs and Evolution of Communication
- **Question**: Can costly signaling evolve when signals convey environmental state info?
- **Treatment Arm**: Signal cost $C_{signal} \in \{0.0, 0.05, 0.2, 0.5\}$.
- **Control Arm**: Random signal noise baseline.
- **Metrics**: Signal-environment Mutual Information $I(M; Y)$, receiver fitness gain.

### Template 4: Environmental Volatility & Trait Adaptation
- **Question**: How does environmental volatility affect mutation tolerance and evolutionary rate?
- **Treatment Arm**: Catastrophe frequency $P_{hazard} \in \{0.0, 0.001, 0.01, 0.05\}$.
- **Metrics**: Rate of trait adaptation $\frac{\Delta \mu}{\Delta t}$, genetic variance.

### Template 5: Population Density & Aggression
- **Question**: How does spatial population density influence combat and resource defense?
- **Treatment Arm**: Initial population capacity $N_0 \in \{100, 500, 2000\}$.
- **Metrics**: Combat event frequency, attack trait evolution $\alpha_{att}$, mortality cause distribution.

---

## 5. Control Experiment Standards
Every major experiment must incorporate explicit control conditions:
1. **Null Control**: Systems with specific mechanisms disabled (e.g. `sharing_enabled = False`, `communication_enabled = False`).
2. **Neutral Evolution Control**: Mutations occur without selective pressure (unlimited energy, zero mortality) to verify genetic drift baseline.
3. **Randomized Placebo Control**: Communication signals replaced with uniform random noise tokens.
