# Mockup Spec

## Objetivo visual

Presentar una experiencia de búsqueda compacta, contextual y rápida, con jerarquía clara entre caja de búsqueda, filtros y resultados.

## Estructura

- Hero con título, subtítulo y metadatos de origen.
- Barra de búsqueda con acción de refresco.
- Panel de filtros para tipo y categoría.
- Surface de estado para `idle`, `loading`, `empty`, `partialData` y `error`.
- Lista de resultados con tarjetas compactas y acciones seguras.

## Estados

- `idle`: texto guía para empezar a buscar.
- `loading`: spinner y estado de consulta.
- `ready`: resultados ordenados y filtrables.
- `empty`: mensaje de no coincidencias.
- `partialData`: aviso de resultados incompletos.
- `error`: mensaje seguro sin exposición de detalles técnicos.

## Reglas de diseño

- Priorizar legibilidad y escaneo rápido.
- Usar badges ligeros para tipo, categoría y coincidencias exactas.
- Mantener la experiencia usable en vista estrecha.
- No mostrar enlaces accionables cuando el recurso no tenga URL segura.

