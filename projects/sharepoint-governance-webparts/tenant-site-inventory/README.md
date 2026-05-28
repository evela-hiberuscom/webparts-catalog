# Tenant Site Inventory

SPFx webpart project for **GOV-27 — Mantener un inventario de sitios, propietarios, propósito, criticidad y estado**.

## Scope

Sin inventario fiable no se puede hacer gobierno, reporting, lifecycle, soporte ni Copilot readiness.

## MVP

Crear inventario maestro con site URL, título, template, hub, Team/M365 group asociado, owners, propósito, criticidad, estado lifecycle, storage y última actividad.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/tenant-site-inventory/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/tenant-site-inventory.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
