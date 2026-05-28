# external-sharing-review — Functional design

## Screens

- Summary header with initiative, phase and source.
- Metric cards for coverage, open findings and owner/admin actions.
- Findings list with severity, confidence, status, evidence and recommendation.
- Recommendation list.
- Limitations block.

## Interactions

- Configure title, subtitle, maximum visible findings and detail visibility from the property pane.
- Retry loading when the repository/service returns an error.
- Review evidence and recommendations without executing real remediations.

## States

- Loading: neutral progress panel.
- Empty: useful empty message.
- Error: retryable error panel.
- Mock mode: visible warning MessageBar.
- Backend required: visible information MessageBar.

## Filters

MVP exposes the maximum visible findings. Real backend integration should add filters for severity, owner, area, lifecycle status and source.

## Actions

All actions are recommendations or review prompts only. No destructive action is implemented.

## Messages

All UI labels are localized through SPFx `loc/` resources.

## Role

Designed for administrators and site/content owners who need evidence-backed governance decisions for GOV-08.
