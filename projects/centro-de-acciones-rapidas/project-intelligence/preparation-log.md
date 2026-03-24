# Preparation Log

- Project: centro-de-acciones-rapidas
- Added local dependency: `@paquete/spfx-common`
- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`
- Forced `skipFeatureDeployment=false` in `config/package-solution.json`
- Flattened the generated scaffold from `projects/centro-de-acciones-rapidas/centro-de-acciones-rapidas` into the project root
- Added local contracts for `SharePointList`, `JsonUrl` and `StaticConfig`
