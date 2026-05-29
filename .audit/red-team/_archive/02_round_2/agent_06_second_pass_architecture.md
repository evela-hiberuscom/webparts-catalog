# RONDA 2 — Agent 06 — Arquitectura

## Hallazgos

- Arquitectura por capas existe, pero archivos grandes concentran responsabilidades.
- Ejemplos: projects/microencuesta/src/webparts/microSurvey/repositories/pollRepository.ts (548 líneas); projects/analizador-de-tamano-y-volumen-de-documentos-historicos/src/webparts/historicalStorageAnalyzer/components/HistoricalStorageAnalyzer.tsx (507 líneas); projects/pulso-del-dia/src/webparts/dailyPulse/repositories/dailyPulseRepository.ts (492 líneas); projects/mapa-de-portales/src/webparts/portalMap/utils/portalMapUtils.ts (466 líneas); projects/kpi-mini-cards/src/webparts/kpiMiniCards/repositories/kpiCatalogRepository.ts (357 líneas); projects/visualizador-de-elementos-de-biblioteca-y-papelera-superior/src/webparts/siteStorageDiagnostics/services/scanEngine.ts (352 líneas); projects/mini-organigrama/src/webparts/miniOrgChart/utils/miniOrgChartUtils.ts (345 líneas); projects/analizador-de-tamano-y-volumen-de-documentos-historicos/src/webparts/historicalStorageAnalyzer/repositories/SharePointHistoricalStorageAnalyzerRepository.ts (339 líneas).
- dailyPulseRepository combina localStorage, anti-duplicado, digest, POST y parsing.
- PollRepository combina tres fuentes de datos, payloads SharePoint y storage local.

## Recomendación

Refactors incrementales con helpers puros y separación de parsing/transporte/reglas, priorizando módulos con tests.
