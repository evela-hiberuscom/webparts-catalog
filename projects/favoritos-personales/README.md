# favoritos-personales

## Summary

Web part SPFx para lanzar favoritos personales con grid responsivo, estados `loading`/`empty`/`partialData`/`error` y fallback estático configurable desde propiedades.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.22.2-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- SharePoint Online / SPFx 1.22.2
- El paquete local `@paquete/spfx-common` se consume por `file:../../packages/spfx-common`

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| favoritos-personales | Codex |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.0     | 2026-03-23       | Initial implementation for Airtable row `Favoritos personales` |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- From the solution folder run `npm install` and then `npm run start`
- Use the property pane to set `dataSourceType`, `listTitleOrUrl`, `maxItems` and optional `favoritesJson`
- `npm run build` produces the package and runs tests

## Features

This web part illustrates:

- layered SPFx architecture with service and repository separation
- local package reuse via `@paquete/spfx-common`
- personal launcher UX with pill cards and responsive grid
- safe external links and partial-data handling

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
- [Heft Documentation](https://heft.rushstack.io/)
