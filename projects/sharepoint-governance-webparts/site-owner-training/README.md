# Site Owner Training

SPFx webpart project for **GOV-21 — Formar a propietarios de sitios y usuarios clave**.

## Scope

Los owners son la primera línea de gobierno, pero suelen no conocer permisos, sharing, lifecycle o responsabilidades editoriales.

## MVP

Programa de formación por rol: owner, content owner, admin, soporte, usuario avanzado. Microformaciones y checklist de owner.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/site-owner-training/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/site-owner-training.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
