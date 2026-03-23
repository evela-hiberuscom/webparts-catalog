# Pack SPFx para agentes y asistentes de desarrollo

Este pack evita duplicación masiva y organiza las reglas en una estructura más compatible con varios IDEs y agentes.

## Estructura

### Fuentes canónicas

- `AGENTS.md`: estándar técnico y de proceso del repositorio.
- `DESIGN.md`: estándar de diseño y UX con modelo de dos capas.

### Wrappers por herramienta

- `.github/copilot-instructions.md`
- `CLAUDE.md`
- `.antigravity/rules.md`

Estos wrappers son intencionadamente breves y solo redirigen a los archivos canónicos.

## Por qué está hecho así

Porque reduce contradicciones y mantenimiento:

- las reglas técnicas viven en `AGENTS.md`,
- las reglas de diseño viven en `DESIGN.md`,
- cada herramienta conserva su archivo nativo de entrada.

## Compatibilidad con Codex

Este pack es compatible con Codex porque:

- usa `AGENTS.md` como archivo principal,
- mantiene reglas duraderas del repositorio en `AGENTS.md`,
- usa `DESIGN.md` como documento complementario especializado,
- evita que otros archivos dupliquen y desincronicen el estándar.

## Compatibilidad con Copilot

- Copilot puede usar `.github/copilot-instructions.md` como archivo nativo de instrucciones de repositorio.
- Copilot coding agent también soporta instrucciones de agente como `AGENTS.md` y `CLAUDE.md`, por lo que esta estructura es robusta incluso si cambia el flujo concreto del usuario.

## Compatibilidad con Claude Code

- `CLAUDE.md` funciona como punto de entrada breve y redirige a `AGENTS.md` y `DESIGN.md`.

## Nota sobre Antigravity

La convención `.antigravity/rules.md` se mantiene como wrapper práctico. Si tu instalación concreta espera otro nombre o ruta, conserva el contenido y ajústalo al formato que use tu herramienta.

## Recomendación de uso

1. Edita `AGENTS.md` cuando cambien reglas técnicas, arquitectura, testing o gobernanza.
2. Edita `DESIGN.md` cuando cambien reglas de diseño, UX o capa cliente.
3. Mantén los wrappers ligeros.
4. Si añades nuevos documentos especializados, enlázalos desde `AGENTS.md` o `DESIGN.md`, no duplicando todo el contenido en cada herramienta.
