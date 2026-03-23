# Project Intelligence

## Row Source
- `rowId`: recfiHUjaapUToQEr
- `name`: Lanzador universal de accesos
- `slug`: lanzador-universal-de-accesos
- `waveNumber`: 1

## Specification Review
- suficiencia: sufficient
- gaps detectados: ninguno bloqueante
- supuestos: primera versión consume `launchItemsJson` del panel de propiedades y usa catálogo local de respaldo hasta conectar una SharePoint List

## Inference Log
- observado: la row define un launcher corporativo con ordenación por prioridad, categorías, destacados y estados UI claros.
- inferido: el primer corte debe priorizar navegación rápida, filtros simples y tarjetas autocontenidas para evitar una experiencia densa.
- pendiente de validar: sustitución del JSON de propiedades por un repositorio real de SharePoint List en una siguiente ola.

## Risks
- La conexión real a `LauncherLinksList` no está implementada todavía.
- Las tipografías self-host aún no tienen los binarios `.woff2` en el proyecto.

## Validation
- `npm run build` completado con éxito.
- `heft test --clean --production` completado con 9 tests verdes.
- `heft package-solution --production` completado con `.sppkg` generado.
- Warnings de lint no bloqueantes por uso de `null` en `launchModels.ts` y `launchRepository.ts`.

## Error History
- ISSUE-003: scaffold con `shell:true` rompía argumentos en `yo`.
- ISSUE-004: `yo.cmd` no resolvía bien bajo `spawnSync` en Windows.
- ISSUE-005: el scaffold debía invocarse vía PowerShell en Windows.
- ISSUE-006: el generador creó un subdirectorio adicional y hubo que aplanar el resultado al root del proyecto.
- ISSUE-008: el helper compartido de estado parcial requería mapear `hasPartialData` a `isPartial`.
- ISSUE-009: lint dejó warnings no bloqueantes por `null` en el modelo y el repositorio.
