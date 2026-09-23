# Scientific Model Specification - Artificial Life Lab

## 1. Introduction & Philosophy
The **Artificial Life Lab** is a computational platform designed to conduct scientific experiments in artificial life, evolutionary biology, population dynamics, and complex systems. 

### Core Scientific Philosophy
- **No Hard-coded Outcomes ("No AI Magic")**: Higher-level evolutionary behaviors (such as cooperation, specialization, aggression, or communication) must **emerge** naturally from lower-level organism interactions, energetic trade-offs, spatial dynamics, and natural selection.
- **Empirical Rigor & Determinism**: Every experiment must be 100% reproducible through explicit random seed generation, deterministic execution ordering, and recorded parameter configurations.
- **Separation of Modeling & Interpretation**: The simulation runtime records concrete data (positions, energy transfers, mutation events, birth/death events). Statistical interpretations, speciation/clustering analysis, and fitness calculations are calculated as post-hoc analytical metrics, never as hardcoded simulation shortcuts.

---

## 2. World & Environmental Model
The environment is modeled as a 2D rectangular space of width $W$ and height $H$.

### 2.1 Coordinate Space & Boundaries
- **Continuous / Grid Coordinate System**: Organisms exist at continuous positions $(x, y) \in [0, W] \times [0, H]$. Spatial queries (e.g. vision, resource foraging) map continuous coordinates to environmental grid cells or spatial partitioning structures.
- **Boundary Conditions**:
  - **Toroidal (Default)**: Coordinates wrap around boundaries:
    $$x_{wrapped} = x \bmod W, \quad y_{wrapped} = y \bmod H$$
  - **Bounded**: Hard walls where organisms cannot cross and velocity vector components towards walls are dampened or reflected.

### 2.2 Environmental Fields
The environment maintains continuous spatial scalar fields $F(x, y, t) \ge 0$:
1. **FoodField ($R$)**: Spatial distribution of consumable nutrients carrying metabolic energy $E_{food}$.
2. **WaterField ($W_{field}$)**: Hydration resources required for physiological maintenance.
3. **TemperatureField ($T$)**: Thermal environment affecting basal metabolic rates and organism thermal tolerance boundaries.
4. **HazardField ($H_{field}$)**: Environmental stress factors (toxicity, radiation, disasters) inflicting stochastic or constant health damage.

---

## 3. Resource Dynamics Model
Resources supply energy to organisms upon consumption.

### 3.1 Regeneration Kinematics
Resource regeneration follows a discrete-time **logistic growth equation**:
$$R_{t+1}(x,y) = \text{clamp}\left( R_t(x,y) + r \cdot R_t(x,y) \left(1 - \frac{R_t(x,y)}{K(x,y)}\right), \, 0, \, K(x,y) \right)$$
where:
- $R_t(x,y)$ is the current resource level at location $(x,y)$
- $r > 0$ is the intrinsic regeneration rate parameter
- $K(x,y)$ is the local carrying capacity

### 3.2 Spatial Distribution Patterns
Resources regenerate according to selectable spatial allocation models:
- **Uniform**: Equal carrying capacity $K$ across all spatial cells.
- **Clustered / Patchy**: Gaussian spatial kernels centered at resource hotspots.
- **Seasonal / Dynamic**: Periodic modulation of carrying capacity over time $K(x,y,t) = K_0 (1 + A \sin(\omega t))$.
- **Stochastic Depletion & Spawning**: Random environmental disturbance events.

---

## 4. Organism Physiology & State Model

### 4.1 State Vector
Each organism $i$ is defined by its state tuple:
$$S_i = \langle \text{id}, \text{parent\_id}, \text{generation}, \text{birth\_time}, \text{age}, \mathbf{p}_i, \mathbf{v}_i, E_i, H_i, \mathbf{G}_i, \mathbf{B}_i \rangle$$

- $\mathbf{p}_i = (x_i, y_i)$: 2D continuous spatial position
- $\mathbf{v}_i = (v_x, v_y)$: 2D continuous velocity vector
- $E_i \in [0, E_{max}]$: Current stored metabolic energy
- $H_i \in [0, H_{max}]$: Current physiological health state
- $\mathbf{G}_i$: Heritable Genome vector
- $\mathbf{B}_i$: Neural Network Brain weights (heritable)

### 4.2 Organism Lifecycle Sequence
Organism lifecycles progress strictly through discrete timestep states:
$$\text{BIRTH} \rightarrow \text{PERCEPTION} \rightarrow \text{DECISION} \rightarrow \text{ACTION/METABOLISM} \rightarrow \text{INTERACTION} \rightarrow \text{REPRODUCTION} \rightarrow \text{DEATH}$$

---

## 5. Genome & Heritable Trait Schema
The genome $\mathbf{G}_i$ contains bounded, quantitative phenotypic parameters:

