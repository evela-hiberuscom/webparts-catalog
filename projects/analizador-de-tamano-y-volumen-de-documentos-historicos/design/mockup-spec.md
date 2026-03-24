# Mockup Spec

## Goal

Present a SharePoint-native diagnostic surface that makes library selection, scan mode, exactness, coverage and historical cost legible in under 30 seconds.

## Layout

- Header with title, subtitle, environment line and actions.
- Control area with library selector and `quickScan/deepScan` mode choice.
- Status banner for loading, empty, partial, throttled and error.
- KPI grid for documents, current size, historical versions, historical size, ratio, coverage and duration.
- Top documents table sorted by historical cost.

## Visual Rules

- Use Fluent UI controls and host-safe colors.
- Keep density moderate for standard SharePoint page columns.
- Make exactness and partial data visually distinct.
- Do not rely on color alone to encode state.

## States

- `loading`: spinner and disabled actions.
- `ready`: full diagnostics and actions enabled.
- `partialData`: warning banner and explicit coverage messaging.
- `throttled`: recoverable warning with refresh available.
- `empty`: no analyzable documents.
- `error`: safe failure state with retry.
