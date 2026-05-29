# Catalog Discovery

Fecha: 2026-05-28

## Ficheros candidatos encontrados

| Ruta | Rol |
| --- | --- |
| CATALOGO_WEBPARTS_SPFX.md | Catálogo principal raíz con índice rápido, detalles, matriz y conclusión |
| projects/sharepoint-governance-webparts/_governance/docs/project-index.md | Índice complementario de los 27 proyectos governance |
| README.md | Documentación raíz del pack de reglas, no catálogo funcional |
| orchestration/project-work-items.json | Memoria operativa generada, no fuente principal para el catálogo actual |

## Catálogo elegido

- Principal: `CATALOGO_WEBPARTS_SPFX.md`.
- Complementario: `projects/sharepoint-governance-webparts/_governance/docs/project-index.md` para governance.

## Resultado de comparación catálogo vs disco

| Métrica | Resultado |
| --- | ---: |
| Proyectos SPFx en disco | 79 |
| Webparts físicos en disco | 80 |
| Manifiestos SPFx en disco | 80 |
| Filas físicas del índice rápido | 80 |
| Carpetas únicas en catálogo | 79 |
| Proyectos catalogados sin carpeta | 0 |
| Proyectos en disco fuera de catálogo | 0 |
| Carpetas duplicadas justificadas | 1 |

## Duplicidad justificada

| Carpeta | Entradas |
| --- | --- |
| visualizador-de-elementos-de-biblioteca-y-papelera-superior | WP-035 SiteStorageDiagnosticsWebPart; WP-035 RecycleBinSpaceCalculatorWebPart |

## Proyectos que faltan en disco

Ninguno.

## Proyectos en disco no incluidos en catálogo

Ninguno.

## Decisión de alcance final

Se procesan los 79 proyectos SPFx detectados por contrato positivo `package.json` + `config/config.json`. El catálogo y el disco coinciden tras corregir el total documental de proyectos independientes a 79. `WP-035` mantiene dos webparts físicos dentro de un único proyecto.
