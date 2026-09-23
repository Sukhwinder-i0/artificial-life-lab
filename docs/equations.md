# Mathematical & Formal Equations Specification - Artificial Life Lab

This document contains the exact mathematical equations, algorithms, and analytical formulas governing the **Artificial Life Lab** simulation engine and scientific analysis pipeline.

---

## 1. Resource Dynamics

### 1.1 Discrete-Time Logistic Resource Regeneration
For any spatial grid location $(x,y)$ with carrying capacity $K(x,y)$ and intrinsic growth rate $r$:
$$R_{t+1}(x,y) = \text{clamp}\left( R_t(x,y) + r \cdot R_t(x,y) \left( 1 - \frac{R_t(x,y)}{K(x,y)} \right), \, 0, \, K(x,y) \right)$$
Where $\text{clamp}(v, a, b) = \max(a, \min(b, v))$.

### 1.2 Resource Consumption
When organism $i$ consumes resource amount $c_i \le R_t(x,y)$:
$$R_{t+1}(x,y) = R_t(x,y) - c_i$$
$$E_{i, t+1} = \min(E_{i, t} + c_i \cdot \phi_{energy}, \, E_{max})$$
where $\phi_{energy}$ converts resource units to metabolic energy units.

---

## 2. Metabolic Energetics & Costs

### 2.1 Energetic Balance Equation
$$E_{i, t+1} = E_{i, t} + E_{gain} - E_{cost}$$

### 2.2 Cost Breakdown
$$E_{cost} = m_{basal} + C_{move} + C_{action} + C_{brain}$$

- **Basal Metabolic Cost**:
  $$m_{basal} = \gamma_{basal} \cdot \left( \omega_{body} + \text{speed}_{max}^2 \cdot \omega_{speed} + \text{vision\_range} \cdot \omega_{vision} \right)$$
- **Kinetic Movement Cost**:
  $$C_{move}(d) = \alpha \cdot d_i + \beta \cdot d_i^2$$
  where $d_i = \sqrt{\Delta x_i^2 + \Delta y_i^2}$ is actual displacement moved in timestep $t$.
- **Neural Computation Cost**:
  $$C_{brain} = \zeta \cdot N_{units} + \xi \cdot \sum_{j} |w_j|$$
- **Action Costs**:
  - Attack action: $C_{attack} = \theta_{attack} \cdot \text{attack\_strength}$
  - Social share action: $C_{share} = \text{energy\_shared}$
  - Communication signal action: $C_{signal} = \theta_{signal}$

---

## 3. Genetics & Mutation Mechanics

### 3.1 Continuous Gene Mutation
For heritable continuous gene $g_k \in \mathbf{G}_i$ with bounds $[g_{min}, g_{max}]$:
$$g_k' = \text{clamp}\left( g_k + \varepsilon_k, \, g_{min}, \, g_{max} \right)$$
$$\varepsilon_k \sim \begin{cases} \mathcal{N}(0, \sigma_k^2) & \text{with probability } \mu_k \\ 0 & \text{with probability } 1 - \mu_k \end{cases}$$

### 3.2 Mutation Delta Tracking
Every gene mutation logs:
$$\Delta g_k = g_k' - g_k$$

### 3.3 Recombination / Sexual Crossover
For parents $A$ and $B$, offspring gene $g_k^{offspring}$:
$$g_k^{offspring} = \begin{cases} g_k^A & \text{with probability } 0.5 \\ g_k^B & \text{with probability } 0.5 \end{cases} \quad + \quad \varepsilon_k$$

---

## 4. Mortality & Fitness Proxies

### 4.1 Mortality Conditions
Organism death occurs if:
$$E_{i, t} \le 0 \quad \lor \quad H_{i, t} \le 0 \quad \lor \quad \text{age}_{i, t} \ge \text{age}_{max}$$

### 4.2 Stochastic Environmental Mortality
$$P(\text{death}_i) = 1 - \exp(-\lambda_{hazard} \cdot H_{field}(x_i, y_i) \cdot \Delta t)$$

### 4.3 Explicit Scalar Fitness Composite Proxy
For post-hoc analysis across experiment runs:
$$F_i = w_1 \cdot \tilde{O}_i + w_2 \cdot \tilde{S}_i + w_3 \cdot \tilde{E}_i$$
where:
- $\tilde{O}_i = \frac{O_i}{\max_j O_j}$: Normalized total successful offspring count
- $\tilde{S}_i = \frac{\text{lifespan}_i}{\text{age}_{max}}$: Normalized lifespan
- $\tilde{E}_i$: Normalized lifetime energetic efficiency $\frac{\sum E_{gain}}{\sum E_{cost}}$
- $w_1, w_2, w_3 \ge 0, \quad \sum w_k = 1$ (Explicitly set per experiment parameter configuration).

