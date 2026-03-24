# Project Intelligence

## Row Source
- `rowId`: `recqkzUHilH8lKoGy`
- `name`: `Componente según tu perfil`
- `slug`: `componente-segun-tu-perfil`
- `waveNumber`: `3`

## Specification Review
- `suficiencia`: `needs-enrichment`
- `gaps detectados`: `useCases`, `dataSource`
- `supuestos`: el bloque se resuelve como un web part SPFx de audiencia con origen principal `SharePointList` y soporte secundario para `JsonUrl` same-origin y `StaticConfig`

## Inference Log
- `observado`: la row define objetivos, estados UI, reglas de negocio y aceptación, pero no concreta el origen de datos ni los escenarios de uso
- `inferido`: el proyecto necesita un catálogo de variantes con audiencia, fallback genérico y payload flexible por variante
- `inferido`: el origen canónico para despliegue es una lista SharePoint `ProfileVariants`
- `inferido`: el modo de audiencia más útil por defecto es `hybrid`, porque permite combinar tokens explícitos con señales del usuario
- `pendiente de validar`: la taxonomía final de variantes de negocio en producción

## Risks
- la resolución de perfil depende de tokens disponibles en contexto o configurados por el autor
- `JsonUrl` y `SharePointList` deben seguir siendo same-origin para no abrir la superficie del componente
- los payloads malformados deben ir a `error` y no a `empty`

## Error History
- no se han detectado errores funcionales bloqueantes durante la implementación inicial
