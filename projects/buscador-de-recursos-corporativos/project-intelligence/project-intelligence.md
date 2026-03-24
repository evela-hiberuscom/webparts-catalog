# Project Intelligence

## Row Source
- `rowId`: recftse8Odprgl5Q8
- `name`: Buscador de recursos corporativos
- `slug`: buscador-de-recursos-corporativos
- `waveNumber`: 4

## Specification Review
- suficiencia: suficiente
- gaps detectados: ninguno bloqueante
- supuestos:
  - `SearchAPI` actua como fuente principal para consultas textuales sobre el indice de SharePoint
  - `SharePointList` y `SharePointLibrary` se usan como catalogos enriquecidos y de destacados
  - `JsonUrl` solo se admite same-origin o relativa para no abrir superficies remotas
  - `showFeaturedWhenEmpty` controla el estado visual inicial cuando no hay busqueda activa

## Inference Log
- observado:
  - la row ya define objetivo, use cases, data source, estados, reglas de negocio, aceptacion y datos tecnicos
  - el proyecto llego como scaffold SPFx generico y hubo que aplanar el subdirectorio anidado segun `ISSUE-006`
- inferido:
  - el buscador se resuelve mejor con un surface principal de busqueda, filtros y lista rica de resultados
  - `SearchAPI` debe convivir con fuentes de catalogo para featured y para enriquecer resultados
  - los recursos sin `openUrl` siguen visibles pero no accionables
- pendiente de validar:
  - si el cliente quiere usar otra taxonomia para `resourceType` y `category`
  - si el alcance de `SearchAPI` debe limitarse a una ruta concreta de sitio o biblioteca

## Risks
- Las consultas sobre `SearchAPI` dependen de permisos y del indice disponible en el tenant.
- Los orígenes `SharePointList` y `SharePointLibrary` requieren que la lista o biblioteca exista y tenga metadatos utiles.
- `JsonUrl` exige same-origin o relativa; una URL externa debe fallar de forma explicita.

## Error History
- `ISSUE-006`: el scaffold genero un subdirectorio anidado y hubo que mover el contenido al root real del proyecto.
- No se han detectado errores funcionales bloqueantes durante la implementacion inicial.
