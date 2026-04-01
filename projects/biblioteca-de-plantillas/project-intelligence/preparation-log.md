# Preparation Log

- Project: biblioteca-de-plantillas
- Added local dependency: `@paquete/spfx-common`
- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`
- Forced `skipFeatureDeployment=false` in `config/package-solution.json` when present
- Injected ErrorBoundaryTitle/ErrorBoundaryMessage into: src\webparts\templatesLibrary\loc\en-us.js, src\webparts\templatesLibrary\loc\mystrings.d.ts