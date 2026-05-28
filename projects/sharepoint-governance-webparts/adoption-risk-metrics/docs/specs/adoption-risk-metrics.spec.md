# adoption-risk-metrics — Functional specification

## Description

GOV-26 — Medir uso, adopción, sitios activos, documentos compartidos y riesgos

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Sin métricas no se puede justificar la herramienta ni priorizar remediaciones.

## Scope

Definir KPI: sitios activos/inactivos, owners saludables, storage, external sharing, permisos únicos, sitios revisados, riesgos abiertos/cerrados, adopción owners.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-26.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Los KPI están definidos y versionados.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-26.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
