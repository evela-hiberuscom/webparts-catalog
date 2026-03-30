# Project Intelligence

## Row Source
- `rowId`: receWSKQ5jpVtOdOt
- `name`: Mantenimientos programados
- `slug`: mantenimientos-programados
- `waveNumber`: 6

## Specification Review
- suficiencia: alta
- gaps detectados:
  - la row no fija nombres internos definitivos de columna para la lista
  - el feed `JsonUrl` no trae un endpoint concreto, solo el contrato
- supuestos:
  - `MaintenanceList` es la lista por defecto para el provisioning inicial
  - el mapping de lista usa `Title`, `StartAt`, `EndAt`, `Impact`, `Services`, `DetailUrl`
  - `JsonUrl` y `listTitleOrUrl` deben ser same-origin

## Inference Log
- observado:
  - el caso de uso es preventivo y pide destacar `inProgress`, luego `upcoming`
  - la row ya exige `hideCompleted`, fechas parciales y enlace opcional de detalle
- inferido:
  - el filtro de completados debe existir tanto como preferencia inicial de propiedad como control rapido en UI
  - los registros con fechas incompletas deben seguir visibles como `partialData`, no desaparecer
- pendiente de validar:
  - si la lista real almacenara `Services` como texto delimitado o como multiple line rich text
  - si el detalle abrira procedimiento tecnico o pagina de mantenimiento

## Risks
- los nombres internos finales de la lista podrian requerir ajuste de mapping
- el feed `JsonUrl` sigue pendiente de endpoint real
- las advertencias SSR de Fluent en tests de render estatico no bloquean, pero siguen siendo ruido conocido

## Error History
- `ISSUE-006`: scaffold validado en root correcto, sin carpeta anidada persistente
- `ISSUE-018`: el repositorio evita runtime import de `@microsoft/sp-http`
- `ISSUE-026`: `npm run build` queda normalizado con `build -> test -> package-solution`
- `ISSUE-029`: `listTitleOrUrl` normaliza URLs de vista `Forms/AllItems.aspx`
