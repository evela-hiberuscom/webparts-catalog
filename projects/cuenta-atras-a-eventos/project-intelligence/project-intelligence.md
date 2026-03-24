# Project Intelligence

## Row Source
- `rowId`: `rec3wBPZ0kB6HqioK`
- `name`: `Cuenta atrás a eventos`
- `slug`: `cuenta-atras-a-eventos`
- `waveNumber`: `5`
- `artifactType`: `SPFxWebPart`
- `archetype`: `general`

## Specification Review
- `suficiencia`: suficiente
- `gaps detectados`: ninguno bloqueante
- `supuestos`:
  - La web part muestra un único evento principal.
  - `showCompleted=false` oculta el estado completado como vacío.
  - Las fuentes `SharePointList` y `JsonUrl` deben ser same-origin o relativas.

## Inference Log
- `observado`: la fila ya definía objetivo, estados UI, reglas de negocio y criterios de aceptación.
- `inferido`: si la fuente remota devuelve varias filas, se usa la primera compatible y se marca `partialData`.
- `inferido`: el estado `live` se usa para el día del evento cuando ya ha vencido la hora objetivo.
- `pendiente de validar`: la forma exacta del payload remoto puede variar según la lista o el JSON configurado.

## Risks
- Fechas sin zona horaria explícita pueden depender de la zona local del editor.
- Una lista SharePoint con varias filas puede requerir filtrado adicional en futuras versiones.
- Enlaces de detalle no válidos o de otro origen deben tratarse como no accionables.

## Error History
- `ISSUE-006`: el scaffold SPFx genera un subdirectorio anidado; el contenido se movió al root real del proyecto.
- `ISSUE-028`: no se aplica persistencia local previa a confirmación remota porque este proyecto es de solo lectura.
- `ISSUE-029`: las URLs de lista `.../Forms/AllItems.aspx` se normalizan antes de construir `GetList(@listUrl)`.
