# Validation Progress

Fecha final: 2026-05-29

## Resultado global

| Metrica | Resultado |
| --- | ---: |
| Proyectos SPFx procesables bajo `projects/` | 79 |
| Webparts fisicos detectados | 80 |
| Proyectos legacy directos | 52 |
| Proyectos governance anidados | 27 |
| Proyectos con validacion final registrada | 79/79 |
| Proyectos fallidos tras correcciones | 0 |
| Logs finales con warnings de lint/Jest buscados | 0 coincidencias |

La evidencia ejecutable queda registrada en `docs/orchestrator/run-manifest.json` y `docs/orchestrator/logs/`. `WP-035` se mantiene como caso especial: el proyecto `visualizador-de-elementos-de-biblioteca-y-papelera-superior` contiene dos webparts fisicos (`recycleBinSpaceCalculator` y `siteStorageDiagnostics`).

## Guardrails finales

| Comando | Estado |
| --- | --- |
| `npm run ci:projects:dry-run -- --all` | Passed |
| `npm run check:locks` | Passed |
| `npm run check:pinned-deps` | Passed |
| `npm run check:secrets` | Passed |
| `npm run check:audit-remediation` | Passed |
| `node .\scripts\audit-webpart-completeness.mjs` | Passed |

## Cobertura

Los builds de proyecto ejecutan `heft test --production` y generan artefactos de cobertura donde aplica, pero el repositorio no define un umbral global verificable de 100%. Por tanto, el estado final no declara cobertura 100%; declara build, lint integrado, tests y package SPFx correctos con los scripts reales existentes.

## Estado por proyecto

