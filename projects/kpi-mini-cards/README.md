# KPI mini-cards

SPFx web part for compact KPI dashboards. The component renders a small set of metric cards with trend indicators, comparison text, state badges, sanitized open links, and responsive layouts.

## Source types

- `StaticConfig`: default JSON stored in the web part properties.
- `SharePointList`: read items from a SharePoint list.
- `JsonUrl`: load a JSON payload from a configured URL.
- `ApiEndpoint`: load KPI data from an API endpoint.

## Run

- `npm install`
- `npm run build`

## Notes

- The visual language follows the Hiberus style guide extracted in `style-guide/`.
- Missing trend or comparison data is treated as partial data, not a fatal error.
- `openUrl` is sanitized before rendering.

