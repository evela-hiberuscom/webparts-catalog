# sensitivity-labels-governance — Functional specification

## Description

GOV-09 — Aplicar etiquetas de sensibilidad a sitios, grupos, Teams o documentos

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Sin clasificación, no se pueden aplicar controles coherentes de privacidad, external sharing, acceso desde dispositivos o protección de información.

## Scope

Inventariar etiquetas existentes y detectar sitios/grupos/Teams/documentos sin etiqueta o con etiqueta incoherente. No autoetiquetar en MVP.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-09.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Se detectan contenedores sin etiqueta.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-09.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
