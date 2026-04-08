# glosario-corporativo

Web part SPFx para consultar un glosario corporativo de términos, siglas y nombres de sistemas desde una lista de SharePoint.

## Capacidades

- Carga términos desde una lista de SharePoint.
- Búsqueda por término o alias.
- Filtrado por categoría.
- Navegación alfabética opcional.
- Estados `loading`, `empty`, `partialData` y `error`.
- Error boundary, localización `es-es/en-us` y tests unitarios de utilidades, repositorio, servicio, hook y componente.

## Configuración

- `title`: título del bloque.
- `description`: texto de apoyo.
- `listTitle`: nombre de la lista del glosario.
- `defaultCategory`: categoría de relleno cuando falta el dato.
- `maxItems`: número máximo de términos.
- `enableAlphabetNav`: activa o desactiva la navegación alfabética.

## Fuente de datos

Esta implementación usa `SharePoint List`. Se ha dejado fuera `JsonUrl` y `StaticConfig` para mantener la primera versión alineada con la fuente real del repositorio.

## Validación

- `npm run build`
