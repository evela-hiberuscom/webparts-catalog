# audit-activity-review — Functional specification

## Description

GOV-11 — Revisar auditorías de actividad: acceso, descarga, borrado, compartición, cambios de permisos

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Sin auditoría consolidada no se detectan incidentes, cambios sospechosos ni patrones de riesgo.

## Scope

Definir consultas de auditoría priorizadas y panel de eventos relevantes por sitio crítico.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-11.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Se definen eventos clave a vigilar.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-11.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
