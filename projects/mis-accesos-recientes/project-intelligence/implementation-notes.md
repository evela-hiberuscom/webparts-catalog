# Implementation Notes

## Row Interpretation
- `Mis accesos recientes` is treated as a lightweight launcher for the user's latest documents, pages, or apps.
- The row is detailed enough to implement the UX, states, and contract structure without asking for more input.

## Inferred Gap
- The technical row references `GraphRecent` and `SharePointRecentList`, but no concrete connector, list schema, or permission contract is available in the repo.
- V1 therefore implements a safe fallback path:
  - `SharePointList` and `GraphRecent` modes use local seeded data with partial-data messaging.
  - `JsonUrl` mode can load a real feed if configured.

## Repeated-Failure Guard
- Do not reintroduce the scaffold wrapper issue already captured centrally.
- Do not assume Graph permissions or web API permission requests are available unless the row explicitly says so.
- Do not mix rendering, filtering, and data loading into the React view component.

## Validation Notes
- The project should build without external data dependencies.
- The final audit should verify the fallback messaging is honest and does not claim a live Graph integration that is not present yet.
