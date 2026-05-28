# POST-AGENTE A — Normalizador de hallazgos

## SEC-001 — Airtable PAT presente en .env.local local e ignorado

| Campo | Valor |
|---|---|
| Categoría | Secretos |
| Severidad final | Low |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | secret-scan-local-masked.json; env-local-tracking-status.txt; .gitignore:1-4 |
| Archivos | .env.local (no trackeado), .gitignore, scripts/lib/airtable.mjs |
| Cómo validarlo de forma segura | Ejecutar gitleaks localmente y revisar historial sin imprimir el secreto |
| Recomendación | Rotar el PAT si se compartió el entorno; mantenerlo en secretos del entorno y nunca en Git |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |

## SEC-002 — window.open('_blank') sin noopener/noreferrer ni allowlist de URL

| Campo | Valor |
|---|---|
| Categoría | Seguridad aplicativa |
| Severidad final | Low |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | source-pattern-matches.json windowOpen: 5 hits _blank |
| Archivos | MyUsefulDocuments.tsx:60; MyTasksAndPending.tsx:69; NewJoiners.tsx:52; AreaGoals.tsx:71; InternalCampaignPanel.tsx:52 |
| Cómo validarlo de forma segura | Prueba un enlace externo controlado y verifica que window.opener sea null |
| Recomendación | Usar helper seguro de enlace, tercer argumento 'noopener,noreferrer' y validación de protocolo/origen |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |

## SEC-003 — Persistencia local de respuestas/identidad ligera en localStorage

| Campo | Valor |
|---|---|
| Categoría | Privacidad e integridad cliente |
| Severidad final | Low |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | MicroSurveyWebPart.ts:36-44; pollRepository.ts:253-293; dailyPulseRepository.ts:35-85,401-489 |
| Archivos | projects/microencuesta; projects/pulso-del-dia |
| Cómo validarlo de forma segura | Inspeccionar claves localStorage tras responder; comprobar TTL/purga y no PII directa |
| Recomendación | Documentar finalidad, limitar datos, añadir TTL/purga y no tratar localStorage como boundary de seguridad |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |

## SEC-004 — JsonUrl configurable sin restricción same-origin en mis-accesos-recientes

| Campo | Valor |
|---|---|
| Categoría | Seguridad aplicativa / gobierno de dominios |
| Severidad final | Medium |
| Confianza | Medium |
| Estado | Sospecha razonable |
| Evidencia | R2: JsonRecentAccessesRepository.ts fetch(this._url); property pane recentItemsJsonUrl |
| Archivos | projects/mis-accesos-recientes/src/webparts/myRecentAccesses/repositories/JsonRecentAccessesRepository.ts; MyRecentAccessesWebPart.ts |
| Cómo validarlo de forma segura | Configurar URL externa en property pane en entorno local controlado y verificar si se permite |
| Recomendación | Reutilizar validación same-origin de otros proyectos o exigir allowlist explícita documentada |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## SUPPLY-001 — Sin SCA/SBOM/Dependabot/Renovate versionados

| Campo | Valor |
|---|---|
| Categoría | Supply chain |
| Severidad final | Medium |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | tool-availability.txt; workflow-summary.json=[]; ausencia de dependabot/renovate/SBOM |
| Archivos | .github, package.json, projects/*/package.json |
| Cómo validarlo de forma segura | Buscar dependabot.yml/renovate.json/SBOM y ejecutar SCA en CI |
| Recomendación | Añadir Dependabot/Renovate, SBOM CycloneDX y npm audit controlado en CI |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## SUPPLY-002 — Rangos flotantes y skew de lockfiles entre 52 proyectos

| Campo | Valor |
|---|---|
| Categoría | Supply chain / reproducibilidad |
| Severidad final | Medium |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | dependency-aggregate-summary.json floatingDependencyOccurrenceCount=207; lockfile-summary.json versionSkewCount=139 |
| Archivos | projects/*/package.json; projects/*/package-lock.json |
| Cómo validarlo de forma segura | Ejecutar npm ci por proyecto en CI limpio |
| Recomendación | Pinning estricto o actualización agrupada; revisar lockfiles en PR |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## SUPPLY-003 — Lockfiles potencialmente desincronizados con @paquete/spfx-common

| Campo | Valor |
|---|---|
| Categoría | Supply chain / reproducibilidad |
| Severidad final | Medium |
| Confianza | Medium |
| Estado | Sospecha razonable |
| Evidencia | R2 detectó 17 lockfiles sin entrada para @paquete/spfx-common; npm ls raíz falla por root no instalado |
| Archivos | 17 proyectos listados en R2 supply |
| Cómo validarlo de forma segura | Ejecutar npm ci en cada proyecto afectado sin modificar repo |
| Recomendación | Regenerar lockfiles afectados en una tarea controlada y añadir check de coherencia |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## CI-001 — Ausencia total de workflows CI/CD versionados

| Campo | Valor |
|---|---|
| Categoría | CI/CD |
| Severidad final | High |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | workflow-summary.json=[]; .github solo contiene copilot-instructions.md |
| Archivos | .github |
| Cómo validarlo de forma segura | Listar .github/workflows y required checks del repo |
| Recomendación | Crear workflow de PR con build/test/lint/SCA/secrets y permisos mínimos |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P1 |

## QA-001 — Tests existentes no ejecutados automáticamente

| Campo | Valor |
|---|---|
| Categoría | QA / release readiness |
| Severidad final | High |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | testFileCount=212; workflows=0; builds no ejecutados por restricción de no generar artefactos |
| Archivos | projects/*/package.json; .github |
| Cómo validarlo de forma segura | Ejecutar heft test/build en CI por proyecto modificado |
| Recomendación | Gate de PR obligatorio con test/build y reporte de cobertura |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P1 |

