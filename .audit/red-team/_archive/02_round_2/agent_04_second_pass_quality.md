# RONDA 2 — Agent 04 — Calidad

## Reanálisis

- hardcoded UI strings confirmados pese a loc files.
- catchSwallow=71, anyUsage=23, consoleErrorWarn=61, todoFixme=29.
- No es solo estética: afecta localización, soporte, accesibilidad y coherencia de producto.

## Severidad ajustada

- Hardcoded strings: Low/Medium según proyecto.
- Catch silenciosos: Medium.
- any usage: Low.

## Recomendaciones

Backlog progresivo por top proyectos, lint para no-empty catch, DTOs SharePoint tipados y tests negativos.
