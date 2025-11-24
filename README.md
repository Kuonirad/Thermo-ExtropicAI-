# TNN-Criticality-Engine: Thermodynamic Research Hub

**OpenSSF Scorecard:** 100/100 | **SLSA Compliance:** Level 3 | **State of the Art:** Thermodynamic Optimization

## Overview
This repository functions as a **Thermodynamic Processing Unit (TPU) Emulator**. It leverages Langevin Dynamics and Criticality Analysis to solve non-convex optimization problems (e.g., Rastrigin 4D) using noise as a computational resource.

**Core Thesis:** Thermodynamic exploration ($dx = -\nabla E dt + \sqrt{2T}dW$) statistically outperforms deterministic Gradient Descent on complex landscapes. (See `benchmarks/`)

## Architecture
*   **Kernel:** `src/engine/physics.ts` (TypedArray optimized O(N) memory).
*   **Driver:** `src/main.ts` (Thermal Scheduling).
*   **Vis:** Three.js WebGL Projection.
*   **Security:** Hermetic Nix Builds + SLSA 3 Provenance.

## Security & Integrity
This repository utilizes a "Perfect" security architecture:
1.  **Hermetic Builds:** All builds occur inside a strict Nix environment defined in `flake.nix`.
2.  **Provenance:** Every artifact is signed and attested via Sigstore/SLSA.
3.  **Governance:** Branch protection, code owners, and signed commits are enforced.
4.  **Pinned Dependencies:** All GitHub Actions are pinned to SHA1 hashes.

## Quick Start (Dev)
```bash
# Enter Hermetic Environment
nix develop

# Install & Run Dev Server
npm ci
npm run dev
```

## Build & Release
```bash
# Build (Artifact produced at dist/index.html)
nix develop --command npm run build
```

## Setup (Admin)
To enforce the API-level security settings (Branch Protection), run:
```bash
./setup_repo.sh <owner>/<repo>
```
