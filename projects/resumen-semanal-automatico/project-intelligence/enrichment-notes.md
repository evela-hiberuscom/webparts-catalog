# Enrichment Notes

## Observed
- The row is a summary web part focused on weekly highlights.
- The Airtable data already provides sufficient archetype, design and provisioning direction.
- The implementation must stay local to SharePoint and avoid external data dependencies.

## Inferred
- The digest should support at least current week, previous week and custom date ranges.
- The digest should tolerate partial items without failing the full render.
- The UI should prioritize readability, compact cards and a strong visual hierarchy.
- A small static repository is useful for development and validation before wiring a real source.

## Pending validation
- The exact production source for weekly highlights.
- Whether all three source types will be backed by SharePoint lists or some will map to news posts.
- The final copy for error and empty states after stakeholder review.

## Error history
- React 17 does not support `startTransition`, so the hook must use direct state updates.
- Date filtering should compare calendar keys, not raw timestamps, to avoid timezone drift.
