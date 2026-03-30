# Mockup Spec

## Objetivo visual

- Encontrar a una persona en segundos con una interfaz ligera, clara y apta para convivir con otras piezas de SharePoint.
- Priorizar la búsqueda por nombre y una lista escaneable de personas con acciones directas.

## Estructura

- Cabecera con título, subtítulo y contador de resultados.
- Barra de búsqueda con refresco manual.
- Filtro opcional por área.
- Lista de personas en tarjetas compactas.
- Estados diferenciados: loading, ready, empty, partialData y error.

## Comportamiento visual

- En ancho estrecho, el nombre y el cargo se mantienen por delante de acciones secundarias.
- El avatar se degrada a iniciales o ausencia de foto sin romper el layout.
- Los estados parciales se marcan con badge y mensaje de aviso no bloqueante.

## Referencias

- `../../style-guide/brand-profile.json`
- `../../style-guide/design-tokens.json`
- `../../style-guide/component-inventory.json`
- `../../style-guide/mockup-spec-spfx-portal.md`

