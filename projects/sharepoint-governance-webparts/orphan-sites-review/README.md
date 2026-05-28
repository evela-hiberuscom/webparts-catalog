# Orphan Sites Review

SPFx webpart project for **GOV-03 — Revisar sitios sin propietario o con propietarios inactivos**.

## Scope

Un sitio sin owner activo no tiene responsable real para permisos, contenido, lifecycle ni preparación Copilot.

## MVP

Inventariar owners/admins por sitio y cruzar con estado de usuario si la información está disponible. Marcar sitios con menos de dos propietarios válidos.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/orphan-sites-review/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/orphan-sites-review.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
