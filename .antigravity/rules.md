# Reglas de entrada para Antigravity

Usa los siguientes archivos como fuentes canónicas:

- `AGENTS.md` para reglas técnicas, proceso, seguridad, testing, arquitectura y gobernanza SPFx
- `DESIGN.md` para reglas de UI, UX, formularios, accesibilidad y patrones visuales

## Precedencia

1. Seguridad y plataforma (`AGENTS.md`) — nunca se anula
2. Capa gate de diseño (`DESIGN.md`)
3. Capa personal del proyecto (`DESIGN.md`)
4. Preferencias cosméticas

- Cambios técnicos o estructurales -> `AGENTS.md`
- Cambios visuales o de interacción -> `DESIGN.md` y `AGENTS.md`
- Si una regla del cliente choca con plataforma o accesibilidad, manda la capa gate de `DESIGN.md`

Si este archivo contradice a `AGENTS.md` o `DESIGN.md`, ignora este archivo y sigue los canónicos.

## Forma de trabajo

- analizar
- proponer
- ejecutar en cambios pequeños
- validar
- explicar
