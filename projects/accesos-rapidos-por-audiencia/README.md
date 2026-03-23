# accesos-rapidos-por-audiencia

Web part SPFx para mostrar accesos distintos según audiencia, perfil o contexto de usuario. La implementación actual resuelve audiencia con contexto local de SharePoint, aplica fallback genérico, permite filtrar por categoría y modela de forma explícita los estados `loading`, `partialData`, `empty` y `error`.

## Stack

- SharePoint Framework `1.22.2`
- React `17.0.1`
- Fluent UI v8
- `@paquete/spfx-common` en CommonJS
- TypeScript estricto
- Jest con Heft

## Qué hace

- Muestra accesos contextualizados por audiencia.
- Resuelve tokens desde el perfil del usuario y grupos del sitio cuando SharePoint los expone.
- Usa catálogo interno solo cuando `dataSourceType` es `StaticConfig`.
- Devuelve `empty` real cuando la fuente responde sin registros.
- Devuelve `error` real cuando la lista o el feed no se pueden leer.
- Permite filtrar por categoría.
- Expone estados `loading`, `partialData`, `empty` y `error`.

## Configuración del web part

- `title`: título visible.
- `description`: subtítulo o copy de apoyo.
- `dataSourceType`: `StaticConfig`, `SharePointList` o `JsonUrl`.
- `listTitleOrUrl`: nombre de la lista SharePoint o URL JSON, según el origen.
- `audienceMode`: `group`, `department`, `country`, `role` o `hybrid`.
- `defaultCategory`: categoría seleccionada al cargar.
- `maxItems`: límite de elementos solicitados.
- `showAudienceHint`: muestra los tokens de audiencia resueltos.

## Fuentes de datos

- `StaticConfig`: catálogo interno de ejemplo para workbench y fallback.
- `SharePointList`: lista SharePoint con columnas `Title`, `Category`, `Icon`, `Description`, `OpenUrl`, `Audiences`, `IsGeneric` y `Priority`.
- `JsonUrl`: feed JSON compatible con el mismo modelo de items, restringido al mismo origen que el web part.

## Inferencias

- observado: la row fuente ya definía objetivo, reglas de negocio, estados y criterios de aceptación.
- inferido: el proyecto necesita una fuente interna de reserva para no depender de configuración manual en la primera carga.
- inferido: el contexto de usuario puede resolverse con heurísticas del perfil de SharePoint y grupos del sitio sin añadir dependencias nuevas.
- pendiente de validar: el equipo de contenido puede usar exactamente los nombres internos de campo previstos o requerirá un mapeo adicional.

## Validación

La solución está pensada para validarse con los scripts reales del proyecto:

- `npm run build`
- `npx heft test --clean --production`
- `npx heft package-solution --production`

El paquete `.sppkg` se genera en `sharepoint/solution/`.
