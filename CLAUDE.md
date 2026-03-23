# CLAUDE.md

Este archivo es el punto de entrada para Claude Code.

## Lee siempre primero

1. `AGENTS.md` como estándar técnico principal del repositorio.
2. `DESIGN.md` como estándar de diseño y UX.

## Regla de precedencia

1. Seguridad y plataforma (`AGENTS.md`) — nunca se anula
2. Capa gate de diseño (`DESIGN.md`)
3. Capa personal del proyecto (`DESIGN.md`)
4. Preferencias cosméticas

- Arquitectura, seguridad, permisos, testing, build, datos y estructura -> `AGENTS.md`
- UI, UX, formularios, estados, accesibilidad y patrones visuales -> `DESIGN.md` junto con `AGENTS.md`
- Si una preferencia del cliente entra en conflicto con restricciones de SPFx, React, Fluent UI o SharePoint, prevalece la capa gate de `DESIGN.md`

Si este archivo contradice a `AGENTS.md` o `DESIGN.md`, ignora este archivo y sigue los canónicos.

## Instrucciones operativas

- Analiza antes de cambiar
- Propón un plan breve
- Ejecuta cambios pequeños y verificables
- Valida con los scripts reales del repo
- No introduzcas librerías, permisos o cambios sensibles sin advertirlo
