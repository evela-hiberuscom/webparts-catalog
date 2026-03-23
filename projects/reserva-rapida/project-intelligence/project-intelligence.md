# Project Intelligence

- `inference-notes.md` documents the fallback schema and the assumptions used while the SharePoint source is not fully known.

## Row Source

- `rowId`: `rec0FWy077HG4YE7v`
- `name`: `Reserva rápida`
- `slug`: `reserva-rapida`
- `waveNumber`: `1`

## Specification Review

- suficiencia: suficiente para implementar launcher, filtros y estados reales.
- gaps detectados: el esquema real de lista no está cerrado y `JsonUrl` necesitaba restricción explícita.
- supuestos: `BookingResourcesList` puede mapear `Title`, `Category`, `Site`, `BookingUrl`, `Availability`, `Rules`, `Featured` y `Priority`.

## Inference Log

- observado: la UI anterior mezclaba estado vacío con contenido y dependía de un fallback estático implícito.
- inferido: el filtro por sede debe vivir en la UI y en el servicio para no depender de la configuración inicial.
- pendiente de validar: si la lista real usa nombres de columna distintos, habrá que ajustar el mapping del repositorio.

## Risks

- `JsonUrl` solo debe usarse con rutas relativas o URLs del mismo origen.
- La cobertura del flujo de render y del repositorio depende de mocks de `fetch` estables en Jest.
- Si el listado real cambia de esquema, el mapeo OData deberá revisarse sin tocar el contrato visual.

## Error History

- No demo fallback for empty or failing sources.
- External hosts are rejected for `JsonUrl`.