| ID | Proyecto | Ruta | Estado final | Evidencia | Bloqueos |
| --- | --- | --- | --- | --- | --- |
| P001 | a-z-corporativo | `a-z-corporativo` | Validado | install/build/test/package registrado | Ninguno |
| P002 | accesos-rapidos-por-audiencia | `accesos-rapidos-por-audiencia` | Validado | install/build/test/package registrado | Ninguno |
| P003 | agenda-del-equipo | `agenda-del-equipo` | Validado | install/build/test/package registrado tras correccion | Ninguno |
| P004 | analizador-de-tamano-y-volumen-de-documentos-historicos | `analizador-de-tamano-y-volumen-de-documentos-historicos` | Validado | install/build/test/package registrado tras correccion | Ninguno |
| P005 | asistente-contextual-de-pagina | `asistente-contextual-de-pagina` | Validado | install/build/test/package registrado tras correccion | Ninguno |
| P006 | barra-de-avisos-urgentes | `barra-de-avisos-urgentes` | Validado | install/build/test/package registrado | Ninguno |
| P007 | biblioteca-de-plantillas | `biblioteca-de-plantillas` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P008 | buscador-de-recursos-corporativos | `buscador-de-recursos-corporativos` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P009 | buzon-de-ideas | `buzon-de-ideas` | Validado | install/build/test/package registrado | Ninguno |
| P010 | centro-de-acciones-rapidas | `centro-de-acciones-rapidas` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P011 | checklist-de-offboarding-o-cambios | `checklist-de-offboarding-o-cambios` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P012 | checklist-de-onboarding | `checklist-de-onboarding` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P013 | como-hago-esto | `como-hago-esto` | Validado | install/build/test/package registrado | Ninguno |
| P014 | componente-segun-tu-perfil | `componente-segun-tu-perfil` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P015 | conoce-al-equipo | `conoce-al-equipo` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P016 | cuenta-atras-a-eventos | `cuenta-atras-a-eventos` | Validado | lockfile sincronizado y build registrado | Ninguno |
| P017 | cumpleanos-y-aniversarios | `cumpleanos-y-aniversarios` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P018 | directorio-express | `directorio-express` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P019 | estado-de-incidencias-destacadas | `estado-de-incidencias-destacadas` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P020 | estado-de-proyectos | `estado-de-proyectos` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P021 | estado-de-servicios-internos | `estado-de-servicios-internos` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P022 | faq-inteligente | `faq-inteligente` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P023 | favoritos-personales | `favoritos-personales` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P024 | glosario-corporativo | `glosario-corporativo` | Validado | install/build/test/package registrado | Ninguno |
| P025 | inicia-una-solicitud | `inicia-una-solicitud` | Validado | install/build/test/package registrado | Ninguno |
| P026 | kpi-mini-cards | `kpi-mini-cards` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P027 | lanzador-universal-de-accesos | `lanzador-universal-de-accesos` | Validado | install/build/test/package registrado | Ninguno |
| P028 | mantenimientos-programados | `mantenimientos-programados` | Validado | install/build/test/package registrado | Ninguno |
| P029 | mapa-de-portales | `mapa-de-portales` | Validado | lockfile sincronizado, act warning corregido y build registrado | Ninguno |
| P030 | microencuesta | `microencuesta` | Validado | lockfile sincronizado y build registrado | Ninguno |
| P031 | mini-organigrama | `mini-organigrama` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P032 | mis-accesos-recientes | `mis-accesos-recientes` | Validado | install/build/test/package registrado | Ninguno |
| P033 | mis-aprobaciones | `mis-aprobaciones` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P034 | mis-documentos-utiles | `mis-documentos-utiles` | Validado | install/build/test/package registrado | Ninguno |
| P035 | mis-tareas-y-pendientes | `mis-tareas-y-pendientes` | Validado | install/build/test/package registrado | Ninguno |
| P036 | noticias-por-area | `noticias-por-area` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P037 | nuevas-incorporaciones | `nuevas-incorporaciones` | Validado | install/build/test/package registrado | Ninguno |
| P038 | objetivos-del-area | `objetivos-del-area` | Validado | install/build/test/package registrado | Ninguno |
| P039 | panel-de-campana-interna | `panel-de-campana-interna` | Validado | install/build/test/package registrado | Ninguno |
| P040 | pregunta-destacada | `pregunta-destacada` | Validado | install/build/test/package registrado | Ninguno |
| P041 | presencia-de-sedes | `presencia-de-sedes` | Validado | install/build/test/package registrado | Ninguno |
| P042 | proximos-hitos | `proximos-hitos` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P043 | pulso-del-dia | `pulso-del-dia` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P044 | que-ha-cambiado | `que-ha-cambiado` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P045 | reconocimientos | `reconocimientos` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P046 | reserva-rapida | `reserva-rapida` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P047 | resumen-de-noticias | `resumen-de-noticias` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P048 | resumen-semanal-automatico | `resumen-semanal-automatico` | Validado | install/build/test/package registrado y warning cleanup | Ninguno |
| P049 | ruta-guiada | `ruta-guiada` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P050 | adoption-risk-metrics | `sharepoint-governance-webparts/adoption-risk-metrics` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P051 | approval-flows-governance | `sharepoint-governance-webparts/approval-flows-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P052 | audit-activity-review | `sharepoint-governance-webparts/audit-activity-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P053 | content-owners-governance | `sharepoint-governance-webparts/content-owners-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P054 | copilot-readiness | `sharepoint-governance-webparts/copilot-readiness` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P055 | duplicate-sites-control | `sharepoint-governance-webparts/duplicate-sites-control` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P056 | external-sharing-review | `sharepoint-governance-webparts/external-sharing-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P057 | inactive-sites-validation | `sharepoint-governance-webparts/inactive-sites-validation` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P058 | inherited-access-review | `sharepoint-governance-webparts/inherited-access-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P059 | intranet-publishing-governance | `sharepoint-governance-webparts/intranet-publishing-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P060 | obsolete-content-review | `sharepoint-governance-webparts/obsolete-content-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P061 | onedrive-sync-limits | `sharepoint-governance-webparts/onedrive-sync-limits` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P062 | orphan-sites-review | `sharepoint-governance-webparts/orphan-sites-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P063 | retention-compliance-governance | `sharepoint-governance-webparts/retention-compliance-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P064 | security-compliance-review | `sharepoint-governance-webparts/security-compliance-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P065 | sensitive-content-review | `sharepoint-governance-webparts/sensitive-content-review` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P066 | sensitivity-labels-governance | `sharepoint-governance-webparts/sensitivity-labels-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P067 | site-archive-retention-governance | `sharepoint-governance-webparts/site-archive-retention-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P068 | site-creation-governance | `sharepoint-governance-webparts/site-creation-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P069 | site-lifecycle-governance | `sharepoint-governance-webparts/site-lifecycle-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P070 | site-owner-training | `sharepoint-governance-webparts/site-owner-training` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P071 | storage-governance | `sharepoint-governance-webparts/storage-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P072 | storage-quota-governance | `sharepoint-governance-webparts/storage-quota-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P073 | support-model-governance | `sharepoint-governance-webparts/support-model-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P074 | tenant-site-inventory | `sharepoint-governance-webparts/tenant-site-inventory` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P075 | user-good-practices | `sharepoint-governance-webparts/user-good-practices` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P076 | version-control-governance | `sharepoint-governance-webparts/version-control-governance` | Validado | install/build/test/package registrado | Backend real pendiente por diseno |
| P077 | tarjeta-de-decision-rapida | `tarjeta-de-decision-rapida` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P078 | turnos-guardias-o-disponibilidad | `turnos-guardias-o-disponibilidad` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
| P079 | visualizador-de-elementos-de-biblioteca-y-papelera-superior | `visualizador-de-elementos-de-biblioteca-y-papelera-superior` | Validado | install/build/test/package registrado tras warning cleanup | Ninguno |
