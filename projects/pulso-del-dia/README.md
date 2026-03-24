# Pulso del día

Web part SPFx para capturar una señal diaria muy rápida del usuario con 3-5 opciones visuales, una sola respuesta por día y estados claros para `loading`, `ready`, `partialData`, `empty` y `error`.

## Source of truth
- `project-intelligence/project-intelligence.md`
- `project-intelligence/inference-notes.md`
- `design/mockup-spec.md`
- `design/design-reference.json`
- `provisioning/provisioning-definition.json`

## Implementation notes
- La solución arranca con `SharePointList` como contrato principal y cae a `StaticConfig` solo cuando no hay configuración remota en el workbench.
- La selección y el submit viven en `hooks` y `services`; el componente solo pinta estado.
- La respuesta queda persistida localmente para el workbench y se puede conectar a una fuente remota same-origin cuando se configure.

## Build
- `npm install`
- `npm run build`

Validated on 2026-03-23 after scaffold and implementation.

## Data strategy
- `SharePointList`: lista `DailyPulse` con prompt activo y respuestas.
- `StaticConfig`: prompt inferido para preview local.
- `JsonUrl` y `ApiEndpoint`: same-origin only.

## Fonts

Montserrat y Lato se documentan como self-hosted dentro del proyecto o de su paquete de activos. El runtime no depende de una CDN externa.

