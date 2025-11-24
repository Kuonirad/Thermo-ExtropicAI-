# Agent Protocol: TNN Research Hub

## Core Directive
This repository is a **Thermodynamic Computing Research Platform**.
All code changes must respect the primacy of Thermodynamic principles:
1.  **Noise is Resource:** Do not optimize away stochasticity. Control it.
2.  **Energy is Metric:** Success is defined by Energy Minimization or Distribution Matching.
3.  **Rigor:** All physics changes must be verified against `benchmarks/compare_solvers.ts`.

## Operational Standards
*   **Testing:** Use `fast-check` for property-based verification of physics kernels.
*   **Performance:** Physics loop must be O(N) memory and avoid Garbage Collection. Use TypedArrays.
*   **Deployment:** `index.html` is the build artifact. `src/` is the source of truth.

## Future Tasks (See ROADMAP.md)
*   Prioritize WebGPU migration.
*   Implement "Headless" CLI for server-side training.
