# TNN Research Hub: Strategic Roadmap (2025)

**Core Thesis:** Thermodynamic Computing—utilizing noise as a computational resource—is the next paradigm for non-convex optimization and generative modeling.

**Objective:** Evolve `tnn-criticality-engine` from a simulation to a **Thermodynamic Processing Unit (TPU) Emulator**.

## Phase 1: The Thermodynamic Kernel (Weeks 1-3)
**Goal:** High-Fidelity Thermal Simulation.
- [ ] **WebGPU Compute Shaders:** Move the Langevin Integrator to the GPU. Treat the GPU as a massive "Thermal Bath".
- [ ] **Entropy Management:** Implement precise noise coloring (Ornstein-Uhlenbeck noise) to model real-world thermal fluctuations in hardware.
- [ ] **WASM Fallback:** Deterministic thermal sampling for validation.

## Phase 2: The Experimentation Plane (Weeks 4-6)
**Goal:** Automated Annealing & Phase Transitions.
- [ ] **Annealing Scheduler:** Define complex thermal schedules (Cyclical, Warm Restarts) in JSON.
- [ ] **Phase Transition Detection:** Automate the detection of the "Edge of Chaos" (Criticality) where computation is most efficient.
- [ ] **Headless CLI:** `tnn train --config thermodynamics.yaml`.

## Phase 3: Universal Energy Landscapes (Weeks 7-10)
**Goal:** Solving Real-World Energy Problems.
- [ ] **Topology Injection:** Map external problems (Folding, Logistics, Circuit Design) onto the 4D Hyper-Surface.
- [ ] **Energy-Based Models (EBM):** Train the system to "dream" data distributions by shaping the energy landscape.

## Phase 4: The Hub (Months 3+)
**Goal:** Community & Verification.
- [ ] **Thermodynamic Leaderboard:** Benchmark different thermal samplers (Langevin vs HMC vs Gibbs) on standard hard problems.
- [ ] **Publication:** "Thermodynamics as Compute" — A paper generated from this repo's metrics.
