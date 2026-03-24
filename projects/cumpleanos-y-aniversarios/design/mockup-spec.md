# Mockup Spec

## Goal
Render a positive, compact celebrations block for SharePoint pages. The web part must feel light, human and readable at a glance.

## Layout
- Header with title and source pill.
- Main content organized in sections:
  - `Hoy`
  - `Próximos`
  - `Datos parciales`
- Each item renders as a compact card with persona, date label and a clear badge.

## States
- `loading`: spinner with title and subtitle visible.
- `ready`: sections with cards.
- `partialData`: warning banner plus the normal sections.
- `empty`: information message with retry action.
- `error`: error message with retry action.

## Visual rules
- Use warm neutrals and deep blue text.
- Emphasize today items with a stronger border and badge.
- Keep dense content readable in narrow widths.
- Avoid dark, saturated or decorative noise.

## Accessibility
- Cards must remain keyboard readable.
- Labels must not rely only on color.
- The partial state must remain understandable without inspecting source data.

