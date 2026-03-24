# Project Intelligence

## Row Source
- `rowId`: recgszxhqydcwE8va
- `name`: Analizador de tamaño y volumen de documentos históricos
- `slug`: analizador-de-tamano-y-volumen-de-documentos-historicos
- `waveNumber`: 11

## Specification Review
- suficiencia: suficiente tras aclaración del usuario
- gaps detectados:
  - decidir si la selección de biblioteca vive solo en property pane o también en la UI del web part
  - confirmar el nivel exacto de profundidad y límites operativos del `deepScan`
- supuestos:
  - la V1 debe permitir elegir entre todas las bibliotecas documentales del sitio, no quedar fija a una sola biblioteca preconfigurada
  - el cálculo objetivo es de exactitud, no de estimación aproximada cuando el dato sea recuperable
  - `quickScan` y `deepScan` conviven en el mismo web part y comparten surface de KPIs, cobertura y top documentos

## Inference Log
- observado:
  - el catálogo ya pedía `quickScan`, `deepScan`, KPIs, top N y cobertura
  - el usuario ha aclarado que la selección debe abarcar todas las bibliotecas del sitio
  - el usuario ha aclarado que la expectativa es `exactitud`
- inferido:
  - la UI debe incluir selector de biblioteca en runtime o picker equivalente sobre todas las bibliotecas elegibles del sitio
  - `quickScan` puede ser un modo rápido, pero no debe degradar el resultado a una simple estimación opaca si el dato exacto es calculable con las APIs disponibles
  - el diseño debe comunicar coste y duración del `deepScan` sin renunciar a un resultado exacto
- pendiente de validar:
  - si el listado de bibliotecas debe excluir bibliotecas de sistema, Site Assets y similares por defecto
  - si el `deepScan` exacto acepta tiempos de espera largos o necesita paginación visible/progreso al usuario

## Risks
- la exigencia de exactitud puede chocar con throttling o tiempos de ejecución altos en bibliotecas grandes; habrá que tratarlo como restricción de arquitectura y no como excusa para ocultar resultados
- si la UI permite elegir cualquier biblioteca del sitio, habrá que manejar permisos parciales y bibliotecas no analizables sin romper la experiencia

## Error History
- 2026-03-24: el proyecto queda marcado como prioridad alta por decisión del usuario y con la aclaración funcional de `quickScan + deepScan` sobre todas las bibliotecas del sitio

## Implementation Status
- scaffold normalizado en el root real del proyecto
- preparación aplicada con `skipFeatureDeployment=false`
- capa de dominio creada con modelos, utilidades, repositorio, service y hook
- UI en refactor hacia una superficie real con selector de biblioteca, modos de escaneo y estados de exactitud/cobertura
- `npm run build` validado con éxito
- `.sppkg` generado en `sharepoint/solution/analizador-de-tamano-y-volumen-de-documentos-historicos.sppkg`
- quedan warnings de lint no bloqueantes sobre `null` y `void`

## Continuation Notes
- reanudar leyendo primero `project-intelligence/session-log.md`
- revisar `continuation-state.json` antes de volver a tocar alcance
- si el build falla, corregir sin rebajar la exigencia de exactitud
