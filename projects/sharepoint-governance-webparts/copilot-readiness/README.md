# Copilot Readiness

SPFx webpart project for **GOV-24 — Preparar SharePoint para Microsoft 365 Copilot evitando sobreexposición de documentos**.

## Scope

Copilot puede hacer más visible información a la que el usuario ya tenía acceso, por lo que la sobreexposición previa se vuelve más crítica.

## MVP

Dashboard Copilot Readiness centrado en sitios con Everyone/EEEU, invitados, links amplios, permisos únicos, contenido sensible, owners débiles y contenido obsoleto.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/copilot-readiness/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/copilot-readiness.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
