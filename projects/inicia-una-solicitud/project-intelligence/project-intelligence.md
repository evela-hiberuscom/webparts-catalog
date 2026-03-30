# Project Intelligence

## Summary

Launcher SPFx para iniciar solicitudes corporativas desde un catalogo SharePoint, JSON same-origin o configuracion local.

## Decisions

- `ISSUE-006`: el scaffold se genero con el script del repo y no se dejo nested folder anidado.
- `ISSUE-018`: `@microsoft/sp-http` se usa solo en el repositorio; componentes, hooks y servicios permanecen desacoplados.
- `ISSUE-026`: el pipeline final es `build -> test -> package`.
- `ISSUE-029`: `listTitleOrUrl` acepta titulo de lista o URL de `AllItems.aspx` y se normaliza antes de construir el endpoint.

## Notes

- Las tarjetas sin enlace principal se muestran como informativas, no accionables.
- Las descripciones o prerequisitos ausentes degradan a `partialData`.
- El origen JSON y el origen SharePoint comparten la misma normalizacion de items.

## Risks

- El catalogo real debe tener categorias y enlaces bien configurados para evitar estados parciales.
- Si la lista real usa campos con nombres distintos, habra que ampliar el mapeo de columnas.
