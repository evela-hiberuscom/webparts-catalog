# Project Intelligence

## Row Source
- `rowId`: recCKDr21DGQb4uKd
- `name`: Estado de incidencias destacadas
- `slug`: estado-de-incidencias-destacadas
- `waveNumber`: 2

## Specification Review
- suficiencia: suficiente
- gaps detectados: ninguno bloqueante. La row define objetivo, estados, reglas de filtro y origen de datos.
- supuestos: `SharePointList` es la fuente por defecto; `JsonUrl` queda restringido a mismo origen; `resolved` se oculta salvo flag.

## Inference Log
- observado: la prioridad funcional es lectura rápida de incidencias activas y monitorizadas, con workaround y ETA visibles.
- inferido: los campos opcionales pueden faltar sin romper la UI; se muestran avisos de datos parciales y cards compactas en anchos reducidos.
- pendiente de validar: la forma exacta de la lista `IncidentsList` en SharePoint y si algunas instalaciones usarán JSON mismo origen como fuente alternativa.

## Risks
- Si la lista real no expone campos con nombres cercanos a `Title`, `Severity`, `Status`, `Workaround`, `ETA` y `DetailUrl`, el mapeo necesitará ajustes.
- `JsonUrl` debe seguir siendo mismo origen para no abrir una superficie de seguridad innecesaria.

## Error History
- Sin errores funcionales bloqueantes en esta ola. El principal riesgo residual está en el contrato real de origen de datos.
