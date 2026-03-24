# Buscador de recursos corporativos

Web part SPFx para encontrar políticas, plantillas, procedimientos y manuales desde una caja unificada. La solución usa React, Fluent UI, hooks, servicios y repositorios por capas, con soporte para `SearchAPI`, `SharePointList`, `SharePointLibrary` y `JsonUrl` same-origin.

## Build

```bash
npm run build
```

## Configuración

- `title`
- `subtitle`
- `dataSourceTypesCsv`
- `listTitleOrUrl`
- `searchScopeUrl`
- `showFeaturedWhenEmpty`
- `maxItems`

## Estados

- `idle`
- `loading`
- `ready`
- `empty`
- `partialData`
- `error`

## Notas

- `SearchAPI` se usa para consultas rápidas sobre el índice de SharePoint.
- `SharePointList` y `SharePointLibrary` aceptan título o URL same-origin de la lista o biblioteca.
- `JsonUrl` solo admite URLs same-origin o relativas.

