# RONDA 1 — AGENTE 6 — Calidad, bugs, code smells y código muerto

## Alcance

Bugs probables, code smells, catch silenciosos, any, hardcoded strings, duplicación, archivos grandes y deuda técnica.

## Evidencia clave

```json
{
  "dangerouslySetInnerHTML": 0,
  "innerHTML": 7,
  "iframe": 0,
  "evalOrFunction": 0,
  "documentWrite": 0,
  "windowOpen": 7,
  "targetBlank": 15,
  "localOrSessionStorage": 30,
  "fetchOrAxios": 19,
  "spHttpClient": 162,
  "getByTitleOrListUrl": 88,
  "catchSwallow": 71,
  "consoleErrorWarn": 61,
  "anyUsage": 23,
  "todoFixme": 29,
  "propertyPaneText": 200,
  "externalUrl": 200
}
```

## Hallazgos

- Confirmado: hardcoded UI strings visibles fuera de loc en CorporateAz, MyUsefulDocuments, MyTasksAndPending y ContextHelpPanel.
- Confirmado: 71 catch/fallbacks silenciosos candidatos.
- Confirmado: 23 anyUsage y 29 TODO/FIXME.
- Confirmado: archivos grandes como projects/microencuesta/src/webparts/microSurvey/repositories/pollRepository.ts (548 líneas); projects/analizador-de-tamano-y-volumen-de-documentos-historicos/src/webparts/historicalStorageAnalyzer/components/HistoricalStorageAnalyzer.tsx (507 líneas); projects/pulso-del-dia/src/webparts/dailyPulse/repositories/dailyPulseRepository.ts (492 líneas); projects/mapa-de-portales/src/webparts/portalMap/utils/portalMapUtils.ts (466 líneas); projects/kpi-mini-cards/src/webparts/kpiMiniCards/repositories/kpiCatalogRepository.ts (357 líneas).
- Sospecha razonable: getByTitle con encodeURIComponent en repositorios SharePoint puede fallar con caracteres especiales.
- Confirmado: duplicación de estados loading/empty/error/card en varios componentes.

## Recomendaciones

Migrar copy a loc, prohibir catch vacíos, eliminar any en DTOs SharePoint, refactorizar repos grandes y añadir tests de caracteres especiales en listas.
