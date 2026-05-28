# Approval Flows Governance

SPFx webpart project for **GOV-19 — Definir flujos de aprobación si aplica**.

## Scope

Los contenidos o acciones sensibles requieren trazabilidad de aprobación, pero no todo debe pasar por aprobaciones.

## MVP

Catálogo de casos donde aplica aprobación: publicación intranet, limpieza destructiva, cambios de ownership, clasificación sensible, archivado/eliminación.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/approval-flows-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/approval-flows-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
