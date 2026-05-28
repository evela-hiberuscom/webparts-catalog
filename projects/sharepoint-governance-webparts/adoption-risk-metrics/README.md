# Adoption Risk Metrics

SPFx webpart project for **GOV-26 — Medir uso, adopción, sitios activos, documentos compartidos y riesgos**.

## Scope

Sin métricas no se puede justificar la herramienta ni priorizar remediaciones.

## MVP

Definir KPI: sitios activos/inactivos, owners saludables, storage, external sharing, permisos únicos, sitios revisados, riesgos abiertos/cerrados, adopción owners.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/adoption-risk-metrics/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/adoption-risk-metrics.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
