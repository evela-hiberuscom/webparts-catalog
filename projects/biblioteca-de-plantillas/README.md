# biblioteca-de-plantillas

Web part SPFx para exponer un catálogo de plantillas oficiales almacenadas en una lista o biblioteca de SharePoint.

## Capacidades

- Lee plantillas desde una biblioteca documental o una lista de catálogo.
- Normaliza `tipo`, `categoría`, `openUrl` y `downloadUrl`.
- Permite buscar y filtrar por categoría y tipo.
- Ordena destacadas primero, luego categoría y título.
- Soporta estados `loading`, `empty`, `partialData` y `error`.

## Configuración

- `title`
- `description`
- `sourceKind`
- `listTitleOrUrl`
- `defaultCategory`
- `maxItems`

## Validación

- `npm run build`
