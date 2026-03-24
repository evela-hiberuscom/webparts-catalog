# Centro de acciones rápidas

Web part SPFx para concentrar acciones corporativas frecuentes en una superficie compacta y reusable. El componente soporta catálogo desde `SharePointList`, `JsonUrl` same-origin o `StaticConfig`, con orden por prioridad, filtrado por categoría y enlaces saneados.

## Implemented

- SPFx 1.22.2 con React 17 y Fluent UI v8
- `components`, `hooks`, `services`, `repositories`, `models`, `utils`
- dependencia local a `@paquete/spfx-common`
- estados `loading`, `ready`, `partialData`, `empty` y `error`
- filtro por categoría y cards compactas con fallback visual controlado

## Build

- `npm install`
- `npm run build`

## Data strategy

El origen principal es `QuickActionsList` en SharePoint. `JsonUrl` queda restringido a same-origin y `StaticConfig` permite un catálogo de ejemplo para workbench o configuración inicial. Las acciones sin enlace se mantienen visibles, pero no accionables.
