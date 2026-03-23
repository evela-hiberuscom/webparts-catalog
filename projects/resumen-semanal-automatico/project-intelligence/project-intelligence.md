# Project Intelligence

## Row Source
- `rowId`: rec2f4QevJzBr8wye
- `name`: Resumen semanal automático
- `slug`: resumen-semanal-automatico
- `waveNumber`: 1

## Specification Review
- suficiencia: suficiente
- gaps detectados: fuente exacta de producción y validación final de copia
- supuestos: currentWeek/previousWeek/customRange, partialData tolerado y visual compacta tipo digest

## Inference Log
- observado: la row define un resumen semanal con foco en noticias, hitos e incidencias
- inferido: la UI debe priorizar cards compactas, estado parcial y navegación simple
- pendiente de validar: mapeo exacto de cada fuente a SharePoint o news

## Risks
- La fuente real puede requerir un adaptador distinto al repositorio estático usado en scaffolding.
- El copy final puede requerir ajuste tras validación funcional.

## Error History
- React 17 no admite `startTransition`; el hook debe usar actualizaciones directas.
- La comparación de fechas debe hacerse por clave de calendario para evitar drift por zona horaria.
