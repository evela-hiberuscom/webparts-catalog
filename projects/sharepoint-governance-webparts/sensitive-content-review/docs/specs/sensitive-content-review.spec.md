# sensitive-content-review — Functional specification

## Description

GOV-25 — Revisar contenido sensible antes de habilitar escenarios con Copilot

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

El contenido sensible mal clasificado o sobrecompartido puede aparecer en experiencias de búsqueda, Copilot o agentes si los permisos lo permiten.

## Scope

Inventario de sitios/bibliotecas candidatos a contener información sensible usando etiquetas existentes, owners, nombres, ubicaciones y señales Purview si están disponibles.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-25.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Se identifican áreas sensibles antes de Copilot.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-25.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
