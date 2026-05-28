# Site Lifecycle Governance

SPFx webpart project for **GOV-04 — Crear políticas de ciclo de vida para sitios activos, inactivos, archivados o eliminables**.

## Scope

Sin lifecycle, los sitios se acumulan indefinidamente y nadie sabe cuándo revisar, archivar, conservar o eliminar.

## MVP

Definir estados de lifecycle y reglas de transición: activo, observación, inactivo, pendiente de owner, candidato a archivo, archivado, candidato a eliminación, excluido.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/site-lifecycle-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/site-lifecycle-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
