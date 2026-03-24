# Estado de proyectos

Web part SPFx para mostrar un resumen compacto del estado de iniciativas.

## Fuentes soportadas

- `StaticConfig` para vista local o datos de arranque.
- `SharePointList` para una lista `ProjectsList` o equivalente.
- `JsonUrl` para una URL same-origin con un array de proyectos.
- `Planner` como contrato explícito no habilitado en este proyecto.

## Configuración principal

- Título y subtítulo de cabecera.
- Tipo de origen de datos.
- Lista o URL de origen.
- Filtro inicial por estado.
- Número máximo de elementos visibles.
- Mostrar o no el responsable.

## Criterios de diseño

- Estados visibles: `loading`, `ready`, `empty`, `partialData`, `error`.
- Orden por severidad y fecha próxima.
- Estados con texto además de color.
- Interacción accesible mediante Fluent UI.

## Documentación local

- Especificación visual y decisiones de UI en `project-intelligence/mockup-spec.md`.
- Traza de enriquecimiento y supuestos en `project-intelligence/project-intelligence.md`.
