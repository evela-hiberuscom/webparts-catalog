# Project Intelligence

## Row Source
- `rowId`: rec606dhNoZcBWUIG
- `name`: Buzón de ideas
- `slug`: buzon-de-ideas
- `waveNumber`: 4

## Specification Review
- suficiencia: parcial, pero suficiente para implementar con inferencias seguras
- gaps detectados: `useCases`
- supuestos:
  - el formulario es ligero, de un solo bloque, con envío directo al origen configurado
  - `JsonBridge` es un endpoint same-origin de integración que acepta el mismo payload que `ApiEndpoint`
  - el título es obligatorio; descripción y categoría son opcionales
  - `allowAnonymous` controla si `submittedBy` se envía o no
  - `showCategory` solo afecta a la UI; si está desactivado, la categoría no viaja en el payload

## Inference Log
- observado:
  - la row define objetivos, estados UI, reglas de negocio, aceptación y contrato técnico base
  - la salida esperada es un envío único con estados `idle`, `submitting`, `success`, `validationError` y `submitError`
  - la persistencia remota puede ser SharePoint o endpoint same-origin
- inferido:
  - casos de uso primarios: capturar una idea, enviarla al origen configurado y conservar el texto si falla el submit
  - esquema de envío: `Title`, `Description`, `Category`, `SubmittedBy`, `SubmittedAt`, `SourceType`, `PageUrl`
  - `SharePointList` acepta nombre de lista o URL same-origin de vista; las URLs de `Forms/AllItems.aspx` se normalizan al root de la lista
  - el envío anónimo se modela como omitir `SubmittedBy` en el payload, no como un permiso especial
- pendiente de validar:
  - el schema final de columnas de `IdeasList` en SharePoint
  - si `JsonBridge` debe devolver solo ACK o también un id de seguimiento
  - si el cliente quiere taxonomía cerrada de categorías o entrada libre

## Risks
- La solución depende de que exista una lista SharePoint o endpoint same-origin realmente configurado.
- Si el backend devuelve error, el draft debe permanecer intacto para no perder la idea del usuario.
- La categoría es opcional y libre; si el cliente necesita normalizarla más adelante, habrá que añadir validación adicional.

## Error History
- ISSUE-006: el scaffold generó un subdirectorio anidado y hubo que mover el contenido al root real del proyecto.