## QA-002 — Cobertura desigual: varios proyectos sin tests y gaps negativos/a11y/throttling

| Campo | Valor |
|---|---|
| Categoría | QA |
| Severidad final | Medium |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | architecture-quality-metrics.json; proyectos sin tests: objetivos-del-area, panel-de-campana-interna, presencia-de-sedes, ruta-guiada, tarjeta-de-decision-rapida, turnos-guardias-o-disponibilidad |
| Archivos | projects/* |
| Cómo validarlo de forma segura | Medir cobertura real y revisar proyectos con tests=0 |
| Recomendación | Añadir tests negativos 403/404/429, URLs inválidas, accesibilidad y estados vacíos |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## SMELL-001 — Strings visibles hardcodeados pese a loc files

| Campo | Valor |
|---|---|
| Categoría | Localización / UX |
| Severidad final | Low |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | architecture-quality-metrics.json hardcodedUiStringCandidates |
| Archivos | CorporateAz.tsx; MyUsefulDocuments.tsx; MyTasksAndPending.tsx; ContextHelpPanel.tsx; otros |
| Cómo validarlo de forma segura | Buscar literales de UI fuera de loc y confirmar visibilidad |
| Recomendación | Migrar copy visible a loc/es-es.js, loc/en-us.js y mystrings.d.ts por proyecto |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |

## SMELL-002 — Catch silenciosos/fallbacks sin diagnóstico

| Campo | Valor |
|---|---|
| Categoría | Observabilidad / mantenibilidad |
| Severidad final | Medium |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | source-pattern-counts.json catchSwallow=71 |
| Archivos | scanEngine.ts; reportListRepository.ts; siteMetricsRepository.ts; pageContextAssistantUtils.ts; usefulDocumentsRepository.ts; tasksRepository.ts |
| Cómo validarlo de forma segura | Revisar cada catch y probar fallo controlado |
| Recomendación | Registrar error de forma segura, propagar estado de error y evitar success-shaped fallbacks |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## BUG-001 — Uso frágil de getByTitle con encodeURIComponent en repositorios SharePoint

| Campo | Valor |
|---|---|
| Categoría | Bug funcional |
| Severidad final | Medium |
| Confianza | Medium |
| Estado | Sospecha razonable |
| Evidencia | R1/R2 quality: usefulDocumentsRepository.ts:105-107; tasksRepository.ts:133-140 |
| Archivos | projects/mis-documentos-utiles; projects/mis-tareas-y-pendientes |
| Cómo validarlo de forma segura | Probar títulos con espacios, &, # y comillas en una lista controlada |
| Recomendación | Escapar OData correctamente o resolver lista por ID/server-relative URL |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P2 |

## ARCH-001 — Repositorios/componentes grandes concentran transporte, parsing y reglas

| Campo | Valor |
|---|---|
| Categoría | Arquitectura |
| Severidad final | Low |
| Confianza | High |
| Estado | Confirmado |
| Evidencia | largeFiles: projects/microencuesta/src/webparts/microSurvey/repositories/pollRepository.ts (548 líneas); projects/analizador-de-tamano-y-volumen-de-documentos-historicos/src/webparts/historicalStorageAnalyzer/components/HistoricalStorageAnalyzer.tsx (507 líneas); projects/pulso-del-dia/src/webparts/dailyPulse/repositories/dailyPulseRepository.ts (492 líneas) |
| Archivos | pollRepository.ts; HistoricalStorageAnalyzer.tsx; dailyPulseRepository.ts; otros |
| Cómo validarlo de forma segura | Medir complejidad/fan-out y revisar cobertura por módulo |
| Recomendación | Extraer helpers puros y separar transporte/parsing/reglas en refactors incrementales |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |

## DOC-001 — Drift funcional/nombre en visualizador de biblioteca y papelera

| Campo | Valor |
|---|---|
| Categoría | Documentación / producto |
| Severidad final | Low |
| Confianza | Medium |
| Estado | Sospecha razonable |
| Evidencia | R1 recon: README del proyecto documenta desajuste de dominio/implementación |
| Archivos | projects/visualizador-de-elementos-de-biblioteca-y-papelera-superior/README.md |
| Cómo validarlo de forma segura | Confirmar intención de producto con owner |
| Recomendación | Alinear README, manifest, catálogo y alcance real |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |

## TOOL-001 — Cobertura limitada por herramientas no disponibles/no ejecutadas

| Campo | Valor |
|---|---|
| Categoría | Zona no cubierta |
| Severidad final | Info |
| Confianza | High |
| Estado | No cubierto |
| Evidencia | tool-availability.txt: semgrep/gitleaks/trivy/cyclonedx/cdxgen/dependency-check no disponibles; npm audit no ejecutado |
| Archivos | .audit/red-team/05_raw_tool_outputs/tool-availability.txt |
| Cómo validarlo de forma segura | Ejecutar herramientas en entorno autorizado con red/control de secretos |
| Recomendación | Integrar herramientas en CI y conservar resultados brutos |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | P3 |
