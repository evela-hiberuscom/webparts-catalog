# tenant-site-inventory — Functional specification

## Description

GOV-27 — Mantener un inventario de sitios, propietarios, propósito, criticidad y estado

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Sin inventario fiable no se puede hacer gobierno, reporting, lifecycle, soporte ni Copilot readiness.

## Scope

Crear inventario maestro con site URL, título, template, hub, Team/M365 group asociado, owners, propósito, criticidad, estado lifecycle, storage y última actividad.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-27.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Existe inventario exportable y actualizable.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-27.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
