# Project Intelligence

## Row Source
- `rowId`: recRt1japWn21MzFX
- `name`: Pulso del día
- `slug`: pulso-del-dia
- `waveNumber`: 3

## Specification Review
- suficiencia: parcial
- gaps detectados: `useCases`, `dataSource`
- supuestos:
  - el surface principal es una pregunta diaria breve con 3-5 opciones visuales
  - la persistencia operativa se apoya en `SharePointList` cuando la lista está provisionada y en `StaticConfig` para el workbench local
  - una respuesta por usuario y día es la regla por defecto

## Inference Log
- observado:
  - la row define objetivo, estados UI, reglas de negocio, aceptación y contrato técnico base
  - faltan `useCases` y la fuente real de datos
- inferido:
  - arquetipo: `analytics` ligero de captura de pulso
  - caso de uso primario: capturar el estado del día en segundos
  - caso de uso secundario: ofrecer una señal rápida a people/managers
  - esquema de provisión: lista SharePoint `DailyPulse` con items de prompt y respuesta
  - fallback de workbench: `StaticConfig` con prompt inferido para evitar una superficie vacía en local
- pendiente de validar:
  - si el cliente quiere una lista separada para prompts y respuestas
  - si la persistencia remota debe ser obligatoriamente SharePoint o puede ser endpoint same-origin

## Risks
- La persistencia remota queda condicionada a que exista la lista o endpoint final configurado.
- Si la fuente solo entrega prompts sin opciones útiles, el web part entra en `partialData`.
- El fallback local mantiene la experiencia en workbench, pero no sustituye la definición final de backend.

## Error History
- La primera implementación declaraba persistencia remota para `SharePointList`, pero solo guardaba la respuesta en `localStorage`.
- Se corrigió el repositorio para:
  - registrar respuestas en la lista `DailyPulse` cuando el origen es `SharePointList`,
  - fallar si el endpoint same-origin devuelve un HTTP no satisfactorio,
  - mantener `localStorage` solo como apoyo local y control de reenvío diario.
