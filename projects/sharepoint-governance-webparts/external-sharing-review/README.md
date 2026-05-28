# External Sharing Review

SPFx webpart project for **GOV-08 — Revisar documentos compartidos externamente**.

## Scope

Los documentos compartidos externamente pueden seguir accesibles mucho después de terminar la colaboración.

## MVP

Generar reporte por sitio de archivos/carpetas compartidos con externos usando capacidades soportadas y priorizar sitios críticos.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/external-sharing-review/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/external-sharing-review.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
