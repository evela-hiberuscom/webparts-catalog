# duplicate-sites-control — Functional specification

## Description

GOV-02 — Controlar la creación desordenada de sitios para evitar duplicados

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Sitios con nombres similares, mismo departamento/proyecto o propósito duplicado aumentan coste, confusión, contenido duplicado y riesgos de permisos.

## Scope

Crear un detector de duplicados basado en URL, título, alias, owner, departamento, plantilla, fecha y metadatos de propósito.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-02.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- El sistema agrupa sitios potencialmente duplicados con explicación.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-02.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
