# Storage Governance

SPFx webpart project for **GOV-12 — Monitorizar el almacenamiento usado por sitios y bibliotecas**.

## Scope

El consumo de almacenamiento crece sin visibilidad por sitio, biblioteca, versiones o papelera.

## MVP

Dashboard de almacenamiento por site collection, tendencia y top consumidores.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/storage-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/storage-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
