# ADR-002 — Mock-first frontend with explicit backend boundary

## Status

Accepted.

Mock repositories are used because no backend endpoint is present in the repository. Mock mode is visible in the UI and documented as non-production evidence. Real tenant calls must be backend-side, least-privilege and audited.
