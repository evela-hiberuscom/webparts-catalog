# Barra de avisos urgentes

Web part SPFx para mostrar alertas críticas, warning o informativas con vigencia temporal, prioridad y CTA opcional.

## Stack
- SPFx 1.22.2
- React 17
- Fluent UI v8
- TypeScript estricto

## Origen de datos
- `SharePointList`
- `JsonUrl` same-origin
- `StaticConfig`

## Reglas funcionales
- Solo se muestran avisos vigentes.
- `critical` prevalece sobre `warning`, `info` y `unknown`.
- `ctaUrl` se sanea y solo se acepta same-origin o relativa.
- `startAt` y `endAt` ausentes implican `partialData`.
- Un payload malformado produce `error`, no `empty`.

## Comandos
- `npm run build`
- `npm run start`
- `npm run clean`

## Notas de diseño
- La identidad visual sigue el análisis Hiberus del repo.
- Se usan contenedores redondeados, Montserrat para titulares y Lato para cuerpo.
- El proyecto no depende de CDNs externas para funcionar.

