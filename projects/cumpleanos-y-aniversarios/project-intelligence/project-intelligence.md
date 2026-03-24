# Project Intelligence

## Row Source
- `rowId`: recr2Cr1lD1C3JA6O
- `name`: Cumpleaños y aniversarios
- `slug`: cumpleanos-y-aniversarios
- `waveNumber`: 5
- `artifactType`: SPFxWebPart
- `archetype`: general

## Specification Review
- suficiencia: sufficient
- gaps detectados:
  - La fuente `Directory|SharePointList` no define campos físicos ni estrategia de fallback.
  - El contrato habla de `listTitleOrUrl`, pero no especifica si viene título, URL limpia o URL de vista.
  - El origen Directory no trae formato de transporte, así que se asume JSON same-origin configurable.
- supuestos:
  - `Directory` se resuelve como JSON same-origin opcional.
  - `SharePointList` acepta título o URL de vista same-origin.
  - La UI conserva registros parciales para no ocultar hitos con foto o tipo faltante.

## Inference Log
- observado:
  - El row trae ventana temporal, badges, copy y estados UI explícitos.
  - El scaffold inicial venía como sample genérico de Yeoman.
- inferido:
  - Se añadió `directoryJsonUrl` para soportar el modo Directory sin inventar acceso remoto.
  - Se normalizan URLs de lista tipo `.../Forms/AllItems.aspx` antes de consultar SharePoint.
  - La vista separa `Hoy`, `Próximos` y `Datos parciales` para mantener legibilidad.
- pendiente de validar:
  - El contrato de directorio real contra el origen operativo que alimentará esta solución.
  - El nombre exacto de columnas si el origen SharePointList no usa `Title`, `CelebrationType`, `CelebrationDate` y `PhotoUrl`.

## Risks
- El origen real podría usar otro esquema de campos y requerir mapeo adicional.
- Los feeds same-origin pueden quedar vacíos y dejar el bloque en `partialData` si no se configura el origen.

## Error History
- Scaffold Yeoman sustituido por implementación de dominio.
- Se documenta la normalización de URLs de vista para evitar el error de `GetList(@listUrl)` con `AllItems.aspx`.
