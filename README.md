# TNN-Criticality-Engine (Secure Research Hub)

**OpenSSF Scorecard Target:** 100/100
**SLSA Compliance:** Level 3 (Build & Provenance)

## Security & Integrity
This repository utilizes a "Perfect" security architecture:
1.  **Hermetic Builds:** All builds occur inside a strict Nix environment defined in `flake.nix`.
2.  **Provenance:** Every artifact is signed and attested via Sigstore/SLSA.
3.  **Governance:** Branch protection, code owners, and signed commits are enforced.
4.  **Pinned Dependencies:** All GitHub Actions are pinned to SHA1 hashes to prevent supply chain attacks.

## Setup
To enforce the API-level security settings (Branch Protection), run:
```bash
./setup_repo.sh <owner>/<repo>
```

## Build
```bash
nix develop --command npm run build
```
