# Version Control Governance

SPFx webpart project for **GOV-14 — Controlar versiones de documentos para evitar crecimiento excesivo**.

## Scope

El histórico de versiones puede disparar almacenamiento, pero borrar versiones puede romper recuperación, auditoría o retención.

## MVP

Inventario de bibliotecas con versionado excesivo, configuración actual y simulación de ahorro potencial sin borrar.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/version-control-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/version-control-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
