# Preparation Log

- Project: pregunta-destacada
- Added local dependency: `@paquete/spfx-common`
- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`
- Forced `skipFeatureDeployment=false` in `config/package-solution.json` when present
- Injected ErrorBoundaryTitle/ErrorBoundaryMessage into: src\webparts\featuredQuestion\loc\en-us.js, src\webparts\featuredQuestion\loc\mystrings.d.ts