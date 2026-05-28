# Governance webparts progress

## Global status

The governance suite contains 27 independent SPFx projects and a documentation-only coordination area. All projects are mock-backed and explicitly require backend integration for production evidence.

| Initiative | Project | Agent | Implementation | Tests | Harness compliance | Debt | Blockers | Audit |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| GOV-01 | site-creation-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-02 | duplicate-sites-control | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-03 | orphan-sites-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-04 | site-lifecycle-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-05 | inactive-sites-validation | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-06 | site-archive-retention-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-07 | inherited-access-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-08 | external-sharing-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-09 | sensitivity-labels-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-10 | retention-compliance-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-11 | audit-activity-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-12 | storage-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-13 | storage-quota-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-14 | version-control-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-15 | onedrive-sync-limits | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-16 | intranet-publishing-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-17 | content-owners-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-18 | obsolete-content-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-19 | approval-flows-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-20 | user-good-practices | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-21 | site-owner-training | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-22 | support-model-governance | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-23 | security-compliance-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-24 | copilot-readiness | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-25 | sensitive-content-review | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-26 | adoption-risk-metrics | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |
| GOV-27 | tenant-site-inventory | SPFx Scaffold Agent | 100% | 100% | 100% | Backend integration pending by design | None | Individual audit generated |

## Decisions open

- Backend ownership, authentication model and endpoint hosting.
- Tenant permissions and Microsoft 365 licensing for Graph, CSOM, Purview and SAM sources.
- Deployment cadence for 27 independent SPPKG packages.