---

## 5. Population Dynamics & Trait Statistics

### 5.1 Per-Capita Population Growth Rate
For discrete timestep population count $N_t$:
$$r_t = \ln \left( \frac{N_{t+1}}{N_t} \right) \quad \text{for } N_t > 0$$

### 5.2 Trait Summary Statistics
For population size $N$ and trait $x$:
- **Mean**: $\mu_x = \frac{1}{N} \sum_{i=1}^N x_i$
- **Variance**: $\sigma_x^2 = \frac{1}{N} \sum_{i=1}^N (x_i - \mu_x)^2$
- **Standard Error**: $SE_x = \frac{\sigma_x}{\sqrt{N}}$

### 5.3 Specialization & Resource Entropy
For resource consumption proportions $p_k = \frac{c_k}{\sum_{j=1}^K c_j}$ across $K$ distinct resource types:
- **Shannon Entropy**:
  $$H = -\sum_{k=1}^K p_k \ln(p_k)$$
- **Normalized Entropy**:
  $$H_{norm} = \frac{H}{\ln(K)} \in [0, 1]$$
  - $H_{norm} \to 0$: High specialist behavior.
  - $H_{norm} \to 1$: Generalist behavior.

---

## 6. Information Theory & Emergence Metrics

### 6.1 Mutual Information for Signal Communication
For emitted discrete signal token $M \in \{0, 1, 2, 3\}$ and environmental state/action variable $Y$:
$$I(M; Y) = \sum_{m \in M} \sum_{y \in Y} P(m, y) \log_2 \left( \frac{P(m, y)}{P(m) P(y)} \right)$$
where $P(m, y)$ is the empirical joint frequency observed during simulation runs.

### 6.2 Spatial Clustering Index (Nearest-Neighbor Distance)
For $N$ organisms in area $A = W \times H$:
$$d_{observed} = \frac{1}{N} \sum_{i=1}^N \min_{j \neq i} \|\mathbf{p}_i - \mathbf{p}_j\|$$
$$d_{expected} = \frac{1}{2 \sqrt{N / A}}$$
$$R_{spatial} = \frac{d_{observed}}{d_{expected}}$$
- $R_{spatial} < 1$: Aggregated / clustered distribution.
- $R_{spatial} = 1$: Random spatial Poisson distribution.
- $R_{spatial} > 1$: Uniform / dispersed distribution.

---

## 7. Statistical Comparison Formulas

### 7.1 Bootstrap Confidence Intervals ($95\%$ CI)
For sample vector $\mathbf{x} = [x_1, \dots, x_n]$, draw $B = 2000$ bootstrap resamples with replacement $\mathbf{x}^{*,b}$:
$$\hat{\mu}^{*,b} = \text{mean}(\mathbf{x}^{*,b})$$
Sort bootstrap means $\hat{\mu}^{*,(1)} \le \dots \le \hat{\mu}^{*,(B)}$.
$$95\% \text{ CI} = \left[ \hat{\mu}^{*,(\lfloor 0.025 B \rfloor)}, \, \hat{\mu}^{*,(\lceil 0.975 B \rceil)} \right]$$

### 7.2 Effect Size (Cohen's $d$)
For treatment group 1 and control group 2:
$$d = \frac{\mu_1 - \mu_2}{s_{pooled}}$$
$$s_{pooled} = \sqrt{\frac{(n_1 - 1) s_1^2 + (n_2 - 1) s_2^2}{n_1 + n_2 - 2}}$$

---

## 8. Theoretical Reference Baselines (Analytical Tools)

### 8.1 Replicator Dynamics (Discrete Strategy Baseline)
For discrete population strategy frequencies $x_i$ with fitness $f_i$ and average population fitness $\bar{f} = \sum x_j f_j$:
$$\frac{dx_i}{dt} = x_i (f_i - \bar{f})$$

### 8.2 Lotka-Volterra Predator-Prey Model Baseline
$$\frac{dX}{dt} = \alpha X - \beta X Y \quad \text{(Prey } X\text{)}$$
$$\frac{dY}{dt} = \delta X Y - \gamma Y \quad \text{(Predator } Y\text{)}$$
Used exclusively for analytical benchmark comparison against emergent population trajectories.
