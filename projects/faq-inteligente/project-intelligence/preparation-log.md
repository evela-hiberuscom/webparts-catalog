# Preparation Log

- Project: faq-inteligente
- Added local dependency: `@paquete/spfx-common`
- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`
- Forced `skipFeatureDeployment=false` in `config/package-solution.json` when present
- Injected ErrorBoundaryTitle/ErrorBoundaryMessage into: src\webparts\smartFaq\loc\en-us.js, src\webparts\smartFaq\loc\mystrings.d.ts