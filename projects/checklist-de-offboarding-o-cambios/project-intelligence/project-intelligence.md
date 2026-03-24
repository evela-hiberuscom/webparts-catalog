# Project Intelligence

## Row Source
- `rowId`: `recVXCvX5ElPNmsj4`
- `name`: `Checklist de offboarding o cambios`
- `slug`: `checklist-de-offboarding-o-cambios`
- `waveNumber`: `4`
- `archetype`: `general`

## Specification Review
- `suficiencia`: suficiente para implementar un SPFx real con fuente `SharePointList | JsonUrl | StaticConfig`.
- `gaps detectados`: faltaba formalizar el comportamiento del filtro `generic`, el estado de error visible y la exposición local del contrato de diseño.
- `supuestos`: `generic` actúa como vista amplia, no como filtro restrictivo; la fuente principal por defecto es una lista SharePoint same-origin.

## Implementation Notes
- Se corrigió un patrón de scaffold anidado `projects/<slug>/<slug>` y el contenido quedó en la raíz real del proyecto.
- Se fijó `@fluentui/react` en `8.106.4` para recuperar `dist/sass/References.scss` y alinear el proyecto con el resto del monorepo.
- Se añadió una declaración local de módulo para `@paquete/spfx-common/utils` en `src/types/spfx-common.d.ts`.
- La vista final muestra fases, escenarios, criticidad, parcialidad y recursos relacionados con `createSafeExternalLink`.

## Inference Log
- `observado`: la row describe un checklist operativo con escenarios `offboarding`, `transfer`, `roleChange` y `generic`.
- `inferido`: cuando el origen es `SharePointList`, la UI debe mostrar todos los pasos por defecto y permitir filtrar por escenario/fase sin dejar vacía la vista inicial.
- `inferido`: los pasos sin escenario concreto o sin fase clara se normalizan a `generic` / `Sin fase` para evitar pérdidas de información.
- `pendiente de validar`: en producción, las URLs mismas origen en `JsonUrl` y `SharePointList` deberán revisarse contra la configuración final del sitio.

## Risks
- `console warnings` de Fluent UI por iconos no registrados en tests; no bloquean build ni paquete, pero conviene silenciarlos si se endurece la suite.
- El proyecto depende de que `webUrl`, `listTitleOrUrl` o `jsonUrl` sean same-origin cuando aplique.
- El estado `partialData` puede aparecer si faltan `scenario`, `phase` o `relatedUrl`, lo que es intencional para no ocultar incertidumbre.

## Error History
- `ISSUE-006`: se generó por anidación del scaffold. Resuelto moviendo el contenido a `projects/checklist-de-offboarding-o-cambios` y eliminando el subdirectorio duplicado.
- Error de resolución de `@fluentui/react/dist/sass/References.scss`: resuelto fijando `@fluentui/react@8.106.4`.
- Error de resolución de `@paquete/spfx-common/utils`: resuelto añadiendo `src/types/spfx-common.d.ts`.
- Error de tipado en tests del repositorio: resuelto ajustando el acceso al primer `mock call`.

## Validation
- `npm run build` ejecutado con éxito.
- `heft build`, `heft test` y `heft package-solution` completados sin errores.
- Paquete generado en `sharepoint/solution/checklist-de-offboarding-o-cambios.sppkg`.
