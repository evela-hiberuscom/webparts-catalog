# Instrucciones de entrada para GitHub Copilot

Usa estos archivos como fuente de verdad del repositorio:

1. `AGENTS.md`
   - arquitectura
   - proceso de trabajo
   - testing
   - seguridad
   - permisos
   - gobernanza SPFx
   - validación final

2. `DESIGN.md`
   - UI
   - UX
   - layout
   - formularios
   - estados de interfaz
   - accesibilidad
   - patrones visuales

## Precedencia

- Arquitectura, datos, hooks, contexts, servicios, seguridad, permisos, build y tests -> `AGENTS.md`
- UI, UX, formularios, layout, estados, copy visual y accesibilidad -> `DESIGN.md` + `AGENTS.md`
- Si hay conflicto entre una preferencia del cliente y una restricción de plataforma, prevalece la capa gate de `DESIGN.md`
- No contradigas la compatibilidad real de SPFx, React, Fluent UI o SharePoint Online

### Cadena de resolución (de mayor a menor)

1. Seguridad y plataforma (`AGENTS.md`) — nunca se anula
2. Capa gate de diseño (`DESIGN.md`)
3. Capa personal del proyecto (`DESIGN.md`)
4. Preferencias cosméticas

Si este archivo contradice a `AGENTS.md` o `DESIGN.md`, ignora este archivo y sigue los canónicos.

## Forma de trabajar

- Analiza antes de proponer
- Propón antes de ejecutar
- Ejecuta cambios pequeños
- Valida con scripts reales del repo
- No inventes dependencias, permisos ni scripts
