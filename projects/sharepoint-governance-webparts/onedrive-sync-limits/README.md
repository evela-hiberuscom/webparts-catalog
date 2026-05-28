# OneDrive Sync Limits

SPFx webpart project for **GOV-15 — Definir límites de sincronización con OneDrive**.

## Scope

La sincronización descontrolada puede exponer datos en dispositivos no gestionados, saturar red o generar incidencias de usuario.

## MVP

Documentar configuración actual de sync y crear checklist de gobierno; visualizar sitios/bibliotecas sensibles donde sync debería limitarse o controlarse.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/onedrive-sync-limits/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/onedrive-sync-limits.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
