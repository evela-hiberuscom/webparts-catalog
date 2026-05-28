# site-lifecycle-governance — Technical design

## Components

- `SiteLifecycleGovernanceWebPart.ts`: SPFx entry point, property pane and ErrorBoundary wiring.
- `SiteLifecycleGovernanceDashboard.tsx`: visual composition.
- `GovernanceStatePanel.tsx`: reusable local state panel.
- `WebPartErrorBoundary.tsx`: required React render error boundary.

## Services

- `GovernanceDashboardService`: sorts findings, limits visible items and returns a view model.
- `MockGovernanceDashboardRepository`: returns local representative mock data.

## Models

Local TypeScript models align with `_governance/docs/shared-models/common-governance-models.md`.

## Mocks

Mock data is explicit and surfaced in the UI through a warning MessageBar. It must be replaced by backend data before production evidence is claimed.

## Expected APIs

- https://learn.microsoft.com/en-us/sharepoint/site-lifecycle-management

## Expected permissions

Read-only permissions for inventory/evidence should be separated from future remediation permissions. Any future mutation requires backend-side dry-run, approval and audit.

## Technical decisions

- One SPFx project per initiative for independent build, deployment and audit.
- No new shared package is created in this phase to avoid adding depth-sensitive build coupling.
- No direct Graph, CSOM, Purview or SAM calls are made from React components.

## Tests

Service tests cover safe item limits, risk sorting and mock-backed view-model generation.

## Observability

The frontend surfaces source labels, backend-required status and limitations. Real backend must add correlation IDs, audit logs and source confidence.

## Technical risks

**Crítica adversarial:** No todos los tenants tendrán SAM. Las señales de actividad pueden tener retrasos o limitaciones. Archivar/eliminar requiere proceso corporativo, no solo lógica técnica.
