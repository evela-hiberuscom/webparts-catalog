# ADR-001 — One SPFx project per governance webpart

## Status

Accepted.

## Context

The Governance Pack defines 27 initiatives. The user explicitly requires a root folder `projects/sharepoint-governance-webparts/`, a documentation-only `_governance/` folder, and one independent SPFx project for each initiative/webpart.

## Decision

Se prioriza independencia, trazabilidad, auditoría y evolución autónoma por iniciativa frente a la eficiencia de una única solución multi-webpart.

## Advantages

- Each initiative can build, test, package, deploy and roll back independently.
- Each webpart has its own documentation, red-team audit and backend contract.
- Permission, lifecycle and release discussions are traceable per initiative.
- Failures in one project do not block local development of another project.

## Drawbacks

- More package.json and package-lock files to maintain.
- More SPPKG packages and app catalog entries.
- More CI work when shared scripts or dependency baselines change.
- Reuse requires discipline because there is no productive shared governance package yet.

## Maintenance impact

Repository discovery scripts must support nested SPFx projects. Shared decisions live in `_governance/docs/` and remain subordinate to `AGENTS.md` and `DESIGN.md`.

## Build/deploy impact

Each child folder is a standalone SPFx project with its own `config/`, `src/`, lockfile and Heft build. Deployment produces independent packages.

## Reuse impact

Conceptual models, UI rules and service contracts are centralized in `_governance/docs/shared-*/`. Local TypeScript models may duplicate structure but must align with those contracts.

## Coordination

`docs/project-index.md` tracks initiative, project, mock status, backend requirement, risk and audit state. `docs/orchestrator/progress.md` tracks delivery status.

## Independent audit

Each project has `docs/red-team/<project>.red-team.md` with required scoring. Global issues are consolidated in `docs/red-team/global-red-team.md`.
