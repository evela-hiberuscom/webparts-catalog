# Informe técnico final consolidado

# Hallazgo SEC-001 — Airtable PAT presente en .env.local local e ignorado

* Severidad: Low
* Confianza: High
* Estado: Confirmado
* Categoría: Secretos
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: .env.local (no trackeado), .gitignore, scripts/lib/airtable.mjs
* Líneas aproximadas: ver evidencia asociada
* Evidencia: secret-scan-local-masked.json; env-local-tracking-status.txt; .gitignore:1-4
* Explicación: Airtable PAT presente en .env.local local e ignorado impacta secretos con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Ejecutar gitleaks localmente y revisar historial sin imprimir el secreto
* Recomendación: Rotar el PAT si se compartió el entorno; mantenerlo en secretos del entorno y nunca en Git
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3

# Hallazgo SEC-002 — window.open('_blank') sin noopener/noreferrer ni allowlist de URL

* Severidad: Low
* Confianza: High
* Estado: Confirmado
* Categoría: Seguridad aplicativa
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: MyUsefulDocuments.tsx:60; MyTasksAndPending.tsx:69; NewJoiners.tsx:52; AreaGoals.tsx:71; InternalCampaignPanel.tsx:52
* Líneas aproximadas: ver evidencia asociada
* Evidencia: source-pattern-matches.json windowOpen: 5 hits _blank
* Explicación: window.open('_blank') sin noopener/noreferrer ni allowlist de URL impacta seguridad aplicativa con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Prueba un enlace externo controlado y verifica que window.opener sea null
* Recomendación: Usar helper seguro de enlace, tercer argumento 'noopener,noreferrer' y validación de protocolo/origen
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3

# Hallazgo SEC-003 — Persistencia local de respuestas/identidad ligera en localStorage

* Severidad: Low
* Confianza: High
* Estado: Confirmado
* Categoría: Privacidad e integridad cliente
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/microencuesta; projects/pulso-del-dia
* Líneas aproximadas: ver evidencia asociada
* Evidencia: MicroSurveyWebPart.ts:36-44; pollRepository.ts:253-293; dailyPulseRepository.ts:35-85,401-489
* Explicación: Persistencia local de respuestas/identidad ligera en localStorage impacta privacidad e integridad cliente con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Inspeccionar claves localStorage tras responder; comprobar TTL/purga y no PII directa
* Recomendación: Documentar finalidad, limitar datos, añadir TTL/purga y no tratar localStorage como boundary de seguridad
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3

# Hallazgo SEC-004 — JsonUrl configurable sin restricción same-origin en mis-accesos-recientes

* Severidad: Medium
* Confianza: Medium
* Estado: Sospecha razonable
* Categoría: Seguridad aplicativa / gobierno de dominios
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/mis-accesos-recientes/src/webparts/myRecentAccesses/repositories/JsonRecentAccessesRepository.ts; MyRecentAccessesWebPart.ts
* Líneas aproximadas: ver evidencia asociada
* Evidencia: R2: JsonRecentAccessesRepository.ts fetch(this._url); property pane recentItemsJsonUrl
* Explicación: JsonUrl configurable sin restricción same-origin en mis-accesos-recientes impacta seguridad aplicativa / gobierno de dominios con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Configurar URL externa en property pane en entorno local controlado y verificar si se permite
* Recomendación: Reutilizar validación same-origin de otros proyectos o exigir allowlist explícita documentada
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo SUPPLY-001 — Sin SCA/SBOM/Dependabot/Renovate versionados

