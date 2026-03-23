# Lanzador universal de accesos

Web part SPFx para exponer accesos corporativos con grid configurable, filtros por categoría y fallback local. La primera versión usa un catálogo JSON del panel de propiedades y deja preparada la transición a una `SharePoint List` mediante la misma arquitectura por capas.

## Implemented

- SPFx 1.22.2 con React 17 y Fluent UI v8
- `components`, `hooks`, `services`, `repositories`, `models` y `utils`
- dependencia local a `@paquete/spfx-common`
- estado `loading`, `empty`, `partialData` y `ready`
- tipografías documentadas como self-host dentro de cada proyecto

## Build

- `npm install`
- `heft test --clean --production`
- `heft package-solution --production`

Validated on 2026-03-23 with `npm run build` from the project root.

## Data strategy

La primera versión consume `launchItemsJson` desde el panel de propiedades y usa un catálogo de ejemplo si el JSON no existe o no es válido. El contrato de datos queda aislado en el repositorio y en el servicio para sustituirlo posteriormente por un origen SharePoint sin rehacer la UI.

## Fonts

Montserrat y Lato se deben alojar localmente dentro de `src/assets/fonts/` cuando el paquete de tipografías esté disponible. Mientras tanto, el stack cae a `Segoe UI` sin depender de CDN externas.
