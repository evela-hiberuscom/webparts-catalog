# Project Intelligence

## Row Source
- `rowId`: recAqLibyGniOU3P7
- `name`: Centro de acciones rápidas
- `slug`: centro-de-acciones-rapidas
- `waveNumber`: 4

## Specification Review
- suficiencia: suficiente
- gaps detectados: ninguno bloqueante
- supuestos:
  - `jsonUrl` y `staticActionsJson` se usan como contrato local para soportar `JsonUrl` y `StaticConfig` sin romper el patrón del repo
  - `defaultCategory` se usa como filtro inicial cuando la categoría existe en el catálogo cargado
  - los enlaces se sanitizan en render con `createSafeExternalLink` para no abrir acciones inseguras

## Inference Log
- observado:
  - la row define un launcher de acciones con prioridad, categorías, iconos, fallback parcial y origen SharePoint como fuente principal
  - el contrato técnico exige `SharePointList|JsonUrl|StaticConfig` y una vista compacta tipo grid
- inferido:
  - `StaticConfig` debe servir como fallback de workbench y catálogo de ejemplo cuando no haya configuración local
  - las acciones sin enlace deben seguir visibles pero no accionables
  - la ordenación útil es prioridad ascendente y, a igualdad, título ascendente
- pendiente de validar:
  - si el cliente quiere iconografía restringida a un subconjunto autorizado de Fluent UI
  - si el catálogo real usará campos con nombres idénticos a `Title`, `Category`, `Icon`, `Priority` y `OpenUrl`

## Risks
- `SharePointList` depende de que exista el catálogo `QuickActionsList` o una URL same-origin válida.
- `JsonUrl` se restringe a same-origin para no abrir la superficie del componente.
- Las acciones sin `openUrl` se muestran como informativas, no como enlaces.

## Error History
- ISSUE-006: el generador SPFx creó un subdirectorio adicional y hubo que aplanar el scaffold al root real.