* Severidad: Medium
* Confianza: High
* Estado: Confirmado
* Categoría: Supply chain
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: .github, package.json, projects/*/package.json
* Líneas aproximadas: ver evidencia asociada
* Evidencia: tool-availability.txt; workflow-summary.json=[]; ausencia de dependabot/renovate/SBOM
* Explicación: Sin SCA/SBOM/Dependabot/Renovate versionados impacta supply chain con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Buscar dependabot.yml/renovate.json/SBOM y ejecutar SCA en CI
* Recomendación: Añadir Dependabot/Renovate, SBOM CycloneDX y npm audit controlado en CI
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo SUPPLY-002 — Rangos flotantes y skew de lockfiles entre 52 proyectos

* Severidad: Medium
* Confianza: High
* Estado: Confirmado
* Categoría: Supply chain / reproducibilidad
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/*/package.json; projects/*/package-lock.json
* Líneas aproximadas: ver evidencia asociada
* Evidencia: dependency-aggregate-summary.json floatingDependencyOccurrenceCount=207; lockfile-summary.json versionSkewCount=139
* Explicación: Rangos flotantes y skew de lockfiles entre 52 proyectos impacta supply chain / reproducibilidad con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Ejecutar npm ci por proyecto en CI limpio
* Recomendación: Pinning estricto o actualización agrupada; revisar lockfiles en PR
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo SUPPLY-003 — Lockfiles potencialmente desincronizados con @paquete/spfx-common

* Severidad: Medium
* Confianza: Medium
* Estado: Sospecha razonable
* Categoría: Supply chain / reproducibilidad
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: 17 proyectos listados en R2 supply
* Líneas aproximadas: ver evidencia asociada
* Evidencia: R2 detectó 17 lockfiles sin entrada para @paquete/spfx-common; npm ls raíz falla por root no instalado
* Explicación: Lockfiles potencialmente desincronizados con @paquete/spfx-common impacta supply chain / reproducibilidad con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Ejecutar npm ci en cada proyecto afectado sin modificar repo
* Recomendación: Regenerar lockfiles afectados en una tarea controlada y añadir check de coherencia
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo CI-001 — Ausencia total de workflows CI/CD versionados

* Severidad: High
* Confianza: High
* Estado: Confirmado
* Categoría: CI/CD
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: .github
* Líneas aproximadas: ver evidencia asociada
* Evidencia: workflow-summary.json=[]; .github solo contiene copilot-instructions.md
* Explicación: Ausencia total de workflows CI/CD versionados impacta ci/cd con el nivel de exposición descrito.
* Impacto: Alto operacional
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Listar .github/workflows y required checks del repo
* Recomendación: Crear workflow de PR con build/test/lint/SCA/secrets y permisos mínimos
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P1

# Hallazgo QA-001 — Tests existentes no ejecutados automáticamente

* Severidad: High
* Confianza: High
* Estado: Confirmado
* Categoría: QA / release readiness
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/*/package.json; .github
* Líneas aproximadas: ver evidencia asociada
* Evidencia: testFileCount=212; workflows=0; builds no ejecutados por restricción de no generar artefactos
* Explicación: Tests existentes no ejecutados automáticamente impacta qa / release readiness con el nivel de exposición descrito.
* Impacto: Alto operacional
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Ejecutar heft test/build en CI por proyecto modificado
* Recomendación: Gate de PR obligatorio con test/build y reporte de cobertura
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P1

# Hallazgo QA-002 — Cobertura desigual: varios proyectos sin tests y gaps negativos/a11y/throttling

