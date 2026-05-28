# Storage Quota Governance

SPFx webpart project for **GOV-13 — Definir cuotas o controles de crecimiento de almacenamiento**.

## Scope

Sin límites o alertas, los sitios pueden consumir almacenamiento de forma anómala hasta generar coste o bloqueo operacional.

## MVP

Política de umbrales por criticidad/tipo de sitio y alertas de crecimiento anómalo.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/storage-quota-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/storage-quota-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
