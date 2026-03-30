# Project Intelligence

## Row Source
- `rowId`: recFNVhOLdRwWNLIq
- `name`: Directorio express
- `slug`: directorio-express
- `waveNumber`: 6

## Specification Review
- suficiencia: suficiente
- gaps detectados: ninguno bloqueante para implementar la V1
- supuestos: el directorio combina Directory/API, lista SharePoint, JSON same-origin y configuración estática cuando procede

## Inference Log
- observado:
  - la row ya traía objetivos, casos de uso, contrato técnico, estados UI y criterios de aceptación
  - el proceso debe soportar Directory/API y PeopleList como fuentes principales
  - ISSUE-029 aplica a la normalización de `Forms/AllItems.aspx`
- inferido:
  - el web part puede combinar varias fuentes y deduplicar personas por email o URL de perfil
  - la búsqueda debe priorizar coincidencias exactas por nombre antes que el resto
  - el estado `partialData` debe activarse si faltan foto, cargo, área o perfil
- pendiente de validar:
  - el esquema exacto de columnas de la lista curada en SharePoint
  - si la organización usará Directory/API real, JSON curado, o ambos en paralelo

## Risks
- Directory/API puede devolver resultados incompletos o con permisos parciales; el UI debe degradar sin romperse.
- La lista SharePoint debe tener columnas compatibles con la normalización prevista o caerá en estado parcial/error.
- `jsonUrl` debe ser same-origin; no se aceptan dominios externos.

## Error History
- 2026-03-30: se aplican ISSUE-006, ISSUE-018, ISSUE-026 y ISSUE-029 desde el inicio del proyecto.
- 2026-03-30: se resolvieron los bloqueos de build enlazando `@paquete/spfx-common`, ajustando los tests de Jest y validando el ranking de búsqueda.

## Implementation Status
- scaffold normalizado en el root real del proyecto
- preparación aplicada con `skipFeatureDeployment=false`
- capa de dominio creada con modelos, utilidades, repositorios, service y hook
- UI real con buscador, filtros, lista de personas y estados de carga/vacío/parcial/error
- documentación local y mockup creados
- `npm run build` validado con éxito
- `.sppkg` generado en `sharepoint/solution/directorio-express.sppkg`
- residuo no bloqueante: warnings de iconos Fluent UI en tests
