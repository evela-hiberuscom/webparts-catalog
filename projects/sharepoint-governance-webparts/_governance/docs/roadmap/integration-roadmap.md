# Integration roadmap

## Mock status

All 27 webparts currently run with mock repositories.

## Backend order

1. Tenant site inventory and storage governance.
2. Ownership, support model and site creation governance.
3. Duplicate sites, inactive sites and security/compliance campaigns.
4. Permissions, external sharing, lifecycle and intranet content governance.
5. Versioning, quotas, Copilot readiness, sensitivity, retention and audit integrations.

## Source mapping

- Graph: sites, groups, usage reports, permissions where supported.
- CSOM/SharePoint Admin: SharePoint-specific administration gaps.
- Purview: sensitivity, retention, audit and DLP signals.
- SAM: site lifecycle, access reviews and data access governance where licensed.

## Not automated from frontend

Deletion, archiving, permission changes, label application, retention changes and version cleanup must remain backend-side with dry-run, approval and audit.
