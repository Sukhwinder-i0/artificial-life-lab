# Research Report Generation Guide - Artificial Life Lab

## Overview

The **ARTIFICIAL LIFE LAB** platform provides an automated **Scientific Research Report Generator** (`analysis/report_generator.py` and `ReportExporter.tsx`) to compile publication-ready experimental reports directly from simulation telemetry and parameter sweep datasets.

---

## Output Formats

1. **GitHub-Flavored Markdown (`.md`)**:
   - Complete structured paper layout (Executive Summary, Model Parameters, Quantitative Telemetry, Bootstrap 95% CIs, Cohen's $d$, Signal Mutual Information $I(M; Y)$, Ablation Control Table, Model Card Statement).
2. **Styled HTML (`.html`)**:
   - Standalone dark-mode HTML document suitable for web embedding or conversion to PDF via browser print.
3. **Structured Dataset (`.json`)**:
   - Complete machine-readable JSON object containing full telemetry arrays, configuration dictionaries, and exact random seed metadata.

---

## Key Metrics Included in Reports

### 1. Population Dynamics & Carrying Capacity
- **$N(t)$**: Organism population count over discrete steps $t$.
- **Carrying Capacity $K$**: Logistic resource limit convergence.

### 2. Pro-Social Energy Transfer & Cooperation Rate
- **Cooperation Rate**: Ratio of voluntary energy sharing events to total social opportunities:
  $$\text{Cooperation Rate} = \frac{\text{Sharing Events}}{\text{Opportunities}}$$
- **Transfer Efficiency $\eta_{transfer}$**: Fraction of energy transferred to recipient ($80\%$).

### 3. Emitted Signal Mutual Information $I(M; Y)$
- **Shannon Entropy $H(M)$**: Emitted signal token dispersion ($M \in \{0, 1, 2, 3\}$):
  $$H(M) = -\sum_{m} P(m) \log_2 P(m)$$
- **Mutual Information $I(M; Y)$**: Non-linear association between emitted signal $M$ and environmental state/action $Y$:
  $$I(M; Y) = \sum_{m,y} P(m,y) \log_2 \frac{P(m,y)}{P(m)P(y)}$$

### 4. Non-Parametric Bootstrap 95% Confidence Intervals
- Empirical percentile bootstrap ($B = 2000$ iterations) estimating $95\%$ confidence bounds without assuming normal distribution.

### 5. Cohen's $d$ Effect Size
- Standardized mean difference between treatment condition and control baseline:
  $$d = \frac{\mu_1 - \mu_2}{s_{pooled}}$$

---

## Reproducibility Metadata

Every report explicitly logs:
- **Random Seed**: Integer seed driving `numpy.random.Generator`.
- **System Version**: ARTIFICIAL LIFE LAB v0.1.0.
- **Model Parameters**: Complete grid, resource, genome, neural, and social configurations.
