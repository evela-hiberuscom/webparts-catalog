# Implementation Notes

## Inferred behavior
- `SharePointList` es la fuente por defecto.
- `JsonUrl` debe permanecer en mismo origen y sin admitir protocolos peligrosos.
- `showResolved` oculta incidencias resueltas por defecto.
- `maxItems` se clampa para evitar una lista excesiva en el host.

## Data handling
- La UI no bloquea si faltan campos secundarios.
- Las incidencias parciales siguen mostrándose con aviso sutil.
- Los enlaces de detalle se sanearon antes de renderizarse.

## UI decisions
- Se adoptó una card compacta por incidencia con severidad y estado visibles.
- Se priorizó una lectura rápida frente a una densidad demasiado alta.
- Se mantienen los estados loading, empty, partialData y error como vistas explícitas.
