# site-lifecycle-governance — Functional specification

## Description

GOV-04 — Crear políticas de ciclo de vida para sitios activos, inactivos, archivados o eliminables

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Sin lifecycle, los sitios se acumulan indefinidamente y nadie sabe cuándo revisar, archivar, conservar o eliminar.

## Scope

Definir estados de lifecycle y reglas de transición: activo, observación, inactivo, pendiente de owner, candidato a archivo, archivado, candidato a eliminación, excluido.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-04.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Cada site tiene estado lifecycle calculado y explicado.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-04.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
