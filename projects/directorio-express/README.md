# Directorio express

Web part SPFx para localizar personas por nombre, rol, área o dato básico de contacto.

## Fuentes de datos

- `Directory` para búsqueda de personas vía SharePoint search.
- `SharePointList` para directorios curados o listas de personas.
- `JsonUrl` para orígenes same-origin en JSON.
- `StaticConfig` para una lista estática en configuración.

## Contrato funcional

- Búsqueda priorizando coincidencias exactas por nombre.
- Filtro opcional por área.
- Estados: `loading`, `ready`, `empty`, `partialData` y `error`.
- Acciones seguras para abrir perfil y enviar correo.

## Validación

- `npm run build`
- `npm run build` deja generado el `.sppkg` en `sharepoint/solution/`
