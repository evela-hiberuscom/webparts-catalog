# Project Intelligence

## Row Source
- `rowId`: `recR0hmAqzSViJFra`
- `name`: `Mini organigrama`
- `slug`: `mini-organigrama`
- `waveNumber`: `7`

## Specification Review
- suficiencia: `suficiente`
- gaps detectados: ninguno bloqueante para la V1
- supuestos: la implementación debe tolerar Directory/API, SharePointList, JsonUrl y StaticConfig sin romper si falta alguno

## Inference Log
- observado:
  - la row ya define objetivo, estados UI, reglas, aceptación y contrato técnico
  - `ISSUE-029` aplica para normalizar rutas de lista con `Forms/AllItems.aspx`
- inferido:
  - la vista debe priorizar un root claro y reportes directos accesibles
  - el modo `chain` debe seguir funcionando como vista compacta y legible
  - el estado `partialData` debe aparecer cuando falten foto, perfil o relaciones
- pendiente de validar:
  - esquema real de campos de la lista curada
  - disponibilidad real del endpoint de directorio en el tenant

## Risks
- Directory/API puede estar incompleto o no disponible; la UI debe degradar con gracia.
- La lista SharePoint puede no usar exactamente los campos inferidos y entonces mostrará estado parcial.
- `jsonUrl` debe ser same-origin.

## Error History
- 2026-03-30: se aplicaron `ISSUE-006`, `ISSUE-018`, `ISSUE-026` y `ISSUE-029` desde el inicio del proyecto.
- 2026-03-30: se añadió normalización de `AllItems.aspx` para listas y soporte de fuentes mixtas.
- 2026-03-30: `npm run build` terminó con éxito y generó `sharepoint/solution/mini-organigrama.sppkg`.

## Implementation Status
- scaffold normalizado en el root real del proyecto
- preparación aplicada con `skipFeatureDeployment=false`
- capa de dominio creada con modelos, utilidades, repositorios, service y hook
- UI real con buscador, filtros, tarjetas de nodo y estados de carga/vacío/parcial/error
- documentación local, mockup y provisioning creados
- `npm run build` validado con éxito
- `.sppkg` generado en `sharepoint/solution/mini-organigrama.sppkg`
- residuo no bloqueante: warnings de iconos Fluent UI en tests y avisos `@rushstack/no-new-null`
