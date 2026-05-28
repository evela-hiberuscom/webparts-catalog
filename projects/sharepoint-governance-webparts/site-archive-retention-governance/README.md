# Site Archive and Retention Governance

SPFx webpart project for **GOV-06 — Definir cuándo archivar, conservar o eliminar sitios antiguos**.

## Scope

Archivar o eliminar sin criterios claros puede romper procesos, incumplir retención o destruir evidencia.

## MVP

Documento de política y motor de recomendación. No eliminación automática en MVP.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/site-archive-retention-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/site-archive-retention-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
