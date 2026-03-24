# Mockup Spec

## Goal
Highlight a single event date with maximum clarity and low reading effort.

## Visual Direction
- Hero card with deep blue to white gradient inspired by the shared Hiberus palette.
- Large countdown numerals on the right for desktop layouts.
- Compact, stacked presentation on narrow sections.
- Rounded pills for phase, source and ownership metadata.

## States
- `loading`: shimmer skeleton with hero proportions.
- `ready`: title, phase pill, hero text, countdown numbers and CTA.
- `partialData`: ready state with a warning banner for missing optional fields.
- `empty`: message that the event is not configured or hidden by completion rules.
- `error`: safe error panel with no raw exception details.

## Accessibility
- Countdown area announces updates politely.
- Countdown values are visible as text, not only as color or iconography.
- CTA remains a standard accessible Fluent UI button when the link is valid.

## Implementation Notes
- Keep the page lightweight and avoid extra navigation or cards.
- Use the shared package for safe link handling.
- Normalize SharePoint list URLs before requesting items.
