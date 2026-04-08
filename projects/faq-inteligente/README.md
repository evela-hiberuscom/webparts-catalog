# faq-inteligente

Web part SPFx para exponer FAQs desde una lista de SharePoint con buscador ligero, filtro por categoría y acordeón accesible.

## Capacidades

- Lee preguntas frecuentes desde una lista de SharePoint.
- Normaliza pregunta, respuesta, categoría, alias, enlace relacionado y marca destacada.
- Permite búsqueda por pregunta, respuesta y alias.
- Permite filtrar por categoría.
- Expande y contrae cada respuesta de forma accesible.

## Configuración

- `title`
- `description`
- `listTitleOrUrl`
- `defaultCategory`
- `enableSearch`
- `maxItems`

## Alcance recortado

Esta V1 usa `SharePoint List` como fuente real. `JsonUrl` y `StaticConfig` quedan fuera por ahora y se documentan como ampliaciones futuras.

## Validación

- `npm run build`
