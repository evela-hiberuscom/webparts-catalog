# Retention Compliance Governance

SPFx webpart project for **GOV-10 — Definir qué documentos deben conservarse por obligación legal o normativa**.

## Scope

Borrar o modificar documentos sujetos a conservación puede generar incumplimiento legal o pérdida de evidencia.

## MVP

Crear catálogo de tipos documentales, áreas responsables, periodo de conservación y política/label Purview asociada. La herramienta debe visualizar cobertura y excepciones.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/retention-compliance-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/retention-compliance-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
