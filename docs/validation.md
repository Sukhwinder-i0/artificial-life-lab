# Scientific Validation & Benchmark Protocol - Artificial Life Lab

## 1. Overview
Before conducting complex evolutionary experiments, the **Artificial Life Lab** simulation engine must pass five mandatory scientific benchmark validations. These benchmarks verify underlying physics, ecological dynamics, numerical stability, and genetic neutrality.

---

## 2. Benchmark Validation Suite

### Benchmark 1: Exponential & Logistic Population Growth
- **Objective**: Verify that population growth matches mathematical predictions in unconstrained vs resource-constrained environments.
- **Expected Outcome**:
  - Unlimited resources ($K \to \infty$): Exponential growth $N_t = N_0 e^{rt}$.
  - Fixed resources ($K = 1000$): Logistic sigmoidal curve stabilizing around carrying capacity $K_{pop}$.
- **Pass Criterion**: Empirical asymptote within $\pm 5\%$ of theoretical carrying capacity limit over 1000 steps.

### Benchmark 2: Predator-Prey Qualitative Dynamics
- **Objective**: Verify phase-space oscillations in two-species consumer-resource configurations.
- **Setup**: Prey population $X$ consumes vegetation; Predator population $Y$ hunts prey.
- **Expected Outcome**: Out-of-phase population oscillations qualitatively consistent with Lotka-Volterra dynamics:
  $$\frac{dX}{dt} = \alpha X - \beta XY, \quad \frac{dY}{dt} = \delta XY - \gamma Y$$
- **Pass Criterion**: Sustained lag-phase oscillations without immediate total extinction or numerical explosion across 2000 steps.

### Benchmark 3: Evolutionary Game Theory (Prisoner's Dilemma)
- **Objective**: Validate payoff matrix selection dynamics under discrete strategy encodings.
- **Payoff Matrix**:
  - $T = 5$ (Temptation)
  - $R = 3$ (Reward for mutual cooperation)
  - $P = 1$ (Punishment for mutual defection)
  - $S = 0$ (Sucker's payoff)
- **Expected Outcome**: Defection frequency increases when spatial interaction radius is large (well-mixed population); spatial clustering promotes cooperator survival.
- **Pass Criterion**: Frequency matches theoretical replicator dynamics prediction $\frac{dx}{dt} = x(f_C - \bar{f})$ in well-mixed condition.

### Benchmark 4: Resource-Limited Carrying Capacity & Starvation Invariants
- **Objective**: Verify energy conservation and starvation mortality invariants.
- **Invariants**:
  - Total System Energy at step $t+1$:
    $$E_{total}(t+1) = E_{total}(t) + E_{generated} - E_{consumed\_metabolism}$$
  - No organism survives with $E_i \le 0$.
- **Pass Criterion**: Zero invariant violations across 10,000 steps ($0$ organisms with negative energy).

### Benchmark 5: Neutral Evolutionary Drift
- **Objective**: Verify that point mutations produce unbiased genetic drift without artificial directional selection.
- **Setup**: Zero metabolic differential ($m_{basal} = 0$, equal energy for all traits).
- **Expected Outcome**: Trait mean $\mu_g(t)$ remains centered around initial mean $\mu_g(0)$; trait variance $\sigma_g^2(t)$ increases linearly with time:
  $$\sigma_g^2(t) = 2 \mu_{mut} \sigma_{gaussian}^2 t$$
- **Pass Criterion**: Statistical hypothesis test fails to reject $H_0: \Delta \mu_g = 0$ at $\alpha = 0.05$.
