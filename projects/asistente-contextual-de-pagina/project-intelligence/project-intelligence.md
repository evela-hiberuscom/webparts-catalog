# Project Intelligence

## Row Source
- `rowId`: reciRdVyy2qbjxn0a
- `name`: Asistente contextual de página
- `slug`: asistente-contextual-de-pagina
- `waveNumber`: 3

## Specification Review
- suficiencia: parcial
- gaps detectados: `useCases`, `dataSource`
- supuestos:
  - el asistente se presenta como bloque contextual plegable en la página;
  - la ayuda puede salir de una lista SharePoint, una URL JSON same-origin o una configuración estática;
  - el fallback por defecto es `generic` para no dejar la experiencia vacía cuando hay contexto aplicable.

## Inference Log
- observado:
  - la row ya define objetivo, estados UI, reglas de negocio y criterios de aceptación;
  - el design local pide trigger, mensaje y enlaces relacionados;
  - el contrato técnico menciona `SPFx React + context resolver + help repository`.
- inferido:
  - `dataSourceType` debe soportar `SharePointList`, `JsonUrl` y `StaticConfig`;
  - `listTitleOrUrl` debe aceptar título o URL same-origin;
  - `fallbackMode` debe separar `generic` de `empty`;
  - `collapsedByDefault` debe permitir un bloque compacto por defecto.
- pendiente de validar:
  - nombre real de la lista SharePoint que servirá como catálogo de ayuda;
  - formato real de los enlaces relacionados cuando se conecte la fuente definitiva.

## Risks
- `JsonUrl` debe mantenerse same-origin para no abrir superficie remota innecesaria.
- El fallback `generic` no debe ocultar un `empty` real cuando la configuración lo pida.
- Si la lista real no respeta los nombres de campo esperados, habrá que ajustar el mapper sin romper el contrato.

## Error History
- Scaffold SPFx generado desde el helper del repo.
- El scaffold vino con defaults genéricos y se sustituyó por una implementación de ayuda contextual real.
