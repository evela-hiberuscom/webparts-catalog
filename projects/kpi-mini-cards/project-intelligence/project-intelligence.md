# Project Intelligence

## Row Source
- `rowId`: recHAX1V79Y7kqR0Y
- `name`: KPI mini-cards
- `slug`: kpi-mini-cards
- `waveNumber`: 2

## Specification Review
- suficiencia: suficiente
- gaps detectados: ninguno bloqueante
- supuestos:
  - el KPI source contract se normaliza desde JSON estático, SharePoint list, JSON URL o API endpoint
  - `openUrl` siempre se trata como entrada no confiable y se sanea antes de pintarse
  - `JsonUrl` y `ApiEndpoint` se restringen a rutas same-origin o relativas
  - `showTrend` controla solo la presentación, no la validez del KPI
  - `StaticConfig` vacío refleja un estado vacío real; un JSON estructuralmente inválido refleja error real en lugar de muestras de relleno

## Inference Log
- observado:
  - la row trae goal, layout, estados, reglas de negocio y criterios de aceptación
  - la UX objetivo es dashboard compacto, no listado generalista
- inferido:
  - el modelo de datos debe admitir origen mixto para no bloquear escenarios de SharePoint list y endpoint remoto
  - la severidad visual debe derivarse de prioridad + umbral + estado parcial
  - el web part debe ser responsivo dentro del canvas de SharePoint con un grid que colapse en móvil
  - el estado explícito del KPI tiene prioridad sobre badge cuando ambos llegan en la misma fila
- pendiente de validar:
  - validación funcional contra una lista SharePoint real cuando exista en el tenant destino

## Risks
- URLs externas o malformadas si se renderizan sin sanitización
- configuración incompleta de la fuente remota puede degradar el estado a `partialData` o `error`
- las fuentes Montserrat/Lato se asumen disponibles vía estrategia del portal; si no, caerán en fallback del sistema

## Error History
- scaffold inicial generado correctamente con el script del repo
- no se detectaron bloqueos reutilizables que justificaran editar el registro central
