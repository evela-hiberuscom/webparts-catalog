# Inactive Sites Validation

SPFx webpart project for **GOV-05 — Detectar sitios inactivos y pedir validación a sus propietarios**.

## Scope

La inactividad aparente no significa que el sitio pueda eliminarse; hay que preguntar al responsable y conservar evidencia.

## MVP

Detectar candidatos a inactividad y generar solicitudes de validación a owners con respuestas trazadas.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/inactive-sites-validation/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/inactive-sites-validation.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
