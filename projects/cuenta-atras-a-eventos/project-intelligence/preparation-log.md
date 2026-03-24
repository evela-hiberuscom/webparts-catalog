# Preparation Log

- Project: `cuenta-atras-a-eventos`
- Scaffold moved to the project root after `yo @microsoft/sharepoint` created a nested folder.
- Local shared package: `@paquete/spfx-common`
- Build gate: `heft build --clean --production && heft test --production && heft package-solution --production`
- Runtime contract:
  - `StaticConfig`, `SharePointList` and `JsonUrl`
  - same-origin enforcement for remote URLs
  - countdown states: `countdown`, `live`, `completed`, `unknown`