* Severidad: Medium
* Confianza: High
* Estado: Confirmado
* Categoría: QA
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/*
* Líneas aproximadas: ver evidencia asociada
* Evidencia: architecture-quality-metrics.json; proyectos sin tests: objetivos-del-area, panel-de-campana-interna, presencia-de-sedes, ruta-guiada, tarjeta-de-decision-rapida, turnos-guardias-o-disponibilidad
* Explicación: Cobertura desigual: varios proyectos sin tests y gaps negativos/a11y/throttling impacta qa con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Medir cobertura real y revisar proyectos con tests=0
* Recomendación: Añadir tests negativos 403/404/429, URLs inválidas, accesibilidad y estados vacíos
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo SMELL-001 — Strings visibles hardcodeados pese a loc files

* Severidad: Low
* Confianza: High
* Estado: Confirmado
* Categoría: Localización / UX
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: CorporateAz.tsx; MyUsefulDocuments.tsx; MyTasksAndPending.tsx; ContextHelpPanel.tsx; otros
* Líneas aproximadas: ver evidencia asociada
* Evidencia: architecture-quality-metrics.json hardcodedUiStringCandidates
* Explicación: Strings visibles hardcodeados pese a loc files impacta localización / ux con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Buscar literales de UI fuera de loc y confirmar visibilidad
* Recomendación: Migrar copy visible a loc/es-es.js, loc/en-us.js y mystrings.d.ts por proyecto
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3

# Hallazgo SMELL-002 — Catch silenciosos/fallbacks sin diagnóstico

* Severidad: Medium
* Confianza: High
* Estado: Confirmado
* Categoría: Observabilidad / mantenibilidad
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: scanEngine.ts; reportListRepository.ts; siteMetricsRepository.ts; pageContextAssistantUtils.ts; usefulDocumentsRepository.ts; tasksRepository.ts
* Líneas aproximadas: ver evidencia asociada
* Evidencia: source-pattern-counts.json catchSwallow=71
* Explicación: Catch silenciosos/fallbacks sin diagnóstico impacta observabilidad / mantenibilidad con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Revisar cada catch y probar fallo controlado
* Recomendación: Registrar error de forma segura, propagar estado de error y evitar success-shaped fallbacks
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo BUG-001 — Uso frágil de getByTitle con encodeURIComponent en repositorios SharePoint

* Severidad: Medium
* Confianza: Medium
* Estado: Sospecha razonable
* Categoría: Bug funcional
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/mis-documentos-utiles; projects/mis-tareas-y-pendientes
* Líneas aproximadas: ver evidencia asociada
* Evidencia: R1/R2 quality: usefulDocumentsRepository.ts:105-107; tasksRepository.ts:133-140
* Explicación: Uso frágil de getByTitle con encodeURIComponent en repositorios SharePoint impacta bug funcional con el nivel de exposición descrito.
* Impacto: Medio
* Probabilidad: Media
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Probar títulos con espacios, &, # y comillas en una lista controlada
* Recomendación: Escapar OData correctamente o resolver lista por ID/server-relative URL
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P2

# Hallazgo ARCH-001 — Repositorios/componentes grandes concentran transporte, parsing y reglas

* Severidad: Low
* Confianza: High
* Estado: Confirmado
* Categoría: Arquitectura
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: pollRepository.ts; HistoricalStorageAnalyzer.tsx; dailyPulseRepository.ts; otros
* Líneas aproximadas: ver evidencia asociada
* Evidencia: largeFiles: projects/microencuesta/src/webparts/microSurvey/repositories/pollRepository.ts (548 líneas); projects/analizador-de-tamano-y-volumen-de-documentos-historicos/src/webparts/historicalStorageAnalyzer/components/HistoricalStorageAnalyzer.tsx (507 líneas); projects/pulso-del-dia/src/webparts/dailyPulse/repositories/dailyPulseRepository.ts (492 líneas)
* Explicación: Repositorios/componentes grandes concentran transporte, parsing y reglas impacta arquitectura con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Medir complejidad/fan-out y revisar cobertura por módulo
* Recomendación: Extraer helpers puros y separar transporte/parsing/reglas en refactors incrementales
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3

# Hallazgo DOC-001 — Drift funcional/nombre en visualizador de biblioteca y papelera

* Severidad: Low
* Confianza: Medium
* Estado: Sospecha razonable
* Categoría: Documentación / producto
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: projects/visualizador-de-elementos-de-biblioteca-y-papelera-superior/README.md
* Líneas aproximadas: ver evidencia asociada
* Evidencia: R1 recon: README del proyecto documenta desajuste de dominio/implementación
* Explicación: Drift funcional/nombre en visualizador de biblioteca y papelera impacta documentación / producto con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Confirmar intención de producto con owner
* Recomendación: Alinear README, manifest, catálogo y alcance real
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3

# Hallazgo TOOL-001 — Cobertura limitada por herramientas no disponibles/no ejecutadas

* Severidad: Info
* Confianza: High
* Estado: No cubierto
* Categoría: Zona no cubierta
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: .audit/red-team/05_raw_tool_outputs/tool-availability.txt
* Líneas aproximadas: ver evidencia asociada
* Evidencia: tool-availability.txt: semgrep/gitleaks/trivy/cyclonedx/cdxgen/dependency-check no disponibles; npm audit no ejecutado
* Explicación: Cobertura limitada por herramientas no disponibles/no ejecutadas impacta zona no cubierta con el nivel de exposición descrito.
* Impacto: Bajo/Informativo
* Probabilidad: Media-Alta
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: Ejecutar herramientas en entorno autorizado con red/control de secretos
* Recomendación: Integrar herramientas en CI y conservar resultados brutos
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: Bajo/Medio
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: P3
