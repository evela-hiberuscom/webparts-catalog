# Sensitive Content Review

SPFx webpart project for **GOV-25 — Revisar contenido sensible antes de habilitar escenarios con Copilot**.

## Scope

El contenido sensible mal clasificado o sobrecompartido puede aparecer en experiencias de búsqueda, Copilot o agentes si los permisos lo permiten.

## MVP

Inventario de sitios/bibliotecas candidatos a contener información sensible usando etiquetas existentes, owners, nombres, ubicaciones y señales Purview si están disponibles.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/sensitive-content-review/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/sensitive-content-review.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
