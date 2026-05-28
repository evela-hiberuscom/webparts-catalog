# Inherited Access Review

SPFx webpart project for **GOV-07 — Revisar periódicamente accesos heredados y accesos directos**.

## Scope

Permisos únicos, accesos directos y herencias rotas son una fuente principal de sobreexposición y drift de seguridad.

## MVP

Inventariar sitios y bibliotecas con herencia rota y permisos directos en elementos de alto riesgo o bibliotecas principales.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/inherited-access-review/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/inherited-access-review.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
