# copilot-readiness — Functional specification

## Description

GOV-24 — Preparar SharePoint para Microsoft 365 Copilot evitando sobreexposición de documentos

## Objective

Provide a SharePoint-hosted governance dashboard for administrators and owners, focused on evidence, risk, recommendation and review workflows.

## Users

- SharePoint Admin
- M365/Teams Admin
- Compliance/Legal
- Site Owner
- Support N1/N2

## Problem

Copilot puede hacer más visible información a la que el usuario ya tenía acceso, por lo que la sobreexposición previa se vuelve más crítica.

## Scope

Dashboard Copilot Readiness centrado en sitios con Everyone/EEEU, invitados, links amplios, permisos únicos, contenido sensible, owners débiles y contenido obsoleto.

## Out of scope

- Direct destructive remediations from SPFx.
- Storing credentials, tokens or tenant secrets in client code.
- Replacing Microsoft 365 admin, Purview, SAM or compliance controls.

## Required data

- Site, owner or content inventory relevant to GOV-24.
- Risk findings with severity, confidence, evidence and owner.
- Review campaign state and recommendation status.
- Backend coverage metadata and source confidence.

## Functional rules

- Todo hallazgo debe tener severidad, evidencia, fecha, fuente y responsable sugerido.

## Acceptance criteria

- Se calcula riesgo Copilot por sitio.

## Gherkin scenarios

```gherkin

## Dependencies

- Read-only backend endpoint for GOV-24.
- Microsoft Graph, SharePoint Admin/CSOM, Purview or SAM depending on source coverage.
- Governance Pack contracts in `../_governance/docs/shared-models/`.

## Limitations

- Current frontend uses representative mock data only.
- Backend, permissions, licensing and tenant coverage must be validated before production use.

## Risks

- False positives if backend evidence is incomplete.
- Overpromising enforcement where Microsoft 365 configuration is the real control plane.
- Owner fatigue if campaigns are too broad.
