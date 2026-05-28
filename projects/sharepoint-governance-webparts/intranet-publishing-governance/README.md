# Intranet Publishing Governance

SPFx webpart project for **GOV-16 — Definir políticas de publicación de páginas de intranet**.

## Scope

Sin política editorial, las páginas de intranet quedan obsoletas, inconsistentes o publicadas sin validación.

## MVP

Inventario de páginas/noticias, owners editoriales y estado de aprobación por sitio de comunicación/intranet.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/intranet-publishing-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/intranet-publishing-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
