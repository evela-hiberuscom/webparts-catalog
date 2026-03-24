# Project Intelligence

## Row Source
- `rowId`: recDe4Jh2iLvXpfIB
- `name`: Conoce al equipo
- `slug`: conoce-al-equipo
- `waveNumber`: 5

## Specification Review
- suficiencia: alta
- gaps detectados:
  - `Directory/API` no especifica endpoint real; se deja como fuente opcional same-origin con fallback a `StaticConfig`
  - no existe lista real provisionada todavía, por lo que el proyecto arranca con configuración estática segura
- supuestos:
  - `StaticConfig` es la fuente por defecto hasta que exista una lista operativa
  - `listTitleOrUrl` puede venir como título o como URL de vista same-origin
  - `JsonUrl` y `Directory/API` deben ser same-origin o relativos al sitio

## Inference Log
- observado:
  - la row describe una presentación de equipo con foto, rol, bio y enlace
  - el scaffold inicial generaba un subdirectorio adicional que ya se corrigió al root real del proyecto
- inferido:
  - un enfoque híbrido con `StaticConfig` + fuentes SharePoint/JSON cubre el caso sin bloquear el despliegue
  - el modo de ordenación debe ser manual, por rol o por nombre
- pendiente de validar:
  - si `Directory/API` tendrá un endpoint concreto o quedará como enriquecimiento futuro
  - si la lista real usará `Title` o un nombre interno distinto para algunos campos

## Risks
- dependencia futura de una lista real o endpoint directory no configurados
- posible necesidad de ajustar el mapeo de campos si la lista final usa nombres internos distintos
- cobertura y lint aún pendientes de validar con el build real

## Error History
- `ISSUE-006`: el generador SPFx puede crear un subdirectorio anidado adicional; ya se corrigió en el scaffold
- `ISSUE-029`: `listTitleOrUrl` debe normalizar URLs de vista antes de invocar `GetList(@listUrl)`; cubierto por tests
