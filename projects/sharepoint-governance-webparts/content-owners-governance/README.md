# Content Owners Governance

SPFx webpart project for **GOV-17 — Establecer responsables de contenido por área o departamento**.

## Scope

Sin responsable de contenido, nadie mantiene páginas, documentos o decisiones de ciclo de vida.

## MVP

Crear matriz RACI por área/departamento y asociarla a sitios, hubs, páginas y bibliotecas críticas.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/content-owners-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/content-owners-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
