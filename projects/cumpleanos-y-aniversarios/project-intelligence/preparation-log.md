# Preparation Log

- Project: cumpleanos-y-aniversarios
- Added local dependency: `@paquete/spfx-common`
- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`
- Forced `skipFeatureDeployment=false` in `config/package-solution.json` when present
- Scaffold flattened at the project root and the Yeoman sample was replaced with a domain implementation.
- Added inferred `directoryJsonUrl` support to cover the Directory source without inventing remote APIs.
