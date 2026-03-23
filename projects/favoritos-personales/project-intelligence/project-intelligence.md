# Project Intelligence

## Row Source
- `rowId`: recZLMapqZ0LFq7Y2
- `name`: Favoritos personales
- `slug`: favoritos-personales
- `waveNumber`: 1
- `artifactType`: SPFxWebPart

## Runtime Contract
- Orígenes soportados en runtime: `StaticConfig` y `SharePointList`.
- El selector de origen ya no expone opciones que no tengan implementación real.
- `FavoritesList` es la lista SharePoint prevista para el origen persistido.
- Cada fila de `FavoritesList` pertenece a un único usuario mediante `FavoriteOwner` / `FavoriteOwnerId`.
- El filtrado del runtime usa el usuario actual de `pageContext.user.id`.

## Minimum Schema
- `Title`: texto, obligatorio.
- `OpenUrl`: texto, obligatorio.
- `SortOrder`: número, opcional.
- `Icon`: texto, opcional.
- `Type`: texto, opcional.
- `Category`: texto, opcional.
- `Featured`: sí/no, opcional.
- `FavoriteOwner`: persona, obligatorio para el origen SharePoint.

## Specification Review
- suficiencia: sufficient
- gaps detectados: el origen SharePoint necesita la lista `FavoritesList` con campo de ownership y items del usuario actual
- supuestos: el fallback estático sigue disponible para escenarios de arranque o validación visual

## Inference Log
- observado: la row define un launcher personal con orden guardado, fallback por título y estados `empty`/`partialData`/`error`
- inferido: la primera versión debe ser usable sin Graph ni permisos extra, así que el web part arranca desde configuración estática o desde SharePoint REST en la misma colección
- pendiente de validar: el nombre interno exacto del campo de ownership si la lista se aprovisiona en otro tenant

## Risks
- el origen SharePoint todavía depende de que `FavoritesList` exista y tenga el campo de usuario correcto
- el JSON de favoritos es editable y puede quedar inválido si no se valida en el property pane

## Implementation Status
- build: passed
- tests: passed
- package-solution: passed
 - current mode: static-config and SharePointList runtime with local URL sanitization and user filtering

## Error History
- preparación del scaffold requirió normalizar el layout anidado del generador SPFx en Windows
- el paquete compartido `@paquete/spfx-common` tuvo que convertirse a CommonJS para que Jest pudiera cargarlo
- una carpeta residual `jest-output/coverage` provocó un `EPERM` hasta que se limpió el árbol de salida antes de relanzar la build
