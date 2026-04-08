# pregunta-destacada

Web part SPFx para destacar una única pregunta editorial o de engagement dentro de una página de SharePoint. Soporta carga desde configuración estática, lista de SharePoint o JSON del mismo origen.

## Funcionalidad

- Muestra una pregunta principal con contexto opcional, categoría y autor.
- Presenta respuestas posibles con opción de mostrar votos.
- Gestiona estados `loading`, `empty`, `partialData` y `error`.
- Incluye `WebPartErrorBoundary`, localización `es-es` y `en-us`, y pruebas Jest para repositorio, servicio, hook y componente.

## Configuración

- `dataSourceType`: `StaticConfig`, `JsonUrl` o `SharePointList`
- `listTitleOrUrl`: título o URL de la lista / JSON
- `showVotes`: activa el conteo de votos en la UI

## Validación

Comando principal del proyecto:

```bash
npm run build
```
