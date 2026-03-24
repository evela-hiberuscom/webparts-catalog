# KPI Mini-Cards Mockup Spec

## Goal

Render a compact dashboard slice that lets a user scan a small set of operational KPIs in under 10 seconds.

## Visual Direction

- Background: `#F7F8FD` surface with white cards.
- Accent: `#5B53FF` for trend and action affordances.
- Primary: `#1032CF` for key metrics and supporting details.
- Typography: Montserrat for headings, Lato for body and labels.
- Shape language: pill tags and rounded cards, no sharp corners on interactive surfaces.

## Layout

- A compact header with title, subtitle, source label, and layout badge.
- A responsive grid of mini-cards.
- Loading state uses skeleton blocks.
- Empty and error states use a framed message panel.

## Card Anatomy

- KPI label
- Main value
- Unit
- Trend indicator
- Comparison text
- Sanitized open link when present
- Badge for state classification

## States

- `loading`: skeleton grid.
- `ready`: all cards render normally.
- `partialData`: cards render with warning banner if trend/comparison/url is missing.
- `empty`: no KPIs returned.
- `error`: failed source load or invalid source configuration.

## Inferences

- If the row does not define a remote source yet, the web part falls back to the static JSON configured in the manifest.
- Remote sources are normalized to the same card contract as static JSON, SharePoint lists, and endpoint payloads.
- Missing trend data does not block rendering, but it downgrades the item to partial data.

