# Sensitivity Labels Governance

SPFx webpart project for **GOV-09 — Aplicar etiquetas de sensibilidad a sitios, grupos, Teams o documentos**.

## Scope

Sin clasificación, no se pueden aplicar controles coherentes de privacidad, external sharing, acceso desde dispositivos o protección de información.

## MVP

Inventariar etiquetas existentes y detectar sitios/grupos/Teams/documentos sin etiqueta o con etiqueta incoherente. No autoetiquetar en MVP.

## Current implementation

- Independent SPFx 1.22.2 project under `projects/sharepoint-governance-webparts/sensitivity-labels-governance/`.
- React 17 + Fluent UI v8 dashboard with loading, empty, error, mock and backend-required states.
- Local mock repository, service layer, hook and unit tests.
- No real tenant mutation, destructive operation or direct Graph/CSOM/Purview call is implemented in the client.

## Build

```powershell
npm ci --ignore-scripts
npm run build
```

## Backend integration

The webpart requires a backend/API to replace mock data with audited tenant evidence. See `docs/design-technical/sensitivity-labels-governance.technical.md` and the global backlog in `../_governance/docs/backlog/backend-required-work.md`.
