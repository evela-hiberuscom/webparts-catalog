# Noticias por área

Web part SPFx para mostrar noticias relevantes de un área o etiqueta concreta en páginas departamentales o temáticas.

## Capacidades

- Filtra noticias por área o etiqueta normalizada.
- Soporta `SharePointNews`, `SharePointList` y `JsonUrl`.
- Ordena por fecha y puede destacar la primera noticia.
- Gestiona estados `loading`, `empty`, `partialData` y `error`.

## Arquitectura

- `components/`: UI principal y `WebPartErrorBoundary`.
- `hooks/`: carga reactiva con recarga manual.
- `services/`: reglas de orquestación y estados.
- `repositories/`: acceso a SharePoint y feeds JSON.
- `utils/`: filtrado, normalización y formateo.

## Validación

- `npm run build`
