# ADR-003 — No shared-governance-core package in this phase

## Status

Accepted.

The repository supports internal packages, but adding `shared-governance-core` now would complicate lockfiles, nested project discovery and SPFx builds. Shared contracts are documented under `_governance/docs/`; extraction to a package can happen after backend contracts stabilize.
