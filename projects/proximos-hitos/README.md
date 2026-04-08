# proximos-hitos

Web part SPFx para mostrar hitos y entregables próximos en formato timeline o lista.

## Capacidades

- Lee hitos desde una lista de SharePoint.
- Normaliza fecha, tipo/fase y enlace de detalle.
- Ordena por fecha ascendente, dejando los hitos sin fecha al final.
- Resalta hitos próximos y expone estados `loading`, `empty`, `partialData` y `error`.

## Configuración

- `title`
- `description`
- `listTitleOrUrl`
- `maxItems`
- `viewMode`

## Validación

- `npm run build`
