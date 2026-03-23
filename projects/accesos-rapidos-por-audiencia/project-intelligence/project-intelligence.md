# Project Intelligence

## Row Source

- `rowId`: `reczv9XSDJN23xEsz`
- `name`: `Accesos rápidos por audiencia`
- `slug`: `accesos-rapidos-por-audiencia`
- `waveNumber`: `1`
- `archetype`: `audience`

## Observado

- La especificación ya cubría objetivo, reglas de negocio, casos de uso, estados de UI y criterios de aceptación.
- La capa de diseño pide una UI de navegación contextual con fallback genérico, badges de categoría y tratamiento claro de `loading`, `empty`, `partialData` y `error`.
- El proyecto no traía fuente de datos real en el scaffold, solo la estructura inicial de SPFx.

## Inferido

- Se implementa un catálogo interno de reserva para que el web part funcione desde el workbench incluso sin lista configurada.
- El matching de audiencia se resuelve con heurísticas de perfil de SharePoint, grupos del sitio y tokens normalizados.
- `StaticConfig` es el modo más seguro para primera carga; `SharePointList` y `JsonUrl` quedan como orígenes configurables.
- Las etiquetas de inferencia se documentan explícitamente en la implementación y en esta nota con el formato `observado / inferido / pendiente de validar`.

## Pendiente de validar

- La estructura exacta de la lista SharePoint de producción y sus nombres internos.
- Si `JsonUrl` se usará en producción o solo como feed temporal.
- Qué categoría debe seleccionarse por defecto en cada tenant: `General` o una categoría corporativa distinta.
- Si los grupos de sitio reflejan suficientemente la segmentación que el negocio espera o si hará falta un mapa adicional.

## Arquitectura Implementada

- `models/`: contratos de audiencia, host context y view models.
- `repositories/`: catálogo de accesos y contexto de usuario.
- `services/`: matching, fallback, ordenación y estado final.
- `hooks/`: carga y reintento.
- `components/`: hero, filtros, tarjetas, estados y layout.
- `utils/`: normalización, tokens y safe links.

## Resultado

- El web part renderiza con catálogo interno por defecto.
- Los accesos se filtran por audiencia y categoría.
- Los enlaces se sanitizan antes de renderizarse.
- El proyecto queda listo para empaquetar y distribuir como `.sppkg`.
