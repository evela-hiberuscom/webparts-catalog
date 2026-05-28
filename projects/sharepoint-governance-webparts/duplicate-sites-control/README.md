# Duplicate Sites Control

SPFx webpart project for **GOV-02 — Controlar la creación desordenada de sitios para evitar duplicados**.

## Scope

Sitios con nombres similares, mismo departamento/proyecto o propósito duplicado aumentan coste, confusión, contenido duplicado y riesgos de permisos.

## MVP

Crear un detector de duplicados basado en URL, título, alias, owner, departamento, plantilla, fecha y metadatos de propósito.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/duplicate-sites-control/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/duplicate-sites-control.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
