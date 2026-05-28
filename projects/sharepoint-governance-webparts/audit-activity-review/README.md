# Audit Activity Review

SPFx webpart project for **GOV-11 — Revisar auditorías de actividad: acceso, descarga, borrado, compartición, cambios de permisos**.

## Scope

Sin auditoría consolidada no se detectan incidentes, cambios sospechosos ni patrones de riesgo.

## MVP

Definir consultas de auditoría priorizadas y panel de eventos relevantes por sitio crítico.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/audit-activity-review/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/audit-activity-review.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
