# Mockup Spec - Estado de servicios internos

## Objetivo

Permitir que una persona de operaciones vea en segundos el estado de servicios internos, con una jerarquía visual clara entre servicios críticos, avisos, mantenimiento y estados correctos.

## Referencias base

- [brand-profile.json](../../style-guide/brand-profile.json)
- [design-tokens.json](../../style-guide/design-tokens.json)
- [mockup-spec-spfx-portal.md](../../style-guide/mockup-spec-spfx-portal.md)
- [design-reference.json](./design-reference.json)

## Estructura

- cabecera con contexto y resumen
- barra de filtros y refresco
- tarjetas de servicio en grid responsivo
- footer operativo con última sincronización

## Estados

- `loading`: spinner y copy de consulta del origen
- `ready`: grid de tarjetas y acciones
- `partialData`: banner de datos parciales más tarjetas
- `empty`: mensaje de vacío seguro y reintento
- `error`: error legible y reintento

## Reglas visuales

- usar azul corporativo como base y el acento violeta solo para affordances
- mantener contraste AA en textos y badges
- mostrar estado con color y texto
- evitar jerarquías planas sin jerarquía funcional
- preservar foco visible en controles

## Responsive

- en pantallas amplias, grid de 3 o 4 columnas
- en pantallas medias, grid de 2 columnas
- en pantallas estrechas, lista vertical compacta

## Copy aprobado

- título: `Estado de servicios internos`
- mensaje de vacío: `No hay servicios para este filtro`
- mensaje parcial: `Algunos servicios tienen datos parciales, pero la vista sigue siendo utilizable.`
- mensaje de error: `No se ha podido cargar el estado de servicios`
