# Conoce al equipo

Web part SPFx para presentar a las personas de un equipo con foto, rol, bio breve y enlace de perfil o contacto.

## Stack

- SharePoint Framework 1.22.2
- React 17
- Fluent UI v8
- TypeScript estricto
- `@paquete/spfx-common`

## Datos

La web part admite estas fuentes:

- `StaticConfig`
- `SharePointList`
- `JsonUrl`
- `Directory`

El orden de resolución se controla con `dataSourceTypesCsv`. Por defecto se intenta `SharePointList`, luego `JsonUrl`, después `Directory` y por último `StaticConfig` para que el proyecto siga funcionando aunque todavía no exista una lista real.

## Comandos

- `npm run build`
- `npm run start`
- `npm run clean`

## Notas de implementación

- `listTitleOrUrl` soporta título de lista o URL same-origin.
- Las URLs de vista como `/Forms/AllItems.aspx` se normalizan antes de llamar a `GetList(@listUrl)`.
- Las URLs inseguras o cross-origin se rechazan.
- Si `Directory/API` no tiene endpoint configurado, la cadena de fuentes sigue hasta `StaticConfig`, que actúa como fallback seguro.

## Estados de UI

- `loading`
- `ready`
- `empty`
- `partialData`
- `error`

## Provisioning

Consulta [`provisioning/provisioning-definition.json`](./provisioning/provisioning-definition.json).
