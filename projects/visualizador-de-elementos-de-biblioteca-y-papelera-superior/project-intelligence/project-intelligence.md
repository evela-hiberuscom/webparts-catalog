# Project Intelligence

## Row Source
- `rowId`: `recH4dtMmWDWA8VzV`
- `name`: `Visualizador de elementos de biblioteca y papelera superior`
- `slug`: `visualizador-de-elementos-de-biblioteca-y-papelera-superior`
- `waveNumber`: `12`

## Specification Review
- suficiencia: corregida tras la aclaración explícita del usuario
- enfoque funcional:
  - no es una comparativa biblioteca vs papelera
  - es un calculador del espacio ocupado por elementos de papelera de primer y segundo nivel
  - si falta un dato de una etapa, el producto se mantiene y marca `partialData` con limitación técnica explícita
- gaps pendientes:
  - confirmar si el desglose visual por nivel debe mostrarse siempre o solo cuando la API lo permite
  - decidir si el acceso a la segunda etapa requerirá fallback admin/contexto alternativo en runtime

## Inference Log
- observado:
  - la interpretación inicial del proyecto estaba mal enfocada
  - el usuario corrigió el objetivo y rechazó reinterpretar el producto como una comparativa con biblioteca activa
- inferido:
  - la V1 debe calcular `stage 1 + stage 2` de la papelera del sitio
  - el producto debe mostrar `partialData` cuando una etapa no exponga tamaño o no sea accesible desde el contexto actual
  - la UI debe priorizar total, desglose por nivel y estado de salud
- pendiente de validar:
  - exactitud del dato de la segunda etapa en el contexto final de SharePoint
  - necesidad de desglose por origen adicional

## Risks
- el riesgo principal es técnico: la segunda etapa puede requerir un contexto o endpoint distinto del de la primera
- si una etapa no expone tamaño, debe registrarse como limitación técnica y no como cambio de alcance
- no debe volver a aparecer la interpretación anterior de comparación con biblioteca activa

## Error History
- 2026-03-24: se corrige la interpretación inicial del proyecto; queda fijado como calculador del espacio ocupado por la papelera de primer y segundo nivel
