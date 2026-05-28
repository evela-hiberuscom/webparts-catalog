# Cierre de remediación

Fecha: 2026-05-28

## Decisión

Los hallazgos repo-locales que bloqueaban el cierre quedan remediados o cubiertos por guardrails versionados. Los puntos que dependen de configuración externa se dejan explícitamente fuera del repositorio y requieren acción del owner del tenant/GitHub.

## Matriz de cierre

| Hallazgo | Estado | Cierre aplicado | Evidencia |
| --- | --- | --- | --- |
| SEC-001 | Cerrado repo-local / acción externa | Secret scan versionado; `.env.local` sigue ignorado. Rotación del PAT queda fuera del repo. | `npm run check:secrets` |
| SEC-002 | Cerrado | `openSafeExternalLink` compartido y reemplazo de los 5 `window.open('_blank')` inseguros. | `npm run check:audit-remediation`; builds focalizados |
| SEC-003 | Cerrado | TTL/purga en `localStorage`, legacy sin TTL expira, no se persiste identidad directa y Daily Pulse no cachea respuestas remotas. | builds `microencuesta`, `pulso-del-dia` |
| SEC-004 | Cerrado | `JsonRecentAccessesRepository` normaliza `JsonUrl` a same-origin/relativa y rechaza cross-origin. | build `mis-accesos-recientes` |
| SUPPLY-001 | Cerrado repo-local | Workflows CI/Supply-chain, `npm audit`, SBOM CycloneDX y Renovate. | `.github/workflows/*.yml`, `renovate.json` |
| SUPPLY-002 | Cerrado | 207 rangos flotantes `^`/`~` fijados al lockfile y guardrail `check:pinned-deps`. | `npm run check:pinned-deps` |
| SUPPLY-003 | Cerrado | Lockfiles sincronizados con `@paquete/spfx-common` y guardrail específico. | `npm run check:locks` |
| CI-001 | Cerrado | CI de PR/push con Node 22.14.0, permisos mínimos y selección de proyectos afectados; cambios en `packages/spfx-common` validan todos los proyectos. | `npm run ci:projects:dry-run` |
| QA-001 | Cerrado | Build/test/package automatizados por proyecto afectado. | workflow CI + builds focalizados |
| QA-002 | Cerrado con deuda controlada | Añadidos tests a los 6 proyectos sin cobertura; queda objetivo de cobertura completa como mejora continua. | builds de los 6 proyectos |
| SMELL-001 | Cerrado como deuda P3 no bloqueante | Se mantiene como regla de diseño; la auditoría incluía falsos positivos y copy funcional de datos/mock. No bloquea cierre operativo. | closeout documentado |
| SMELL-002 | Cerrado | Catches prioritarios ahora registran contexto seguro o propagan error. | `rg "catch \\{"` en rutas prioritarias |
| BUG-001 | Cerrado | `getByTitle` deja de usar `encodeURIComponent`; usa escape OData para títulos. | `npm run check:audit-remediation` |
| ARCH-001 | Cerrado como deuda P3 no bloqueante | Refactors grandes quedan fuera del cierre correctivo; los riesgos bloqueantes se cubren con tests/CI/guardrails. | closeout documentado |
| DOC-001 | Cerrado | README del visualizador alineado con los webparts reales y su alcance vigente. | build `visualizador-de-elementos-de-biblioteca-y-papelera-superior` |
| TOOL-001 | Cerrado repo-local | Herramientas no disponibles localmente quedan versionadas en CI: secret scan, npm audit, SBOM y guardrails. | workflows CI/Supply-chain |

## Validación ejecutada

- `npm run check:pinned-deps`
- `npm run check:locks`
- `npm run check:secrets`
- `npm run check:audit-remediation`
- `npm run ci:projects:dry-run`
- `npm run build` en: `a-z-corporativo`, `accesos-rapidos-por-audiencia`, `biblioteca-de-plantillas`, `faq-inteligente`, `glosario-corporativo`, `mapa-de-portales`, `mis-accesos-recientes`, `mis-aprobaciones`, `mis-documentos-utiles`, `mis-tareas-y-pendientes`, `microencuesta`, `noticias-por-area`, `nuevas-incorporaciones`, `objetivos-del-area`, `panel-de-campana-interna`, `pregunta-destacada`, `presencia-de-sedes`, `proximos-hitos`, `pulso-del-dia`, `que-ha-cambiado`, `reserva-rapida`, `resumen-de-noticias`, `ruta-guiada`, `tarjeta-de-decision-rapida`, `turnos-guardias-o-disponibilidad`, `visualizador-de-elementos-de-biblioteca-y-papelera-superior`.

## Acciones externas pendientes

- Rotar el PAT local de Airtable si se compartió el entorno.
- Activar/forzar branch protection y required checks en GitHub.
- Habilitar Renovate en el repositorio si no está instalado en la organización.
- Revisar app catalog, permisos efectivos, CSP y validación real en tenant SharePoint.
