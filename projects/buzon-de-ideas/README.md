# Buzón de ideas

Web part SPFx para recoger ideas o propuestas breves desde la intranet con un formulario ligero, validación clara y envío a `SharePointList`, `ApiEndpoint` o `JsonBridge`.

## Qué hace

- Captura título, descripción opcional y categoría opcional.
- Valida y sanea el texto antes de enviar.
- Mantiene el draft intacto si el submit falla.
- Soporta modo anónimo opcional y estados `idle`, `submitting`, `success`, `validationError` y `submitError`.

## Contrato de datos

- `SharePointList`: usa `listTitleOrUrl` y normaliza URLs de vista same-origin a la raíz de la lista.
- `ApiEndpoint` y `JsonBridge`: usan `endpointUrl` same-origin o relativo.
- Payload enviado: `Title`, `Description`, `Category`, `SubmittedBy`, `SubmittedAt`, `SourceType` y `PageUrl`.

## Desarrollo

- `npm install`
- `npm run build`

## Documentación local

- [project-intelligence/project-intelligence.md](./project-intelligence/project-intelligence.md)
- [design/design-reference.json](./design/design-reference.json)
- [provisioning/provisioning-definition.json](./provisioning/provisioning-definition.json)
