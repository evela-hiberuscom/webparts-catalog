# Support Model Governance

SPFx webpart project for **GOV-22 — Definir un modelo de soporte: quién resuelve incidencias, altas, bajas, permisos y dudas**.

## Scope

Sin modelo operativo, la gobernanza se convierte en tickets dispersos y decisiones inconsistentes.

## MVP

Definir RACI de soporte y catálogo de solicitudes: alta site, cambio owner, permisos, external sharing, limpieza, lifecycle, sensibilidad, intranet.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/support-model-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/support-model-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
