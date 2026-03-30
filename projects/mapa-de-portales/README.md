# mapa-de-portales

SPFx web part para representar la estructura lógica de hubs, sites, áreas y utilidades de la intranet como un mapa navegable.

## Stack

- SharePoint Framework 1.22.2
- React 17
- Fluent UI 8
- `@paquete/spfx-common`

## Origen de datos

- `StaticConfig`
- `SharePointList`
- `JsonUrl`

Las fuentes remotas deben ser same-origin o relativas. Las URLs de lista pegadas desde `AllItems.aspx` se normalizan antes de construir la llamada REST.

## Estados

- `loading`
- `ready`
- `partialData`
- `empty`
- `error`

## Notas funcionales

- Soporta tres modos de visualización: `tree`, `grouped` y `cards`.
- Si hay ciclos de jerarquía, la vista árbol degrada automáticamente a agrupada.
- Los nodos sin URL válida se mantienen como informativos y provocan `partialData`.
- Los nodos huérfanos se promueven a raíz en lugar de ocultarse.

## Build

```powershell
npm run build
```

El script ejecuta `heft build --clean --production`, `heft test --production` y `heft package-solution --production`.
