# Obsolete Content Review

SPFx webpart project for **GOV-18 — Revisar contenido obsoleto en páginas, noticias y documentos**.

## Scope

El contenido obsoleto reduce confianza, aumenta resultados incorrectos en búsqueda/Copilot y puede exponer decisiones antiguas como vigentes.

## MVP

Detectar páginas/noticias/documentos sin revisión reciente, sin owner o con baja actividad en sitios críticos.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/obsolete-content-review/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/obsolete-content-review.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
