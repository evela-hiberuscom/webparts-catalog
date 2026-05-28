# User Good Practices

SPFx webpart project for **GOV-20 — Crear documentación interna de buenas prácticas para usuarios**.

## Scope

La herramienta no funcionará si los usuarios y owners no entienden qué se espera de ellos.

## MVP

Crear guías breves: creación de sitios, owners, compartir externamente, versionado, publicación, lifecycle, Copilot readiness y soporte.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/user-good-practices/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/user-good-practices.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
