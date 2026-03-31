# Project Intelligence

## Row Source

- `rowId`: `reckRsMhPOJPL7QqX`
- `name`: `Mis aprobaciones`
- `slug`: `mis-aprobaciones`
- `waveNumber`: `7`

## Specification Review

- suficiencia: `sufficient`
- gaps detectados: ninguno bloqueante
- supuestos:
  - la V1 prioriza aprobaciones vencidas, de hoy y próximas
  - `Approvals` puede degradar a origen JSON same-origin si no hay conector real en entorno local
  - `SharePointList` usa título o URL de lista y normaliza `AllItems.aspx`

## Inference Log

- observado:
  - la fila define tres orígenes compatibles
  - el proyecto requiere apertura de detalle pero no edición inline
  - el host debe tolerar datos parciales sin romper la UI
- inferido:
  - el UI necesita un resumen con conteos y una lista de tarjetas
  - el proyecto debe ocultar completadas por defecto
  - la acción principal debe ser abrir el detalle en una nueva pestaña cuando exista URL segura
- pendiente de validar:
  - shape exacto del conector real `Approvals`
  - nombres definitivos de columnas en la lista de SharePoint del tenant

## Risks

- `JsonUrl` se limita a same-origin o rutas relativas por seguridad.
- Si el origen real devuelve un shape distinto, será necesario ajustar el repositorio sin tocar la UI.
- La web part degrada a `partialData` si faltan URL, solicitante o fecha.

## Error History

- `ISSUE-006`: no crear scaffolds anidados.
- `ISSUE-018`: `@microsoft/sp-http` se mantiene aislado en repositorios y sus tests se mockean.
- `ISSUE-026`: el gate real es `heft build --clean --production && heft test --production && heft package-solution --production`.
- `ISSUE-029`: normalización de `listTitleOrUrl` desde URL de SharePoint y `AllItems.aspx`.
