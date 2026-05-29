# Project Validation Plan

Proyecto: analizador-de-tamano-y-volumen-de-documentos-historicos
Ruta: `projects/analizador-de-tamano-y-volumen-de-documentos-historicos`
Fecha: 2026-05-28

## Objetivo del proyecto

Validar el proyecto SPFx independiente `analizador-de-tamano-y-volumen-de-documentos-historicos` contra el catálogo, los arneses del repositorio y las reglas SPFx/React/Fluent UI aplicables.

## Webpart o webparts incluidos

| Webpart folder | Manifest alias | Manifest id |
| --- | --- | --- |
| historicalStorageAnalyzer | HistoricalStorageAnalyzerWebPart | 7751cf70-a7b4-4590-b38a-2bacdf20a545 |

## Relación con el catálogo

| Entrada | Clase | Estado | Reutilización |
| --- | --- | --- | --- |
| WP-034 | HistoricalStorageAnalyzerWebPart | Experimental | Baja |

## Reglas aplicables del repo

- `AGENTS.md`: arquitectura por capas, acceso a datos en repositories, hooks para estado, servicios para casos de uso, ErrorBoundary, localización y validación real.
- `DESIGN.md`: compatibilidad con host SharePoint, Fluent UI, estados completos, accesibilidad y diseño responsive.
- CI: Node 22.14.0, `npm ci --ignore-scripts` y `npm run build --if-present` por proyecto desde `scripts/ci-validate-projects.mjs`.

## Reglas aplicables del proyecto

- Gestor: npm.
- SPFx: 1.22.2.
- React: 17.0.1.
- Fluent UI: 8.125.5.
- TypeScript: 5.8.3.
- Usa paquete compartido `@paquete/spfx-common`: si.

## Comandos detectados

| Script | Comando |
| --- | --- |
| npm run build | `heft build --clean --production && heft test --production && heft package-solution --production` |
| npm run start | `heft start --clean` |
| npm run clean | `heft clean` |
| npm run eject-webpack | `heft eject-webpack` |

## Estrategia de instalación

Ejecutar `npm ci --ignore-scripts` porque existe `package-lock.json`. No usar `--force` ni `--legacy-peer-deps`.

## Estrategia de build

Ejecutar `npm run build`. En este repo el build del proyecto ejecuta `heft build --clean --production && heft test --production && heft package-solution --production`.

## Estrategia de lint

No existe script `lint` separado. Se registrará si Heft/SPFx reporta errores o warnings durante `npm run build`; cualquier warning visible se documentará.

## Estrategia de test

No existe script `test` separado. Los tests se ejecutan mediante `heft test --production` incluido en `npm run build`.

## Estrategia de coverage

No existe script de coverage dedicado en `package.json`. La cobertura no se declarará como porcentaje verificado salvo que se ejecute un comando real que emita métricas. Se creará `coverage-exceptions.md` si el arnés sigue sin exponer coverage.

## Documentación esperada

- `README.md`.
- `docs/validation/project-validation-plan.md`.
- `docs/validation/install-notes.md`.
- `docs/validation/build-notes.md`.
- `docs/validation/typecheck-notes.md`.
- `docs/validation/lint-notes.md`.
- `docs/validation/test-coverage-report.md`.
- `docs/validation/functional-compliance.md`.
- `docs/red-team/final-validation-red-team.md`.

## Riesgos

- Runtime de instalación/build elevado por validación de 79 proyectos.
- Cobertura 100% no verificable sin comando dedicado.
- Posibles fallos de Heft/Jest por entorno Windows o lockfiles.

## Plan de corrección

- Corregir únicamente discrepancias documentales o errores de arnés claramente acotados.
- No añadir dependencias ni modificar permisos.
- Si un fallo requiere cambio funcional amplio, dejar el proyecto bloqueado con evidencia en vez de ocultarlo.
