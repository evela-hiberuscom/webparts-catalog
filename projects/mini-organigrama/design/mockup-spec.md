# Mockup Spec

## Goal

Show a lightweight organizational context block that helps a user understand who the root person is, who reports directly, and how to open valid profiles without overwhelming a SharePoint page.

## Layout

- Header with title, optional description and environment hint.
- Search and view controls in a compact toolbar.
- Status messages for loading, partial data, empty, error and no matches.
- Root node followed by direct reports or a short chain depending on the selected view mode.

## Responsive behavior

- On wide layouts, render the root card and children in a two-level tree.
- On narrow layouts, keep the same information but stack it vertically.
- Never expand into a full dashboard.

## Visual rules

- Use Fluent UI primitives and the tenant theme.
- Root node must be visually distinct without overpowering the page.
- Partial nodes must carry a subtle badge.
- Profiles open only when the link is safe and same-origin or mail/tel based.

## States

- Loading: show a status banner and the shell of the tree.
- Ready: show root, children and actions.
- Empty: show a short empty state.
- Partial data: warn that relationships or profile data are incomplete.
- Error: show a safe error message through the error boundary or page state.

