# Project Intelligence

## Row Source

- `rowId`: `recSZap19q7CuUs5R`
- `name`: `Microencuesta`
- `slug`: `microencuesta`
- `waveNumber`: `7`

## Specification Review

- suficiencia: suficiente para implementar la V1, pero la row original no detallaba claramente el contrato de persistencia de respuestas ni los casos de uso completos.
- gaps detectados:
  - faltaban `useCases` concretos para el flujo de respuesta y bloqueo de reenvio
  - no se especificaba un segundo origen de datos para respuestas en modo `SharePointList`
  - no existia detalle del payload API ni del fallback local para modo estatico
- supuestos:
  - `SharePointList` usa una lista de preguntas y otra lista de respuestas
  - si `listTitleOrUrl` es un titulo y `responsesListTitleOrUrl` no se informa, se infiere `<QuestionListTitle> Responses`
  - `ApiEndpoint` debe ser same-origin por gobernanza
  - `StaticConfig` persiste en `localStorage` para mantener submit funcional en demos

## Inference Log

- observado: la row describe una pregunta unica, submit ligero y bloqueo opcional por usuario, pero no define el almacenamiento de respuestas.
- inferido:
  - se amplian los `useCases` a:
    - mostrar pregunta activa
    - registrar respuesta valida
    - impedir doble respuesta cuando `oneResponsePerUser=true`
    - mostrar confirmacion o error sin abandonar la pagina
  - se anade `responsesListTitleOrUrl` al property pane como ampliacion necesaria para el modo SharePoint
  - el modo API reutiliza un endpoint same-origin para `GET` y `POST`
- pendiente de validar:
  - nombres exactos de columnas en las listas de produccion si difieren del provisioning propuesto
  - forma final del payload del endpoint API si se conecta contra un backend real

## Risks

- si la lista real no expone `IsActive`, `PollOptions` o los campos de respuesta documentados, habra que ajustar el mapeo del repositorio
- el modo API exige same-origin; cualquier endpoint cross-origin requeriria una decision de seguridad fuera del alcance actual

## Error History

- `ISSUE-006`: el scaffold SPFx creo un subdirectorio anidado y se normalizo al root del proyecto
- `ISSUE-018`: el acceso HTTP se aislo en el repositorio y el `SPHttpClient` real quedo solo en el web part
- `ISSUE-026`: el cierre se valida con la cadena `heft build --clean --production && heft test --production && heft package-solution --production`
- `ISSUE-029`: las URLs de lista tipo `Forms/AllItems.aspx` se normalizan antes de usar `GetList(@listUrl)`
