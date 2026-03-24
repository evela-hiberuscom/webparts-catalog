# Estado de incidencias destacadas

Web part SPFx para visualizar incidencias activas o monitorizadas con severidad, impacto, workaround y ETA.

## Source of truth
- `project-intelligence/project-intelligence.md`
- `project-intelligence/implementation-notes.md`
- `design/mockup-spec.md`
- `design/design-reference.json`
- `provisioning/provisioning-definition.json`

## Data contract
- `SharePointList`: lista `IncidentsList` por defecto.
- `JsonUrl`: mismo origen, sin protocolos peligrosos, para casos sin lista.

## Behavior
- Oculta incidencias resueltas por defecto.
- Muestra banner si faltan datos secundarios.
- No bloquea la vista si falta ETA o workaround.
