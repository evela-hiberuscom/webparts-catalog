# Mini organigrama

SPFx web part for a lightweight organizational view. It can resolve hierarchy data from a directory endpoint, a SharePoint list, a same-origin JSON payload or static JSON config.

## Config

Default properties are exposed in the property pane:

- data source types
- root person ID
- list title or URL
- directory endpoint
- JSON URL
- static JSON config
- view mode
- max depth

## Build

```powershell
npm run build
```

This runs:

1. `heft build --clean --production`
2. `heft test --production`
3. `heft package-solution --production`

## Notes

- `ISSUE-006` scaffold root normalization has been applied.
- `ISSUE-018` Jest mocks are used for `@microsoft/sp-http` in tests.
- `ISSUE-026` build/test/package order is preserved.
- `ISSUE-029` normalizes list URLs ending in `Forms/AllItems.aspx` or `AllItems.aspx`.

