# Site Creation Governance

SPFx webpart project for **GOV-01 — Definir quién puede crear sitios de SharePoint**.

## Scope

La creación abierta de sitios provoca expansión descontrolada, duplicados, sitios sin propósito claro y deuda de gobierno desde el primer día.

## MVP

Inventariar configuración actual de creación de sitios, roles autorizados, canales de solicitud y desviaciones. Crear panel de “sitios creados fuera del proceso”.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/site-creation-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/site-creation-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