| Trait Identifier | Symbol | Description | Valid Bound |
| :--- | :--- | :--- | :--- |
| `speed` | $s$ | Maximum scalar movement speed per timestep | $[0.1, 5.0]$ |
| `vision_range` | $r_{vis}$ | Radial perception field radius | $[1.0, 50.0]$ |
| `vision_resolution` | $n_{rays}$ | Number of spatial directional sensory rays | $[4, 36]$ |
| `metabolic_rate` | $m_{basal}$ | Constant basal energy consumption cost per timestep | $[0.01, 2.0]$ |
| `reproduction_threshold` | $E_{repr}$ | Energy level required to trigger reproduction | $[10.0, 200.0]$ |
| `offspring_cost` | $E_{offspring}$ | Energy transferred from parent to offspring | $[5.0, 100.0]$ |
| `attack_strength` | $\alpha_{att}$ | Combat damage potential against other organisms | $[0.0, 20.0]$ |
| `defense_strength` | $\alpha_{def}$ | Damage reduction coefficient | $[0.0, 20.0]$ |
| `social_tendency` | $\gamma_{soc}$ | Tendency to remain near or approach conspecifics | $[-1.0, 1.0]$ |
| `communication_tendency`| $\gamma_{comm}$ | Propensity to emit signal channels | $[0.0, 1.0]$ |
| `risk_preference` | $\gamma_{risk}$ | Action bias under low energy / hazard states | $[-1.0, 1.0]$ |
| `exploration_tendency` | $\gamma_{expl}$ | Stochastic direction noise magnitude | $[0.0, 1.0]$ |

---

## 6. Mutation & Inheritance Mechanics

### 6.1 Mutation Model
Mutations occur during offspring creation. For continuous trait $g_k \in \mathbf{G}_i$:
$$g_k' = \text{clamp}\left( g_k + \delta_k, \, g_{k,min}, \, g_{k,max} \right)$$
where:
$$\delta_k = \begin{cases} \varepsilon_k \sim \mathcal{N}(0, \sigma_k^2) & \text{with probability } \mu_k \\ 0 & \text{with probability } 1 - \mu_k \end{cases}$$
Every mutation event logs the parent value, offspring value, trait name, and exact delta $\Delta g_k = g_k' - g_k$.

### 6.2 Reproductive Modes
- **Asexual Reproduction**: Offspring genome $\mathbf{G}_{offspring}$ is cloned directly from parent $\mathbf{G}_{parent}$ subject to Gaussian point mutations.
- **Sexual Reproduction**: Each gene $g_k$ is independently inherited from Parent A or Parent B with probability $0.5$, followed by point mutations.

---

## 7. Action & Metabolism Mechanics

### 7.1 Metabolic Energy Consumption
At timestep $t$, organism energy updates as:
$$E_{i, t+1} = E_{i, t} + E_{gain} - E_{cost}$$
where total energetic expenditure is:
$$E_{cost} = m_{basal} + C_{move}(d) + C_{action} + C_{brain}$$
- Kinetic movement cost: $C_{move}(d) = \alpha_{kinetic} \cdot s_i \cdot d_i$ where $d_i$ is distance moved.
- Computational brain cost: $C_{brain} = \beta_{brain} \cdot N_{active\_neurons}$.

### 7.2 Death Rules
An organism dies instantly at timestep $t$ if:
1. $E_i \le 0$ (Starvation)
2. $H_i \le 0$ (Combat or Hazard damage)
3. $\text{age}_i \ge \text{maximum\_age}$ (Senescence)
4. Stochastic environmental mortality: $P(death) = 1 - \exp(-\lambda \Delta t)$

Upon death, cause of death (`starvation`, `combat`, `age`, `hazard`, `predation`) is logged for population telemetry.

---

## 8. Social Interaction, Cooperation & Communication

### 8.1 Cooperation & Energy Transfer
Cooperation is modeled as a direct voluntary energy transfer action between Organism $i$ (donor) and Organism $j$ (recipient):
$$E_i' = E_i - C_{share}$$
$$E_j' = E_j + \eta \cdot C_{share}$$
where $C_{share} > 0$ is the direct cost borne by the donor, and $\eta \in (0, 1]$ is transfer efficiency.
Cooperation rate is defined strictly as:
$$\text{cooperation\_rate} = \frac{\text{count(cooperative energy sharing actions)}}{\text{count(eligible proximity social interactions)}}$$

### 8.2 Communication Signals
Organisms can emit discrete signal tokens $M_i \in \{0, 1, 2, 3\}$.
- Emitting a signal incurs energetic cost $C_{signal} > 0$.
- Nearby organisms perceive $M_i$ in their sensory input vector.
- Signals have **no hard-coded meanings**. Semantic structure is evaluated post-hoc using mutual information $I(M; Y)$ between emitted signals $M$ and environmental state/subsequent action $Y$.

---

## 9. Deterministic Step Execution Order
To prevent update-order bias across organisms within a single discrete timestep:
1. Environmental field update & resource regeneration
2. Organism sensory perception vector construction
3. Neural brain forward pass / policy action decision computation
4. Movement vector evaluation & spatial updates
5. Metabolic energy deduction ($E_{cost}$)
6. Resource consumption & energy gain processing
7. Combat, social sharing, and signal interactions
8. Reproduction condition checks & offspring instantiation
9. Genetic & neural mutation application
10. Mortality check & carcass/death logging
11. Statistical metric aggregation & lineage tracking
12. Global timestep advance $t \leftarrow t + 1$

Organism execution order during actions & interactions is randomly shuffled using the run's deterministic random generator to eliminate spatial index priority bias.
