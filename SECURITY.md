# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of this repository seriously. If you find a vulnerability, please DO NOT report it via public GitHub issues.

### Disclosure Process

1.  Send an email to security@example.com (Replace with actual email).
2.  Include a proof of concept (PoC) or detailed description.
3.  We will acknowledge receipt within 48 hours.
4.  We will provide a timeline for mitigation.

## Infrastructure Security

This repository adheres to **SLSA Level 3** and **OpenSSF Scorecard** standards.
- All artifacts are signed and attested.
- All dependencies are pinned.
- Build environments are hermetic (Nix-based).
