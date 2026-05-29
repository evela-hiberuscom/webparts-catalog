# Catálogo de Web Parts SPFx — Paquete SharePoint Online

| Campo | Valor |
|-------|-------|
| **Versión del catálogo** | 1.1.0 |
| **Fecha de última actualización** | 2026-05-28 |
| **Repositorio** | `paquete-webparts` |
| **Stack** | SPFx 1.22.2, React 17.0.1, Fluent UI ^8.106.4, TypeScript ~5.8.0 |
| **Total de web parts físicos** | 80 |
| **Entradas numeradas del catálogo** | 79 (`WP-001`–`WP-079`; `WP-035` contiene 2 webparts físicos) |
| **Total de proyectos SPFx independientes** | 79 (52 legacy directos + 27 bajo `projects/sharepoint-governance-webparts/`) |
| **Build system** | Heft (`heft build --clean --production`) |
| **Node** | >=22.14.0 < 23.0.0 |
| **Paquete compartido** | `@paquete/spfx-common` en proyectos legacy; los nuevos webparts de gobernanza usan contratos documentales compartidos en `_governance/` |

---

## 1. Resumen Ejecutivo

El repositorio `paquete-webparts` contiene **80 web parts SPFx físicos** organizados en 13 categorías funcionales. Hay **53 webparts legacy** y **27 nuevos webparts de gobernanza SharePoint/Teams** bajo `projects/sharepoint-governance-webparts/`. Todos comparten un baseline técnico uniforme:

- **SPFx 1.22.2** con React 17.0.1 y Fluent UI v8
- **Heft** como sistema de build (rushstack/heft 1.1.2)
- **TypeScript ~5.8.0** con configuraciones de ESLint idénticas en todos los proyectos
- **`@paquete/spfx-common`** como paquete de utilidades compartido en el catálogo legacy
- **`_governance/docs/shared-*`** como contratos conceptuales compartidos para los 27 webparts de gobernanza
- **Workspaces npm** con 9 scripts de orquestación en el root (`package.json`)

**Distribución por estado de madurez:**

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| Maduro | 28 | 35% |
| Reutilizable | 9 | 11% |
| Experimental | 13 | 16% |
| Incompleto | 3 | 4% |
| Mock-backed auditado / backend pendiente | 27 | 34% |

**Distribución orientativa por niveles de reutilización:**

| Nivel | Cantidad | Porcentaje |
|-------|----------|------------|
| Alta | 22 | 28% |
| Media | 48 | 60% |
| Baja | 10 | 12% |

**Adopción de patrones de calidad (sobre 80 web parts físicos):**

| Patrón | Presente | Ausente | Tasa |
|--------|----------|---------|------|
| ErrorBoundary | 67 | 13 | 84% |
| onThemeChanged (dark mode explícito) | 38 | 42 | 48% |
| Teams context detection explícito | 26 | 54 | 33% |
| onDispose (cleanup React) | 51 | 29 | 64% |
| Service/Repository layer | 63 | 17 | 79% |
| Mock mode visible + contrato backend documentado | 27 | 53 | 34% |

---

## 2. Índice Rápido de Web Parts

### CAT-A: Gestión Documental (3 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 001 | `biblioteca-de-plantillas` | `TemplatesLibraryWebPart` | Maduro | Media |
| 002 | `mis-documentos-utiles` | `MyUsefulDocumentsWebPart` | Maduro | Alta |
| 003 | `favoritos-personales` | `PersonalFavoritesWebPart` | Maduro | Alta |

### CAT-B: RRHH y Equipo (6 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 004 | `conoce-al-equipo` | `MeetTheTeamWebPart` | Maduro | Alta |
| 005 | `cumpleanos-y-aniversarios` | `BirthdaysAndAnniversariesWebPart` | Reutilizable | Alta |
| 006 | `nuevas-incorporaciones` | `NewJoinersWebPart` | Maduro | Alta |
| 007 | `reconocimientos` | `RecognitionsWebPart` | Maduro | Media |
| 008 | `mini-organigrama` | `MiniOrgChartWebPart` | Maduro | Media |
| 009 | `componente-segun-tu-perfil` | `ProfileBasedComponentWebPart` | Experimental | Baja |

### CAT-C: Comunicación Interna (6 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 010 | `barra-de-avisos-urgentes` | `UrgentAlertBarWebPart` | Maduro | Alta |
| 011 | `panel-de-campana-interna` | `InternalCampaignPanelWebPart` | Incompleto | Alta |
| 012 | `resumen-de-noticias` | `NewsSummaryWebPart` | Maduro | Media |
| 013 | `noticias-por-area` | `NewsByAreaWebPart` | Maduro | Media |
| 014 | `pulso-del-dia` | `DailyPulseWebPart` | Reutilizable | Media |
| 015 | `buzon-de-ideas` | `IdeasMailboxWebPart` | Reutilizable | Media |

### CAT-D: Productividad Personal (3 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 016 | `mis-aprobaciones` | `MyApprovalsWebPart` | Maduro | Media |
| 017 | `mis-tareas-y-pendientes` | `MyTasksAndPendingWebPart` | Maduro | Alta |
| 018 | `mis-accesos-recientes` | `MyRecentAccessesWebPart` | Maduro | Alta |

### CAT-E: Dashboard / KPIs (5 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 019 | `kpi-mini-cards` | `KpiMiniCardsWebPart` | Maduro | Media |
| 020 | `estado-de-proyectos` | `ProjectStatusWebPart` | Maduro | Media |
| 021 | `estado-de-servicios-internos` | `InternalServicesStatusWebPart` | Reutilizable | Alta |
| 022 | `estado-de-incidencias-destacadas` | `HighlightedIncidentsWebPart` | Reutilizable | Alta |
| 023 | `proximos-hitos` | `UpcomingMilestonesWebPart` | Maduro | Media |

### CAT-F: Catálogos / Portales / Launchers (6 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 024 | `lanzador-universal-de-accesos` | `UniversalAppLauncherWebPart` | Maduro | Media |
| 025 | `accesos-rapidos-por-audiencia` | `AudienceQuickLinksWebPart` | Reutilizable | Alta |
| 026 | `directorio-express` | `ExpressDirectoryWebPart` | Maduro | Alta |
| 027 | `buscador-de-recursos-corporativos` | `CorporateResourcesSearchWebPart` | Maduro | Alta |
| 028 | `a-z-corporativo` | `CorporateAzWebPart` | Experimental | Media |
| 029 | `mapa-de-portales` | `PortalMapWebPart` | Reutilizable | Baja |

### CAT-G: Checklists / Flujos (4 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 030 | `checklist-de-onboarding` | `OnboardingChecklistWebPart` | Maduro | Alta |
| 031 | `checklist-de-offboarding-o-cambios` | `OffboardingOrChangeChecklistWebPart` | Maduro | Alta |
| 032 | `inicia-una-solicitud` | `StartARequestWebPart` | Maduro | Media |
| 033 | `ruta-guiada` | `GuidedRouteWebPart` | Experimental | Media |

### CAT-H: Diagnostics / Monitorización (4 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 034 | `analizador-de-tamano-y-volumen-de-documentos-historicos` | `HistoricalStorageAnalyzerWebPart` | Experimental | Baja |
| 035 | `visualizador-de-elementos-de-biblioteca-y-papelera-superior` (35.1) | `SiteStorageDiagnosticsWebPart` | Experimental | Baja |
| 035 | `visualizador-de-elementos-de-biblioteca-y-papelera-superior` (35.2) | `RecycleBinSpaceCalculatorWebPart` | — | — |
| 036 | `que-ha-cambiado` | `WhatChangedFeedWebPart` | Maduro | Alta |

### CAT-I: Formación / Conocimiento (4 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 037 | `faq-inteligente` | `SmartFaqWebPart` | Maduro | Alta |
| 038 | `como-hago-esto` | `HowDoIDoThisWebPart` | Maduro | Media |
| 039 | `glosario-corporativo` | `CorporateGlossaryWebPart` | Maduro | Alta |
| 040 | `pregunta-destacada` | `FeaturedQuestionWebPart` | Experimental | Baja |

### CAT-J: Tiempo / Eventos y Engagement (5 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 041 | `agenda-del-equipo` | `TeamAgendaWebPart` | Maduro | Media |
| 042 | `cuenta-atras-a-eventos` | `EventCountdownWebPart` | Reutilizable | Media |
| 043 | `turnos-guardias-o-disponibilidad` | `ShiftsGuardsAvailabilityWebPart` | Experimental | Baja |
| 044 | `presencia-de-sedes` | `SitesPresenceWebPart` | Experimental | Baja |
| 045 | `microencuesta` | `MicroSurveyWebPart` | Maduro | Media |

### CAT-K: Gobierno / Reporting (3 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 046 | `objetivos-del-area` | `AreaGoalsWebPart` | Experimental | Baja |
| 047 | `resumen-semanal-automatico` | `AutomaticWeeklySummaryWebPart` | Maduro | Baja |
| 048 | `mantenimientos-programados` | `PlannedMaintenanceWebPart` | Incompleto | Baja |

### CAT-L: Navegación / Acceso (4 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 049 | `reserva-rapida` | `QuickBookingWebPart` | Maduro | Baja |
| 050 | `asistente-contextual-de-pagina` | `PageContextAssistantWebPart` | Reutilizable | Alta |
| 051 | `centro-de-acciones-rapidas` | `QuickActionsCenterWebPart` | Reutilizable | Alta |
| 052 | `tarjeta-de-decision-rapida` | `QuickDecisionCardWebPart` | Incompleto | Baja |

### CAT-M: SharePoint Governance / Teams Governance (27 webs)

| # | Folder | WebPart Class | Estado | Reutilización |
|---|--------|--------------|--------|---------------|
| 053 | `sharepoint-governance-webparts/site-creation-governance` | `SiteCreationGovernanceWebPart` | Mock-backed auditado | Media |
| 054 | `sharepoint-governance-webparts/duplicate-sites-control` | `DuplicateSitesControlWebPart` | Mock-backed auditado | Media |
| 055 | `sharepoint-governance-webparts/orphan-sites-review` | `OrphanSitesReviewWebPart` | Mock-backed auditado | Media |
| 056 | `sharepoint-governance-webparts/site-lifecycle-governance` | `SiteLifecycleGovernanceWebPart` | Mock-backed auditado | Media |
| 057 | `sharepoint-governance-webparts/inactive-sites-validation` | `InactiveSitesValidationWebPart` | Mock-backed auditado | Media |
| 058 | `sharepoint-governance-webparts/site-archive-retention-governance` | `SiteArchiveRetentionGovernanceWebPart` | Mock-backed auditado | Media |
| 059 | `sharepoint-governance-webparts/inherited-access-review` | `InheritedAccessReviewWebPart` | Mock-backed auditado | Media |
| 060 | `sharepoint-governance-webparts/external-sharing-review` | `ExternalSharingReviewWebPart` | Mock-backed auditado | Media |
| 061 | `sharepoint-governance-webparts/sensitivity-labels-governance` | `SensitivityLabelsGovernanceWebPart` | Mock-backed auditado | Media |
| 062 | `sharepoint-governance-webparts/retention-compliance-governance` | `RetentionComplianceGovernanceWebPart` | Mock-backed auditado | Media |
| 063 | `sharepoint-governance-webparts/audit-activity-review` | `AuditActivityReviewWebPart` | Mock-backed auditado | Media |
| 064 | `sharepoint-governance-webparts/storage-governance` | `StorageGovernanceWebPart` | Mock-backed auditado | Media |
| 065 | `sharepoint-governance-webparts/storage-quota-governance` | `StorageQuotaGovernanceWebPart` | Mock-backed auditado | Media |
| 066 | `sharepoint-governance-webparts/version-control-governance` | `VersionControlGovernanceWebPart` | Mock-backed auditado | Media |
| 067 | `sharepoint-governance-webparts/onedrive-sync-limits` | `OnedriveSyncLimitsWebPart` | Mock-backed auditado | Media |
| 068 | `sharepoint-governance-webparts/intranet-publishing-governance` | `IntranetPublishingGovernanceWebPart` | Mock-backed auditado | Media |
| 069 | `sharepoint-governance-webparts/content-owners-governance` | `ContentOwnersGovernanceWebPart` | Mock-backed auditado | Media |
| 070 | `sharepoint-governance-webparts/obsolete-content-review` | `ObsoleteContentReviewWebPart` | Mock-backed auditado | Media |
| 071 | `sharepoint-governance-webparts/approval-flows-governance` | `ApprovalFlowsGovernanceWebPart` | Mock-backed auditado | Media |
| 072 | `sharepoint-governance-webparts/user-good-practices` | `UserGoodPracticesWebPart` | Mock-backed auditado | Media |
| 073 | `sharepoint-governance-webparts/site-owner-training` | `SiteOwnerTrainingWebPart` | Mock-backed auditado | Media |
| 074 | `sharepoint-governance-webparts/support-model-governance` | `SupportModelGovernanceWebPart` | Mock-backed auditado | Media |
| 075 | `sharepoint-governance-webparts/security-compliance-review` | `SecurityComplianceReviewWebPart` | Mock-backed auditado | Media |
| 076 | `sharepoint-governance-webparts/copilot-readiness` | `CopilotReadinessWebPart` | Mock-backed auditado | Media |
| 077 | `sharepoint-governance-webparts/sensitive-content-review` | `SensitiveContentReviewWebPart` | Mock-backed auditado | Media |
| 078 | `sharepoint-governance-webparts/adoption-risk-metrics` | `AdoptionRiskMetricsWebPart` | Mock-backed auditado | Media |
| 079 | `sharepoint-governance-webparts/tenant-site-inventory` | `TenantSiteInventoryWebPart` | Mock-backed auditado | Media |

---

## 3. Mapa Funcional de la Solución

```
Categoría                | Web Parts | Dominio Principal
-------------------------+-----------+----------------------------------
CAT-A | Gestión Doc.   | 001-003 | Plantillas, documentos útiles, favoritos
CAT-B | RRHH y Equipo  | 004-009 | Equipo, cumpleaños, incorporaciones, organigrama, perfil
CAT-C | Comunicación   | 010-015 | Avisos, campañas, noticias, pulso, ideas
CAT-D | Productividad  | 016-018 | Aprobaciones, tareas, accesos recientes (Graph)
CAT-E | Dashboard/KPIs | 019-023 | KPI cards, proyectos, servicios, incidencias, hitos
CAT-F | Catálogos      | 024-029 | Launchers, accesos por audiencia, directorio, buscador A-Z, portales
CAT-G | Checklists     | 030-033 | Onboarding, offboarding, solicitudes, rutas guiadas
CAT-H | Diagnostics    | 034-036 | Storage analyzer, site diagnostics, recycle bin, cambios
CAT-I | Formación      | 037-040 | FAQ, guías, glosario, pregunta destacada
CAT-J | Tiempo/Eventos | 041-045 | Agenda, cuenta atrás, turnos, presencias, encuestas
CAT-K | Gobierno       | 046-048 | Objetivos, resumen semanal, mantenimiento
CAT-L | Navegación     | 049-052 | Reserva, asistente contextual, acciones rápidas, tarjeta decisión
CAT-M | SPO Governance | 053-079 | Creación, inventario, owners, lifecycle, permisos, external sharing, Purview, Copilot, soporte, adopción
```

**Flujos principales de datos:**

```
SharePoint List  ──────────────────┐
JSON URL    ───────────────────────┤           ┌─> Component Display
API Endpoint ──────────────────────┤──> Repos  ┤
Static Config ─────────────────────┤   + Service┤
Directory (AAD) ───────────────────┤           └─> Theme + Teams + ErrorBoundary
SitePages List ────────────────────┤
Graph API (Recent) ────────────────┘
Search API ────────────────────────┐
Outlook Calendar ──────────────────┘
Mock Governance Repository ────────┐
Backend Governance API (futura) ───┤──> Governance Service ──> Fluent UI Dashboard + ErrorBoundary
Graph / CSOM / Purview / SAM ──────┘
```

---

## 4. Catálogo Detallado

---

### WP-001 | `biblioteca-de-plantillas` | TemplatesLibraryWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 169 |
| **Categoría** | CAT-A — Gestión Documental |
| **Estado** | Maduro |
| **Reutilización** | Media |

**Props (5):**
- `title` — TextField
- `description` — TextField (multiline)
- `sourceKind` — Dropdown (library/list)
- `listTitleOrUrl` — TextField
- `defaultCategory` — TextField
- `maxItems` — Slider (1–100)

**Data Sources:** Library, SharePoint List

**Service/Repo:** `TemplatesLibraryService`, `TemplatesLibraryRepository`

**Calidad:**
- ✅ ErrorBoundary: Sí
- ✅ OnThemeChanged: Dark mode + CSS vars + Teams/Office/Outlook detection
- ✅ onDispose: Yes (ReactDom.unmountComponentAtNode)
- ❌ No issues detectadas

---

### WP-002 | `mis-documentos-utiles` | MyUsefulDocumentsWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 105 |
| **Categoría** | CAT-A — Gestión Documental |
| **Estado** | Maduro |
| **Reutilización** | Alta |

**Props (5):**
- `dataSourceType` — Dropdown (SharePointList/JsonUrl/StaticConfig)
- `listTitleOrUrl` — TextField
- `maxItems` — Slider (1–50)
- `defaultCategory` — TextField
- `autoRefreshSeconds` — number

**Data Sources:** SharePointList, JsonUrl, StaticConfig

**Service/Repo:** `UsefulDocumentsService`, `UsefulDocumentsRepository`

**Calidad:**
- ✅ OnThemeChanged: CSS vars + dark mode
- ❌ Sin WebPartErrorBoundary (render directo del componente)
- ⚠️ Verificar si el componente interno tiene su propia protección contra errores

---

### WP-003 | `favoritos-personales` | PersonalFavoritesWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 153 |
| **Categoría** | CAT-A — Gestión Documental |
| **Estado** | Maduro |
| **Reutilización** | Alta |

**Props (5):**
- `title` — TextField
- `description` — TextField
- `dataSourceType` — Dropdown (StaticConfig/SharePointList)
- `listTitleOrUrl` — TextField
- `maxItems` — Slider (1–24)
- `showMetadata` — Toggle
- `favoritesJson` — TextField (multiline)

**Data Sources:** StaticConfig, SharePointList

**Service/Repo:** Consumo directo al componente desde WebPart (sin capa service intermedia)

**Calidad:**
- ✅ ErrorBoundary: Sí
- ⚠️ Sin detección de tema en el WebPart
- ⚠️ Sin teams context detection

---

### WP-004 | `conoce-al-equipo` | MeetTheTeamWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 164 |
| **Categoría** | CAT-B — RRHH y Equipo |
| **Estado** | Maduro |
| **Reutilización** | Alta |

**Props (10):**
- `title` — TextField
- `description` — TextField (multiline)
- `dataSourceType` — Dropdown (StaticConfig/SharePointList/JsonUrl/Directory)
- `dataSourceTypesCsv` — TextField
- `listTitleOrUrl` — TextField
- `jsonUrl` — TextField
- `directoryEndpoint` — TextField
- `staticMembersJson` — TextField (multiline)
- `sortMode` — Dropdown (manual/role/name)
- `maxItems` — Slider (1–50)

**Data Sources:** StaticConfig, SharePointList, JsonUrl, Directory/API

**Service/Repo:** `normalizeMeetTheTeamWebPartUtils` (utilities de normalización)

**Calidad:**
- ✅ ErrorBoundary: Sí
- ✅ OnThemeChanged: Dark mode + CSS vars
- ✅ onDispose: Yes

---

### WP-005 | `cumpleanos-y-aniversarios` | BirthdaysAndAnniversariesWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | ~120 |
| **Categoría** | CAT-B — RRHH y Equipo |
| **Estado** | Reutilizable |
| **Reutilización** | Alta |

**Props (6):**
- `dataSourceTypesCsv` — string CSV
- `directoryJsonUrl` — TextField
- `listTitleOrUrl` — TextField
- `jsonUrl` — TextField
- `showBirthdays` — Toggle
- `showAnniversaries` — Toggle
- `daysAhead` — number (default 14)

**Data Sources:** Directory (AAD), SharePointList, JsonUrl

**Service/Repo:** `SPHttpClient` directo al componente (sin capa service)

**Calidad:**
- ❌ Sin ErrorBoundary
- ❌ Sin onThemeChanged
- ❌ Sin Teams context detection
- ❌ Sin onDispose

---

### WP-006 | `nuevas-incorporaciones` | NewJoinersWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 108 |
| **Categoría** | CAT-B — RRHH y Equipo |
| **Estado** | Maduro |
| **Reutilización** | Alta |

**Props (5):**
- `dataSourceType` — Dropdown (SharePointList/JsonUrl/StaticConfig)
- `listTitleOrUrl` — TextField
- `maxItems` — Slider (1–20)
- `daysBack` — Slider (7–90)
- `autoRefreshSeconds` — number

**Data Sources:** SharePointList, JsonUrl, StaticConfig

**Service/Repo:** `NewJoinersService`, `NewJoinersRepository`

**Calidad:**
- ✅ ErrorBoundary: Sí
- ✅ OnThemeChanged: CSS vars + dark mode
- ✅ onDispose: Yes

---

### WP-007 | `reconocimientos` | RecognitionsWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 113 |
| **Categoría** | CAT-B — RRHH y Equipo |
| **Estado** | Maduro |
| **Reutilización** | Media |

**Props (6):**
- `title` — TextField
- `description` — TextField
- `dataSourceType` — Dropdown (SharePointList/JsonUrl/StaticConfig)
- `listTitleOrUrl` — TextField
- `maxItems` — Slider (1–12)
- `showPhotos` — Toggle

**Data Sources:** SharePointList, JsonUrl, StaticConfig

**Service/Repo:** `RecognitionsService`

**Calidad:**
- ✅ ErrorBoundary: Sí
- ⚠️ Sin theme detection en el WebPart.ts (el componente puede incluirlo)
- ✅ Reutilización Media: patrón visual específico de tarjetas de reconocimiento

---

### WP-008 | `mini-organigrama` | MiniOrgChartWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 168 |
| **Categoría** | CAT-B — RRHH y Equipo |
| **Estado** | Maduro |
| **Reutilización** | Media |

**Props (8):**
- `title` — TextField
- `description` — TextField
- `dataSourceTypesCsv` — TextField
- `listTitleOrUrl` — TextField
- `jsonUrl` — TextField
- `staticConfigJson` — TextField (multiline)
- `rootPersonId` — TextField
- `viewMode` — Dropdown (managerWithReports/chain/smallTree)
- `maxDepth` — TextField
- `directoryEndpoint` — TextField

**Utilities:** `normalizeDataSourceTypes`, `sanitizeMaxDepth`

**Data Sources:** Directory (AAD), SharePointList, JsonUrl, StaticConfig

**Calidad:**
- ✅ ErrorBoundary: Sí (envuelto dentro del render)
- ✅ OnThemeChanged: Dark mode + CSS vars + Teams detection
- ✅ onDispose: Yes

---

### WP-009 | `componente-segun-tu-perfil` | ProfileBasedComponentWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | ~140 |
| **Categoría** | CAT-B — RRHH y Equipo |
| **Estado** | Experimental |
| **Reutilización** | Baja |

**Props (10):**
- `title`, `description`, `dataSourceType`, `listTitleOrUrl`, `jsonUrl`, `staticConfigJson`, `audienceMode` (department/country/role/group/hybrid), `fallbackMode` (generic/empty), `profileTokens`, `maxItems`

**Data Sources:** SharePointList, JsonUrl, StaticConfig

**Calidad:**
- ❌ `isDarkTheme: false` hardcoded — `onThemeChanged` NOT implemented
- ❌ Sin ErrorBoundary
- ⚠️ Has `hasTeamsContext` detection
- ⚠️ Alto acoplamiento → baja reutilización

---

### WP-010 | `barra-de-avisos-urgentes` | UrgentAlertBarWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 128 |
| **Categoría** | CAT-C — Comunicación Interna |
| **Estado** | Maduro |
| **Reutilización** | Alta |

**Props (6):**
- `dataSourceType` — ChoiceGroup (SharePointList/JsonUrl/StaticConfig)
- `listTitleOrUrl` — TextField
- `jsonUrl` — TextField
- `staticConfigJson` — TextField (multiline, 8 rows)
- `maxAlerts` — Slider (1–10)
- `dismissible` — Toggle

**Data Sources:** SharePointList, JsonUrl, StaticConfig

**Service/Repo:** `SPHttpClient` directo al componente (sin service layer)

**Unique:** `onAfterDeserialize` personalizado para migración y valores por defecto

**Calidad:**
- ❌ Sin ErrorBoundary
- ❌ Sin theme detection
- ⚠️ Patrón `SPHttpClient` directo (no sigue la convención service/repo para este proyecto)

---

### WP-011 | `panel-de-campana-interna` | InternalCampaignPanelWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | ~110 |
| **Categoría** | CAT-C — Comunicación Interna |
| **Estado** | Incompleto |
| **Reutilización** | Alta |

**Props (4):**
- `dataSourceType` — Dropdown (SharePointList/JsonUrl/StaticConfig)
- `listTitleOrUrl` — TextField
- `maxItems` — Slider (1–10)
- `autoRefreshSeconds` — number

**Data Sources:** SharePointList, JsonUrl, StaticConfig

**Service/Repo:** `CampaignService`, `CampaignRepository` (fetch + spHttpClient)

**Calidad:**
- ❌ Sin ErrorBoundary
- ❌ Sin Teams context
- ❌ Sin onThemeChanged
- ✅ Servicio y repositorio implementados correctamente

---

### WP-012 | `resumen-de-noticias` | NewsSummaryWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | 163 |
| **Categoría** | CAT-C — Comunicación Interna |
| **Estado** | Maduro |
| **Reutilización** | Media |

**Props (5):**
- `title` — TextField
- `description` — TextField (multiline)
- `sitePagesListTitle` — TextField
- `maxItems` — Slider (1–12)
- `featuredFirst` — Toggle

**Data Sources:** SharePoint SitePages list

**Service/Repo:** `NewsSummaryService`, `NewsSummaryRepository`

**Calidad:**
- ✅ ErrorBoundary: Sí
- ✅ OnThemeChanged: Dark mode + CSS vars + Teams/Office/Outlook/env detection
- ✅ Full Teams integration

---

### WP-013 | `noticias-por-area` | NewsByAreaWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | ~140 |
| **Categoría** | CAT-C — Comunicación Interna |
| **Estado** | Maduro |
| **Reutilización** | Media |

**Props (6):**
- `title`, `description` (multiline), `areaFilter` (TextField), `sitePagesListTitle`, `maxItems` Slider (1–12), `showImage` Toggle, `featuredFirst` Toggle

**Data Sources:** SharePoint SitePages list

**Service/Repo:** `NewsByAreaService`, `NewsByAreaRepository`

**Calidad:**
- ✅ ErrorBoundary: Sí
- ✅ OnThemeChanged: Dark mode + CSS vars + Teams/Office/Outlook/env
- ✅ onDispose: Yes

---

### WP-014 | `pulso-del-dia` | DailyPulseWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | ~160 |
| **Categoría** | CAT-C — Comunicación Interna |
| **Estado** | Reutilizable |
| **Reutilización** | Media |

**Props (10):**
- `title`, `subtitle`, `sourceType` (SharePointList/JsonUrl/ApiEndpoint/StaticConfig), `webUrl`, `listTitleOrUrl`, `jsonUrl`, `apiEndpointUrl`, `promptJson` (multiline, 8 rows — AI prompt serialization), `oneResponsePerDay` Toggle, `submitLabel` TextField

**Data Sources:** SharePointList, JsonUrl, ApiEndpoint, StaticConfig

**Unique:** AI prompt serialization (`serializePrompt` + `promptJson` property). 4 tipos de data source.

**Calidad:**
- ✅ OnThemeChanged: Dark mode + Teams env detection
- ❌ Sin ErrorBoundary
- ⚠️ Propiedad `promptJson` contiene serialización de prompts de IA — atención a seguridad (no contiene secrets visibles)

---

### WP-015 | `buzon-de-ideas` | IdeasMailboxWebPart

| Campo | Valor |
|-------|-------|
| **Líneas WebPart.ts** | ~130 |
| **Categoría** | CAT-C — Comunicación Interna |
| **Estado** | Reutilizable |
| **Reutilización** | Media |

**Props (8):**
- `title`, `subtitle`, `sourceType` (SharePointList/ApiEndpoint/JsonBridge), `listTitleOrUrl`, `endpointUrl`, `allowAnonymous` Toggle, `showCategory` Toggle, `submitLabel` TextField, `categoryLabel` TextField

**Data Sources:** SharePointList, ApiEndpoint, JsonBridge (fuente custom)

**Unique:** `JsonBridge` custom source (no estándar del catálogo). Flag `allowAnonymous`.

**Calidad:**
- ❌ Sin ErrorBoundary
- ❌ Sin theme detection
- ❌ Sin Teams context
- ❌ Sin onDispose

---

### WP-016 | `mis-aprobaciones` | MyApprovalsWebPart

**Props (5):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `approvalsListTitleOrUrl`, `statusesCsv`, `showExpired` Toggle, `maxItems` Slider (1–50)
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `ApprovalsService`, `ApprovalsRepository`
**Calidad:** ✅ ErrorBoundary + ✅ Dark mode + ✅ Teams env + ✅ onDispose
**Estado:** Maduro | Reutilización: Media

---

### WP-017 | `mis-tareas-y-pendientes` | MyTasksAndPendingWebPart

**Props (5):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `showCompleted` Toggle, `maxItems` Slider (1–100), `defaultSort` ChoiceGroup (dueDate/priority/source), `autoRefreshSeconds`
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `TasksService`, `TasksRepository`
**Calidad:** ✅ Dark mode + ✅ CSS vars + ❌ Sin ErrorBoundary (render directo)
**Estado:** Maduro | Reutilización: Alta

---

### WP-018 | `mis-accesos-recientes` | MyRecentAccessesWebPart

**Props (5):** `description`, `dataSourceMode` (SharePointList/JsonUrl/GraphRecent), `recentItemsJsonUrl`, `maxItems` Slider (1–12), `resourceTypeFilter`
**Data Sources:** SharePointList, JsonUrl, Graph Recent Items API (único del repositorio con Graph)
**Unique:** Único web part con integración Graph API para items recientes
**Calidad:** ✅ Dark mode + ✅ Teams env detection + ✅ ErrorBoundary
**Estado:** Maduro | Reutilización: Alta

---

### WP-019 | `kpi-mini-cards` | KpiMiniCardsWebPart

**Props (10):** `title`, `subtitle`, `layoutMode` (standard/compact), `sourceType` (StaticConfig/JsonUrl/SharePointList/ApiEndpoint), `kpiCardsJson` (multiline, 10 rows), `jsonUrl`, `listTitleOrUrl`, `showTrend` Toggle, `maxItems` Slider (1–20), `openInNewTab` Toggle
**Data Sources:** StaticConfig, JsonUrl, SharePointList, ApiEndpoint (todos los tipos)
**Unique:** 4 tipos de data source en un solo web part + modos de layout
**Calidad:** ✅ ErrorBoundary
**Estado:** Maduro | Reutilización: Media

---

### WP-020 | `estado-de-proyectos` | ProjectStatusWebPart

**Props (7):** `title`, `subtitle`, `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `jsonUrl`, `maxItems` Slider (1–25), `defaultStatusFilter` Dropdown, `showOwner` Toggle
**Config:** `projectStatusWebPartConfig.ts`
**Calidad:** ✅ ErrorBoundary + ⚠️ Theme minimal (initializeIcons from fluentui, no dark mode full)
**Estado:** Maduro | Reutilización: Media

---

### WP-021 | `estado-de-servicios-internos` | InternalServicesStatusWebPart

**Props (5):** `description`, `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `autoRefreshSeconds` (string), `staleThresholdMinutes` (string), `showOnlyCritical` Toggle
**Unique:** Stale data threshold + critical-only filter
**Calidad:** ✅ Dark mode detection + ❌ Sin Teams + ❌ Sin ErrorBoundary
**Estado:** Reutilizable | Reutilización: Alta

---

### WP-022 | `estado-de-incidencias-destacadas` | HighlightedIncidentsWebPart

**Props (5):** `title`, `subtitle`, `dataSourceType` (SharePointList/JsonUrl), `listTitleOrUrl`, `showResolved` Toggle, `maxItems` Slider (1–20)
**Data Sources:** SharePointList, JsonUrl (solo 2 tipos)
**Calidad:** ✅ Dark mode + ❌ Sin Teams + ❌ Sin ErrorBoundary
**Estado:** Reutilizable | Reutilización: Alta

---

### WP-023 | `proximos-hitos` | UpcomingMilestonesWebPart

**Props (5):** `title`, `description`, `listTitleOrUrl`, `maxItems` Slider (1–20), `viewMode` (timeline/list)
**Data Sources:** SharePoint List
**Service/Repo:** `UpcomingMilestonesService`, `UpcomingMilestonesRepository`
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary
**Estado:** Maduro | Reutilización: Media

---

### WP-024 | `lanzador-universal-de-accesos` | UniversalAppLauncherWebPart

**Líneas WebPart.ts:** 222 | **Estado:** Maduro | **Reutilización:** Media

**Props (8):** `title`, `subtitle` (multiline), `audienceMode` (department/country/role/group/hybrid), `currentAudienceTokens`, `defaultCategory`, `maxItems` Slider (1–24), `openInNewTab`, `launchItemsJson` (multiline, 12 rows)
**Data Sources:** JsonUrl (static config en property pane)
**Imports:** `@paquete/spfx-common` (`hiberusThemeTokens`)
**Unique:** 10 CSS custom properties from spfx-common + audience targeting
**Calidad:** ✅ ErrorBoundary + ✅ Dark mode + ✅ CSS vars + ✅ Teams env

---

### WP-025 | `accesos-rapidos-por-audiencia` | AudienceQuickLinksWebPart

**Líneas WebPart.ts:** 204 | **Estado:** Reutilizable | **Reutilización:** Alta

**Props (8):** `title`, `description` (multiline, 2 rows), `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `audienceMode` (group/department/country/role/hybrid), `defaultCategory`, `maxItems` Slider (1–24), `showAudienceHint` Toggle
**Unique:** Mayor sistema de temas del repositorio + 10 CSS vars desde spfx-common tokens + audience targeting
**Calidad:** ✅ Dark mode + ✅ 10 CSS custom properties + ❌ Sin ErrorBoundary

---

### WP-026 | `directorio-express` | ExpressDirectoryWebPart

**Líneas WebPart.ts:** 163 | **Estado:** Maduro | **Reutilización:** Alta

**Props (6):** `description`, `dataSourceTypesCsv`, `listTitleOrUrl`, `jsonUrl`, `staticPeopleJson` (multiline), `maxItems` Slider (1–100), `defaultAreaFilter`
**Data Sources:** Directory (AAD), SharePointList, JsonUrl, StaticConfig
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-027 | `buscador-de-recursos-corporativos` | CorporateResourcesSearchWebPart

**Líneas WebPart.ts:** 127 | **Estado:** Maduro | **Reutilización:** Alta

**Props (5):** `title`, `subtitle`, `dataSourceTypesCsv`, `listTitleOrUrl`, `searchScopeUrl`, `showFeaturedWhenEmpty` Checkbox, `maxItems` Slider (1–50)
**Data Sources:** SearchAPI, SharePointList
**Unique:** SearchAPI como tipo de data source
**Calidad:** ✅ Dark mode detection + ❌ Sin Teams explicit + ✅ ErrorBoundary

---

### WP-028 | `a-z-corporativo` | CorporateAzWebPart

**Líneas WebPart.ts:** 33 | **Estado:** Experimental | **Reutilización:** Media

**Props (4):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `maxItems` (TextField, non Slider), `autoRefreshSeconds` (optional)
**Service/Repo:** `CorporateAzRepository` (fetch-based) → `CorporateAzService`
**Unique:** WebPart más compacto (33 líneas) — estructura mínima viable
**Calidad:** ⚠️ Dark mode minimal + ❌ Sin Teams + ❌ Sin ErrorBoundary

---

### WP-029 | `mapa-de-portales` | PortalMapWebPart

**Líneas WebPart.ts:** ~110 | **Estado:** Reutilizable | **Reutilización:** Baja

**Props (4):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `viewMode` (tree/grouped/cards), `maxDepth` Slider (1–10)
**Unique:** Patrón de visualización de mapa (tree/grouped/cards) — componente específico de portal
**Calidad:** ✅ Dark mode + ✅ hasTeamsContext + ❌ Sin ErrorBoundary

---

### WP-030 | `checklist-de-onboarding` | OnboardingChecklistWebPart

**Líneas WebPart.ts:** 162 | **Estado:** Maduro | **Reutilización:** Alta

**Props (7):** `title`, `description` (multiline, 3 rows), `dataSourceType` (StaticConfig/SharePointList/JsonUrl), `webUrl`, `listTitleOrUrl`, `jsonUrl`, `staticConfigJson` (multiline, 6 rows), `defaultVariant`, `defaultPhase`
**Unique:** Checklist por fases con variantes — patrón checklist reutilizable
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-031 | `checklist-de-offboarding-o-cambios` | OffboardingOrChangeChecklistWebPart

**Líneas WebPart.ts:** ~140 | **Estado:** Maduro | **Reutilización:** Alta

**Props (7):** `title`, `description`, `dataSourceType`, `webUrl`, `listTitleOrUrl`, `jsonUrl`, `staticConfigJson`, `defaultScenario` (Dropdown: generic/offboarding/transfer/roleChange), `defaultPhase`
**Unique:** Dropdown de escenarios de offboarding (offboarding/transfer/roleChange/generic)
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-032 | `inicia-una-solicitud` | StartARequestWebPart

**Líneas WebPart.ts:** ~120 | **Estado:** Maduro | **Reutilización:** Media

**Props (4):** `dataSourceType` (ChoiceGroup), `listTitleOrUrl`, `defaultCategory`, `showPrerequisites` Toggle
**Service/Repo:** `RequestsCatalogService`, `RequestsCatalogRepository`
**Pattern:** SPFx Provider pattern (`StartARequestProvider`)
**Calidad:** ✅ CSS vars + ✅ ErrorBoundary

---

### WP-033 | `ruta-guiada` | GuidedRouteWebPart

**Líneas WebPart.ts:** ~100 | **Estado:** Experimental | **Reutilización:** Media

**Props (4):** `dataSourceType`, `listTitleOrUrl`, `maxSteps` Slider (1–10), `routeTitle` (TextField — en el modelo pero NO en el property pane)
**Service/Repo:** `GuidedRouteService`, `GuidedRouteRepository`
**Calidad:** ⚠️ CSS vars solo (partial) + ❌ Sin ErrorBoundary
**Issue:** Propiedad `routeTitle` declarada en modelo pero no expuesta en property pane

---

### WP-034 | `analizador-de-tamano-y-volumen-de-documentos-historicos` | HistoricalStorageAnalyzerWebPart

**Líneas WebPart.ts:** 158 | **Estado:** Experimental | **Reutilización:** Baja

**Props (4):** `description`, `defaultLibraryTitleOrUrl`, `defaultScanMode` (quickScan/deepScan), `maxVersionConcurrency` (string), `includeHiddenLibraries` Toggle
**Data Sources:** SharePoint document libraries
**Calidad:** ✅ Dark mode + ✅ Teams env + ❌ Sin ErrorBoundary
**Nota:** SPHttpClient directo al componente sin service layer

---

### WP-035 | `visualizador-de-elementos-de-biblioteca-y-papelera-superior` (2 Web Parts)

**35.1 | SiteStorageDiagnosticsWebPart** — ~140 líneas | Experimental | Reutilización: Baja

**Props (5):** `reportListUrl`, `batchSize` Slider (1–50), `maxRequestsPerSecond` Slider (1–10), `scope` (all/manual), `manualSiteUrls` (multiline)
**Unique:** HTTP adapter pattern + batch/concurrency rate limiting
**Calidad:** ❌ Sin theme + ❌ Sin Teams + ❌ Sin ErrorBoundary

**35.2 | RecycleBinSpaceCalculatorWebPart** — Experimental | Reutilización: Baja

**Props (4):** `description`, `showStageBreakdown` Toggle, `refreshIntervalSeconds` Slider (0–1800), `warningThresholdItems` Slider (0–10000), `warningThresholdSizeMb` Slider (0–20480)
**Unique:** Stage breakdown + warning thresholds configurables
**Calidad:** ❌ Sin ErrorBoundary

---

### WP-036 | `que-ha-cambiado` | WhatChangedFeedWebPart

**Líneas WebPart.ts:** 169 | **Estado:** Maduro | **Reutilización:** Alta

**Props (6):** `title`, `description` (multiline), `sourceKind` (list/library), `listTitleOrUrl`, `defaultTypeFilter`, `maxItems` Slider (1–20)
**Data Sources:** SharePoint List
**Service/Repo:** `WhatChangedFeedService`, `WhatChangedFeedRepository`
**Calidad:** ✅ Dark mode + ✅ CSS vars + ✅ Teams env + ✅ ErrorBoundary + ✅ onDispose

---

### WP-037 | `faq-inteligente` | SmartFaqWebPart

**Líneas WebPart.ts:** 169 | **Estado:** Maduro | **Reutilización:** Alta

**Props (6):** `title`, `description`, `listTitleOrUrl`, `defaultCategory`, `enableSearch` Toggle, `maxItems` Slider (1–200)
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `SmartFaqRepository`, `SmartFaqService`
**Unique:** Rango máximo amplio (200 items) + search toggle — patrón FAQ reutilizable
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-038 | `como-hago-esto` | HowDoIDoThisWebPart

**Líneas WebPart.ts:** ~140 | **Estado:** Maduro | **Reutilización:** Media

**Props (5):** `title`, `description`, `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `defaultCategory`, `maxItems` (TextField — no Slider)
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `GuidesRepository` (fetch-based), `GuidesCatalogService`, `GuidesFilterService` — 3 servicios (más que cualquier otro)
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-039 | `glosario-corporativo` | CorporateGlossaryWebPart

**Líneas WebPart.ts:** ~140 | **Estado:** Maduro | **Reutilización:** Alta

**Props (5):** `title`, `description` (multiline), `listTitle`, `defaultCategory`, `maxItems` Slider (1–1000 — mayor rango del repositorio), `enableAlphabetNav` Toggle
**Data Sources:** SharePointList
**Service/Repo:** `CorporateGlossaryService`, `CorporateGlossaryRepository`
**Unique:** Alphabet navigation toggle + rango máximo de 1000 items
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-040 | `pregunta-destacada` | FeaturedQuestionWebPart

**Líneas WebPart.ts:** 30 | **Estado:** Experimental | **Reutilización:** Baja

**Props (4):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `showVotes` Toggle, `allowMultipleVotes` Toggle
**Service/Repo:** `FeaturedQuestionRepository` (fetch-based), `FeaturedQuestionService`
**Unique:** Web part ultra compacto (segundo más pequeño)
**Calidad:** ⚠️ Theme partial (--bodyText only) + ❌ Sin ErrorBoundary

---

### WP-041 | `agenda-del-equipo` | TeamAgendaWebPart

**Líneas WebPart.ts:** 158 | **Estado:** Maduro | **Reutilización:** Media

**Props (5):** `title`, `description`, `dataSourceType` (Calendar/SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `maxItems` Slider (1–12), `showPast` Toggle, `defaultTypeFilter`
**Data Sources:** Outlook Calendar, SharePointList, JsonUrl, StaticConfig (4 tipos)
**Service/Repo:** `TeamAgendaService` (singleton)
**Unique:** Outlook Calendar como data source
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-042 | `cuenta-atras-a-eventos` | EventCountdownWebPart

**Líneas WebPart.ts:** ~160 | **Estado:** Reutilizable | **Reutilización:** Media

**Props (14):** `sourceType` (StaticConfig/SharePointList/JsonUrl), `eventTitle`, `targetDate`, `subtitle`, `detailUrl`, `showCompleted` Toggle, `jsonUrl`, `listTitleOrUrl`, `titleField`, `targetDateField`, `subtitleField`, `detailUrlField`, `refreshIntervalSeconds`
**Unique:** Web part con más propiedades (13–14 props) + SharePoint field mapping configurable
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-043 | `turnos-guardias-o-disponibilidad` | ShiftsGuardsAvailabilityWebPart

**Líneas WebPart.ts:** ~110 | **Estado:** Experimental | **Reutilización:** Baja

**Props (3):** `dataSourceType` (Dropdown), `listTitleOrUrl`, `maxItems` Slider (1–20, default 10)
**Service/Repo:** `ShiftsGuardsService`, `ShiftsGuardsRepository`
**Calidad:** ✅ CSS vars + ❌ Sin ErrorBoundary + ❌ Sin Teams detection

---

### WP-044 | `presencia-de-sedes` | SitesPresenceWebPart

**Líneas WebPart.ts:** ~100 | **Estado:** Experimental | **Reutilización:** Baja

**Props (3):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `maxItems` Slider (1–20)
**Service/Repo:** `SitesPresenceRepository` (dual fetch + spHttpClient), `SitesPresenceService`
**Calidad:** ⚠️ Theme partial (--bodyText only) + ❌ Sin ErrorBoundary

---

### WP-045 | `microencuesta` | MicroSurveyWebPart

**Líneas WebPart.ts:** 175 | **Estado:** Maduro | **Reutilización:** Media

**Props (8):** `description` (multiline), `dataSourceType` (SharePointList/ApiEndpoint/StaticConfig), `listTitleOrUrl`, `responsesListTitleOrUrl`, `apiEndpointUrl`, `questionText` (multiline), `optionsCsv` (multiline), `oneResponsePerUser` Toggle
**Data Sources:** SharePointList, ApiEndpoint, StaticConfig
**Service/Repo:** `PollRepository` (547 líneas — mayor componente del repositorio), `MicroSurveyService`
**Unique:** PollRepository con 547 líneas (voting, response tracking, localStorage)
**Calidad:** ✅ Dark mode + ✅ CSS vars + ✅ ErrorBoundary

---

### WP-046 | `objetivos-del-area` | AreaGoalsWebPart

**Líneas WebPart.ts:** ~120 | **Estado:** Experimental | **Reutilización:** Baja

**Props (4):** `dataSourceType`, `listTitleOrUrl`, `maxItems` Slider (1–20, default 10), `autoRefreshSeconds` (TextField — en componente pero NO en property pane!)
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `AreaGoalsService`, `AreaGoalsRepository`
**Calidad:** ✅ CSS vars + ✅ Dark mode + ✅ ErrorBoundary
**Issue:** `autoRefreshSeconds` en componente pero no expuesto en property pane

---

### WP-047 | `resumen-semanal-automatico` | AutomaticWeeklySummaryWebPart

**Líneas WebPart.ts:** ~120 | **Estado:** Maduro | **Reutilización:** Baja

**Props (5):** `title`, `subtitle` (multiline), `periodMode` (currentWeek/previousWeek/customRange), `maxItems` Slider (1–12, default 6), `customRangeStart` TextField, `customRangeEnd` TextField
**Data Sources:** StaticConfig ONLY (único web part con restricción a una sola fuente)
**Service/Repo:** `WeeklySummaryService`, `StaticSummarySourceRepository`
**Unique:** Único con data source restriction a StaticConfig + date range custom
**Calidad:** ✅ CSS vars + ✅ Dark mode + ✅ ErrorBoundary

---

### WP-048 | `mantenimientos-programados` | PlannedMaintenanceWebPart

**Líneas WebPart.ts:** ~110 | **Estado:** Incompleto | **Reutilización:** Baja

**Props (5):** `title`, `description` (multiline), `dataSourceType` (SharePointList/JsonUrl — solo 2 tipos!), `listTitleOrUrl`, `jsonUrl`, `hideCompleted` Toggle, `maxItems` Slider (1–25)
**Data Sources:** SharePointList, JsonUrl (sin StaticConfig!)
**Service/Repo:** Patrón `hostContext` con `siteUrl` (sin service layer formal)
**Unique:** Solo 2 tipos de data source (menos que cualquier otro)
**Calidad:** ❌ Sin theme + ❌ Sin Teams + ❌ Sin ErrorBoundary + ❌ Sin onDispose
**Nota:** Boilerplate más débil del repositorio — requiere revisión completa

---

### WP-049 | `reserva-rapida` | QuickBookingWebPart

**Líneas WebPart.ts:** ~120 | **Estado:** Maduro | **Reutilización:** Baja

**Props (5):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `showAvailability` Toggle, `defaultCategory`, `resourcesJson`, `openInNewTab` Toggle
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Unique:** State machine (loading/ready/empty/partialData/error)
**Calidad:** ✅ Dark mode + ✅ Teams env + ✅ ErrorBoundary

---

### WP-050 | `asistente-contextual-de-pagina` | PageContextAssistantWebPart

**Líneas WebPart.ts:** 149 | **Estado:** Reutilizable | **Reutilización:** Alta

**Props (7):** `title`, `description`, `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `fallbackMode` (generic/empty), `collapsedByDefault` Toggle, `contextKeyOverride`
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `PageContextAssistantService`, `pageContextAssistantRepository`, `resolveCurrentContextKey`
**Calidad:** ✅ ErrorBoundary + ✅ CSS vars (partial) + ✅ onDispose
**Nota:** Sin Teams detection explicit

---

### WP-051 | `centro-de-acciones-rapidas` | QuickActionsCenterWebPart

**Líneas WebPart.ts:** 175 | **Estado:** Reutilizable | **Reutilización:** Alta

**Props (8):** `title`, `subtitle` (multiline), `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`, `jsonUrl`, `staticActionsJson` (multiline, 6 rows), `defaultCategory`, `maxItems` TextField
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `QuickActionsService`, `QuickActionsRepository`
**Unique:** 175 líneas — patrón completo con Teams/Office/Outlook detection detallada en `_getEnvironmentMessage()`
**Calidad:** ✅ ErrorBoundary + ✅ Dark mode + ✅ Teams env + ✅ onDispose

---

### WP-052 | `tarjeta-de-decision-rapida` | QuickDecisionCardWebPart

**Líneas WebPart.ts:** 27 | **Estado:** Incompleto | **Reutilización:** Baja

**Props (2):** `dataSourceType` (SharePointList/JsonUrl/StaticConfig), `listTitleOrUrl`
**Data Sources:** SharePointList, JsonUrl, StaticConfig
**Service/Repo:** `QuickDecisionRepository`, `QuickDecisionService`
**Unique:** Web part más compacto del repositorio (27 líneas)
**Calidad:** ⚠️ Theme partial (solo `--bodyText`) + ❌ Sin ErrorBoundary + ❌ Sin Teams + ❌ Sin explicit onInit para defaults
**Nota:** Componente mínimo viable — necesita expansión de propiedades y protección

---

### WP-053 a WP-079 | `sharepoint-governance-webparts/*` | Governance WebParts

**Estado común:** Mock-backed auditado / integración backend pendiente
**Reutilización común:** Media (plantilla técnica común; dominio funcional específico por iniciativa)
**Arquitectura:** un proyecto SPFx independiente por iniciativa bajo `projects/sharepoint-governance-webparts/<project>/`
**Coordinación global:** `projects/sharepoint-governance-webparts/_governance/`

**Props comunes (4):**
- `title` — TextField
- `subtitle` — TextField
- `maxItems` — Slider (1–10)
- `showDetails` — Toggle

**Capas comunes por proyecto:**
- `components/<WebPartName>Dashboard.tsx`
- `components/GovernanceStatePanel.tsx`
- `components/WebPartErrorBoundary.tsx`
- `hooks/useGovernanceDashboard.ts`
- `models/governanceModels.ts`
- `mocks/governanceMockData.ts`
- `repositories/governanceDashboardRepository.ts`
- `services/governanceDashboardService.ts`
- `services/governanceDashboardService.test.ts`

**Data Sources actuales:** `MockGovernanceDashboardRepository` con datos representativos explícitamente marcados en UI.
**Data Sources previstos:** backend de gobierno seguro que encapsule Microsoft Graph, CSOM/SharePoint Admin, Purview y SharePoint Advanced Management según disponibilidad y licencia.
**Service/Repo:** `GovernanceDashboardService`, `MockGovernanceDashboardRepository`.
**Documentación por proyecto:** README, spec funcional, diseño funcional, diseño técnico y red-team individual.
**Documentación global:** ADRs, project index, shared models, shared service contracts, shared UI guidelines, roadmap, backlog backend/frontend, auditoría global y summary final en `_governance/docs/`.

**Calidad común:**
- ✅ ErrorBoundary obligatorio
- ✅ onDispose con `ReactDom.unmountComponentAtNode`
- ✅ Localización `es-es.js`, `en-us.js`, `mystrings.d.ts`
- ✅ Service/Repository/Hook separados
- ✅ Tests unitarios de servicio
- ✅ Build Heft + Jest + package-solution validado
- ✅ Modo mock visible mediante `MessageBar`
- ✅ Sin operaciones destructivas reales
- ✅ Sin llamadas directas a Graph, CSOM, Purview o SAM desde componentes React
- ⚠️ Sin `onThemeChanged` específico todavía; UI usa Fluent UI y superficies compatibles, pero no aplica adaptación avanzada de tema
- ⚠️ Sin Teams context detection específica; manifiestos soportan Teams, pero no hay comportamiento condicional por host

| WP | Proyecto | WebPart Class | Iniciativa | Objetivo funcional | Backend requerido |
|---|---|---|---|---|---|
| 053 | `site-creation-governance` | `SiteCreationGovernanceWebPart` | GOV-01 | Definir quién puede crear sitios de SharePoint y detectar desviaciones del proceso | SharePoint Admin/CSOM, Graph Sites, configuración tenant |
| 054 | `duplicate-sites-control` | `DuplicateSitesControlWebPart` | GOV-02 | Detectar creación desordenada y candidatos duplicados | Inventario maestro, motor de similitud, Graph/CSOM |
| 055 | `orphan-sites-review` | `OrphanSitesReviewWebPart` | GOV-03 | Revisar sitios sin propietario o con propietarios inactivos | Inventario owners, Entra/Graph users, señales de actividad |
| 056 | `site-lifecycle-governance` | `SiteLifecycleGovernanceWebPart` | GOV-04 | Gobernar estados active/inactive/archived/removable | Inventario, reglas lifecycle, SAM si disponible |
| 057 | `inactive-sites-validation` | `InactiveSitesValidationWebPart` | GOV-05 | Detectar sitios inactivos y pedir validación a owners | Graph usage reports, campañas owner, inventario owners |
| 058 | `site-archive-retention-governance` | `SiteArchiveRetentionGovernanceWebPart` | GOV-06 | Decidir cuándo archivar, conservar o eliminar sitios antiguos | Backend dry-run, retención/Purview, aprobaciones |
| 059 | `inherited-access-review` | `InheritedAccessReviewWebPart` | GOV-07 | Revisar accesos heredados y directos periódicamente | Graph permissions, CSOM permissions, Site Access Reviews |
| 060 | `external-sharing-review` | `ExternalSharingReviewWebPart` | GOV-08 | Revisar documentos compartidos externamente | Sharing reports, Graph drive permissions, DAG/SAM |
| 061 | `sensitivity-labels-governance` | `SensitivityLabelsGovernanceWebPart` | GOV-09 | Recomendar/apoyar etiquetas de sensibilidad | Purview labels, Graph groups/sites, backend de recomendación |
| 062 | `retention-compliance-governance` | `RetentionComplianceGovernanceWebPart` | GOV-10 | Identificar documentos con obligación legal o normativa | Purview retention, records management, compliance input |
| 063 | `audit-activity-review` | `AuditActivityReviewWebPart` | GOV-11 | Revisar accesos, descargas, borrados, compartición y permisos | Purview Audit, export API, normalización de eventos |
| 064 | `storage-governance` | `StorageGovernanceWebPart` | GOV-12 | Monitorizar almacenamiento de sitios y bibliotecas | Graph reports, SharePoint Admin storage, snapshots |
| 065 | `storage-quota-governance` | `StorageQuotaGovernanceWebPart` | GOV-13 | Definir cuotas y controles de crecimiento | SharePoint Admin storage quota, reglas de alerta |
| 066 | `version-control-governance` | `VersionControlGovernanceWebPart` | GOV-14 | Controlar versiones para evitar crecimiento excesivo | SharePoint library version settings, dry-run de ahorro |
| 067 | `onedrive-sync-limits` | `OnedriveSyncLimitsWebPart` | GOV-15 | Visibilizar límites de sincronización OneDrive | Intune/GPO/sync health reports, políticas OneDrive |
| 068 | `intranet-publishing-governance` | `IntranetPublishingGovernanceWebPart` | GOV-16 | Gobernar políticas de publicación de páginas | SitePages, page approval, owners editoriales |
| 069 | `content-owners-governance` | `ContentOwnersGovernanceWebPart` | GOV-17 | Mantener responsables de contenido por área/departamento | RACI, directorio, metadatos de áreas |
| 070 | `obsolete-content-review` | `ObsoleteContentReviewWebPart` | GOV-18 | Revisar contenido obsoleto en páginas, noticias y documentos | SitePages, activity signals, content inventory |
| 071 | `approval-flows-governance` | `ApprovalFlowsGovernanceWebPart` | GOV-19 | Definir y revisar flujos de aprobación | Power Automate/SharePoint approvals, SitePages |
| 072 | `user-good-practices` | `UserGoodPracticesWebPart` | GOV-20 | Publicar buenas prácticas internas para usuarios | CMS interno o lista de contenido gobernado |
| 073 | `site-owner-training` | `SiteOwnerTrainingWebPart` | GOV-21 | Formar owners y usuarios clave | LMS/SharePoint learning list, progreso de formación |
| 074 | `support-model-governance` | `SupportModelGovernanceWebPart` | GOV-22 | Definir modelo de soporte y escalado | ITSM/SharePoint list, RACI, catálogo de solicitudes |
| 075 | `security-compliance-review` | `SecurityComplianceReviewWebPart` | GOV-23 | Planificar revisiones periódicas de seguridad y cumplimiento | Calendario de campañas, findings, owner responses |
| 076 | `copilot-readiness` | `CopilotReadinessWebPart` | GOV-24 | Preparar SharePoint para Copilot evitando sobreexposición | SAM/DAG, Graph permissions, sensitivity/exposure signals |
| 077 | `sensitive-content-review` | `SensitiveContentReviewWebPart` | GOV-25 | Revisar contenido sensible antes de escenarios Copilot | Purview DLP/sensitivity, classification evidence |
| 078 | `adoption-risk-metrics` | `AdoptionRiskMetricsWebPart` | GOV-26 | Medir uso, adopción, sitios activos, documentos compartidos y riesgos | Graph reports, inventory snapshots, risk aggregation |
| 079 | `tenant-site-inventory` | `TenantSiteInventoryWebPart` | GOV-27 | Mantener inventario maestro de sitios, owners, propósito, criticidad y estado | Graph sites, SharePoint Admin/CSOM, Teams/group mapping |

**Riesgo principal común:** todos los webparts de gobernanza son funcionales como frontend mock-backed, pero no deben presentarse como evidencia real del tenant hasta conectar backend seguro con permisos mínimos, trazabilidad, control de throttling, confianza por fuente y auditoría.

---

## 5. Matriz de Reutilización de Componentes

### Por nivel de reutilización

| Nivel | Web Parts | Descripción típica |
|-------|-----------|-------------------|
| **Alta** | WP-002, 003, 004, 005, 006, 010, 017, 018, 021, 022, 025, 026, 027, 030, 031, 036, 037, 039, 041, 050, 051, 052* | Componentes genéricos, patrones reutilizables, baja dependencia de contexto |
| **Media** | 001, 007, 008, 012, 013, 014, 015, 016, 019, 020, 023, 024, 028, 032, 033, 038, 041, 042, 045, 047, 049, 052*, WP-053–079 | Componentes con lógica específica pero reusable en contextos similares; los webparts de gobernanza comparten plantilla técnica y contratos |
| **Baja** | 009, 029, 034, 035.1, 035.2, 040, 043, 044, 046, 048 | Componentes altamente acoplados, diagnósticos específicos, o mínimos |

*WP-052 está marcado como Baja pero tiene alta reutilización potencial una vez expandido.

### Componentes compartidos más relevantes

| Componente | Usado por | Propósito |
|------------|-----------|-----------|
| `WebPartErrorBoundary` | 67/80 web parts | Contención de errores React |
| `@paquete/spfx-common` (hiberusThemeTokens) | WP-024, WP-025 | Tokens de tema CSS compartidos |
| `normalizeDataSourceTypes` | WP-008, WP-004 | Normalización de data source CSV |
| `PollRepository` (547 líneas) | WP-045 | Lógica de votación y tracking |
| `GovernanceDashboardService` + `MockGovernanceDashboardRepository` | WP-053–079 | Patrón común para dashboards de gobernanza mock-backed |
| `_governance/docs/shared-models` | WP-053–079 | Contratos conceptuales compartidos sin introducir paquete productivo adicional |

---

## 6. Matriz de Similitud y Duplicidades

### Agrupaciones por patrón de data source

| Patrón | Web Parts | Descripción |
|--------|-----------|-------------|
| 3 fuentes (SharePointList/JsonUrl/StaticConfig) | WP-002, 006, 011, 017, 020, 025, 028, 030–031, 037–038, 043–045, 046, 048–049, 050–052 | Patrón más común — 3 data sources estándar |
| 2 fuentes | WP-022, 048 | Menor flexibilidad |
| 4 fuentes | WP-014, 024, 037, 041 | Máxima flexibilidad |
| Source única | WP-047 | Restringido a StaticConfig |
| Mock governance + backend contract | WP-053–079 | Mock visible y contrato backend documentado para Graph/CSOM/Purview/SAM |

### Agrupaciones por patrón de props

| Patrón base | Web Parts | Diferenciadores |
|-------------|-----------|-----------------|
| `dataSourceType + listTitleOrUrl + maxItems` | WP-002, 006, 007, 011, 017–018, 020–022, 030, 033–034, 043–046, 048–049, 051 | Props base + extras específicos |
| `title + description + source + filters` | WP-001, 004, 008, 012–014, 024, 027–028, 030, 037–039, 041–042, 047 | Web parts con metadata completa |
| `dataSourceType solo` | WP-009, 010, 015, 023, 029, 035, 052 | Configuración mínima |
| `title + subtitle + maxItems + showDetails` | WP-053–079 | Plantilla común de dashboard de gobernanza con límites y detalle configurable |

### Duplicidades detectadas

| Duplicidad | Web Parts | Impacto | Acción recomendada |
|-----------|-----------|---------|-------------------|
| Misma estructura de props (SharePointList/JsonUrl/StaticConfig) | WP-002/006/017/020/030/031/037/038/043–046/048–049/051 | Refactoring de componente base | Extraer `BaseDataSourceWebPart` en spfx-common |
| Misma lógica de ErrorBoundary | 40 web parts | Repetición de código | Mover `WebPartErrorBoundary` a spfx-common con factory |
| Misma detección de Teams + Dark Mode | ~26 web parts | Código duplicado | Mover a `ThemeTeamsHOC` o hook compartido |
| WP-035.1 + WP-035.2 | Misma carpeta | Arquitectura híbrida | Separar en 2 proyectos independientes |
| Plantilla de gobernanza repetida | WP-053–079 | Repetición intencional para independencia de build/deploy | Extraer a paquete común solo si los contratos backend se estabilizan |

### Componentes potencialmente candidatos a extracción en `spfx-common`

1. **`BaseDataSourceWebPart<T>`** — Clase base genérica para 3+ data sources
2. **`WebPartErrorBoundary` factory** — Configuración vía propiedades de localización
3. **`useDarkMode()`** — Hook de detección de tema oscuro
4. **`useTeamsContext()`** — Hook de detección de entorno Teams/Office/Outlook
5. **`DataSourceMapper<T>`** — Adaptador unificado para SharePointList/JsonUrl/StaticConfig/ApiEndpoint
6. **`ThemeCssVarsInjector`** — Inyección de CSS custom properties desde tema
7. **`GovernanceDashboardBase<T>`** — Base futura para WP-053–079 cuando se decida extraer un paquete común

---

## 7. Mapa de Dependencias

### Diagrama de capas

```
┌─────────────────────────────────────────────┐
│              Property Pane (UI)             │
│    SharePoint List · JsonUrl · StaticConfig  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              WebPart.ts                      │
│    (render, getPropertyPaneConfiguration)   │
└──┬──────────────┬──────────────┬────────────┘
   │              │              │
   ▼              ▼              ▼
┌─────────┐ ┌──────────┐ ┌────────────┐
│ Service │ │ Repository│ │  Component │
│ (lógica │ │ (data     │ │ (React     │
│  business│ │  access)  │ │  markup)  │
└─────────┘ └──────────┘ └────────────┘
```

### Proyectos con service/repository vs direct access

| Categoría | Con Service/Repo | Sin Service (direct) |
|-----------|------------------|---------------------|
| CAT-A Gestion Doc. | WP-001 | WP-002, 003 |
| CAT-B RRHH | WP-004, 006, 008 | WP-005, 007, 009 |
| CAT-C Comunicación | WP-012, 013 | WP-010, 011, 014, 015 |
| CAT-D Productividad | WP-017, 018 | WP-016 |
| CAT-E Dashboard | — | WP-019, 020, 021, 022, 023 |
| CAT-F Catalogos | WP-026 | WP-024, 025, 027–029 |
| CAT-G Checklists | WP-032, 033 | WP-030, 031 |
| CAT-H Diagnostics | WP-036 | WP-034, 035 |
| CAT-I Formacion | WP-037, 038, 039 | WP-040 |
| CAT-J Tiempo/Engagement | WP-041, 043, 045 | WP-042, 044 |
| CAT-K Gobierno | WP-046, 047 | WP-048 |
| CAT-L Navegacion | WP-050, 051 | WP-049, 052 |
| CAT-M SPO Governance | WP-053–079 | — |

### Métricas de dependencias

| Métrica | Valor |
|---------|-------|
| Total Service classes | ~55 |
| Total Repository classes | ~57 |
| WebParts sin Service/Repo layer | ~17 (21%) |
| Mayor Repository | `PollRepository` (547 líneas) |
| Mayor WebPart.ts | `QuickActionsCenterWebPart` (175 líneas) / `UniversalAppLauncherWebPart` (222 líneas) |
| WebParts con mock repository explícito | 27 (`WP-053`–`WP-079`) |

---

## 8. Riesgos Globales

### Riesgos por categoría

| # | Riesgo | Severidad | Web Parts Afectados | Descripción |
|---|--------|-----------|--------------------|-------------|
| 1 | Sin ErrorBoundary en webparts legacy pendientes | **Alta** | Legacy pendientes según ranking de madurez | Un error no controlado desmonta todo el subárbol React de SharePoint |
| 2 | SPHttpClient directo al componente o capa incompleta | **Media** | ~17 web parts legacy | Viola la separación de capas (service/repo) definida en AGENTS.md |
| 3 | onDispose ausente en ~29 webparts | **Media** | Legacy principalmente | Fugas de memoria React al desplazar múltiples web parts en la misma página |
| 4 | Tema sin detectar explícitamente en 42 webparts | **Media** | 15 legacy + WP-053–079 | UI no se adapta al tema oscuro de SharePoint con lógica específica |
| 5 | Teams no detectado explícitamente en 54 webparts | **Baja** | Legacy parcial + WP-053–079 | Sin adaptación al contexto Teams (mensajes de entorno, comportamiento específico) |
| 6 | Dependencia de Node.js 22.x restringida | **Baja** | 80/80 | `>=22.14.0 < 23.0.0` — limita la flexibilidad de despliegue |
| 7 | `@paquete/spfx-common` como dependencia `file:` | **Media** | Proyectos legacy que lo consumen | Dependencia local que necesita build previo — riesgo en CI/CD |
| 8 | 2 web parts en misma carpeta | **Baja** | WP-035.1 y 035.2 | Arquitectura híbrida que confunde las expectativas de gestión |
| 9 | Fluent UI v8 sin ruta de migración explícita | **Alta** | 80/80 | Migración futura a v9 requerirá adaptación significativa |
| 10 | 3 propiedades en modelo pero no expuestas | **Baja** | WP-033 (routeTitle), WP-046 (autoRefreshSeconds) | Desconexión entre modelo y property pane — confusión de mantenimiento |
| 11 | Webparts de gobernanza con datos mock | **Alta si se presenta como producción** | WP-053–079 | Riesgo de confundir datos representativos con evidencia real del tenant; mitigado con `MessageBar` y documentación de backend requerido |

---

## 9. Recomendaciones Priorizadas

### Prioridad 1 — Crítico (seguridad y estabilidad)

| # | Acción | Web Parts | Esfuerzo | Beneficio |
|---|--------|-----------|----------|-----------|
| 1.1 | Añadir ErrorBoundary a los legacy ausentes | 002, 005, 009, 010, 011, 029, 035, 040, 048, 052 y restantes legacy | ⭐⭐ | Previene crashes totales de página |
| 1.2 | Extraer WebPartErrorBoundary a spfx-common | 80/80 | ⭐ | Unificado, testable, consistente con AGENTS.md |
| 1.3 | Mantener aviso visible de mock en gobernanza hasta conectar backend | WP-053–079 | ⭐ | Evita decisiones operativas basadas en datos simulados |

### Prioridad 2 — Alto (calidad de código)

| # | Acción | Web Parts | Esfuerzo | Beneficio |
|---|--------|-----------|----------|-----------|
| 2.1 | Implementar onThemeChanged en legacy sin detectar tema | Legacy pendientes según ranking de madurez | ⭐⭐ | Accesibilidad y experiencia de usuario |
| 2.2 | Extraer useDarkMode + useTeamsContext a spfx-common | Todos | ⭐⭐ | Elimina ~80 líneas duplicadas de detección de entorno |
| 2.3 | Migrar SPHttpClient directo a pattern Service/Repository | Legacy con acceso directo o capa incompleta | ⭐⭐⭐ | Consistencia con AGENTS.md, testabilidad |
| 2.4 | Añadir tema y host detection a la plantilla de gobernanza | WP-053–079 | ⭐⭐ | Completa integración visual en SharePoint/Teams |
| 2.5 | Conectar backend read-only por fases | WP-053–079 | ⭐⭐⭐⭐ | Convierte dashboards mock-backed en evidencia real |

### Prioridad 3 — Medio (consolidación)

| # | Acción | Web Parts | Esfuerzo | Beneficio |
|---|--------|-----------|----------|-----------|
| 3.1 | Crear BaseDataSourceWebPart<T> en spfx-common | 15+ web parts con mismo patrón de sources | ⭐⭐⭐ | Reducción de boilerplate ~30% |
| 3.2 | Separar WP-035.1 y 035.2 en 2 proyectos independientes | WP-035 | ⭐ | Claridad de estructura |
| 3.3 | Añadir onDispose a los legacy sin cleanup | Legacy pendientes | ⭐ | Prevención de fugas de memoria |
| 3.4 | Evaluar `shared-governance-core` solo tras estabilizar backend | WP-053–079 | ⭐⭐ | Reduce duplicidad sin romper independencia de build |

### Prioridad 4 — Bajo (refinamiento)

| # | Acción | Web Parts | Esfuerzo | Beneficio |
|---|--------|-----------|----------|-----------|
| 4.1 | Exponer routeTitle en WP-033 property pane | WP-033 | ⭐ | Sincronizar modelo con UI |
| 4.2 | Exponer autoRefreshSeconds en WP-046 property pane | WP-046 | ⭐ | Sincronizar componente con UI |
| 4.3 | Cambiar maxItems de TextField a Slider en WP-028 | WP-028 | ⭐ | Consistencia de UX |
| 4.4 | Expandir WP-052 (27 líneas) con propiedades faltantes | WP-052 | ⭐⭐ | Completar funcionalidad mínima |

---

## 10. Ranking de Madurez

### Método de evaluación

Score basado en cuatro criterios ponderados:
- **ErrorBoundary** (25%): Protege contra crashes de render React
- **Theme Detection** (25%): Dark mode + CSS vars
- **Teams Context** (20%): Detección de Teams/Office/Outlook
- **Service/Repo Layer** (30%): Separación de capas, testabilidad

### Ranking completo (de mayor a menor madurez)

| Rank | WP | WebPart | Error | Theme | Teams | Service/Repo | Score | Estado |
|------|----|---------|-------|-------|-------|-------------|-------|--------|
| 1 | 001 | TemplatesLibrary | ✅ | ✅✅ | ✅✅ | ✅✅ | 100% | Maduro |
| 2 | 012 | NewsSummary | ✅ | ✅✅ | ✅✅ | ✅✅ | 100% | Maduro |
| 3 | 024 | UniversalAppLauncher | ✅ | ✅✅ | ✅✅ | ✅ | 94% | Maduro |
| 4 | 051 | QuickActionsCenter | ✅ | ✅✅ | ✅✅ | ✅✅ | 94% | Reutilizable |
| 5 | 036 | WhatChangedFeed | ✅ | ✅✅ | ✅✅ | ✅✅ | 94% | Maduro |
| 6 | 041 | TeamAgenda | ✅ | ✅✅ | ✅✅ | ✅✅ | 94% | Maduro |
| 7 | 004 | MeetTheTeam | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 8 | 006 | NewJoiners | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 9 | 008 | MiniOrgChart | ✅ | ✅✅ | ✅ | ✅ | 75% | Maduro |
| 10 | 023 | UpcomingMilestones | ✅ | ✅ | ✅ | ✅✅ | 75% | Maduro |
| 11 | 026 | ExpressDirectory | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 12 | 030 | OnboardingChecklist | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 13 | 037 | SmartFaq | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 14 | 038 | HowDoIDoThis | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 15 | 039 | CorporateGlossary | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 16 | 045 | MicroSurvey | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 17 | 047 | AutomaticWeeklySummary | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 18 | 049 | QuickBooking | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 19 | 050 | PageContextAssistant | ✅ | ✅ | ✅ | ✅✅ | 81% | Reutilizable |
| 20 | 007 | Recognitions | ✅ | ✅ | ✅ | ✅ | 69% | Maduro |
| 21 | 016 | MyApprovals | ✅ | ✅ | ✅✅ | ✅✅ | 81% | Maduro |
| 22 | 032 | StartARequest | ✅ | ✅ | ✅ | ✅✅ | 81% | Maduro |
| 23 | 033 | OffboardingChecklist | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 24 | 013 | NewsByArea | ✅ | ✅✅ | ✅✅ | ✅✅ | 100% | Maduro |
| 25 | 020 | ProjectStatus | ✅ | ✅ | ✅ | ✅ | 69% | Maduro |
| 26 | 027 | CorporateSearch | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 27 | 005 | Birthdays | ❌ | ❌ | ❌ | ✅ | 30% | Reutilizable |
| 28 | 017 | MyTasksAndPending | ❌ | ✅ | ✅ | ✅✅ | 56% | Maduro |
| 29 | 018 | MyRecentAccesses | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 30 | 022 | HighlightedIncidents | ✅ | ✅ | ❌ | ✅ | 50% | Reutilizable |
| 31 | 028 | CorporateAz | ❌ | ✅ | ❌ | ✅✅ | 38% | Experimental |
| 32 | 040 | FeaturedQuestion | ❌ | ✅ | ✅ | ✅✅ | 56% | Experimental |
| 33 | 042 | EventCountdown | ✅ | ✅ | ✅ | ✅ | 75% | Reutilizable |
| 34 | 043 | ShiftsGuards | ❌ | ✅ | ❌ | ✅✅ | 44% | Experimental |
| 35 | 046 | AreaGoals | ✅ | ✅ | ✅ | ✅✅ | 81% | Experimental |
| 36 | 002 | MyUsefulDocuments | ❌ | ✅ | ✅ | ✅✅ | 50% | Maduro |
| 37 | 003 | PersonalFavorites | ✅ | ❌ | ❌ | ✅ | 31% | Maduro |
| 38 | 009 | ProfileBased | ❌ | ❌ | ✅ | ✅ | 25% | Experimental |
| 39 | 010 | UrgentAlertBar | ❌ | ❌ | ❌ | ✅ | 13% | Maduro |
| 40 | 011 | InternalCampaign | ❌ | ❌ | ❌ | ✅✅ | 19% | Incompleto |
| 41 | 014 | DailyPulse | ❌ | ✅ | ✅ | ✅ | 38% | Reutilizable |
| 42 | 015 | IdeasMailbox | ❌ | ❌ | ❌ | ✅ | 13% | Reutilizable |
| 43 | 019 | KpiMiniCards | ✅ | ✅ | ✅ | ✅ | 75% | Maduro |
| 44 | 021 | InternalServicesStatus | ❌ | ✅ | ❌ | ✅ | 31% | Reutilizable |
| 45 | 025 | AudienceQuickLinks | ❌ | ✅✅ | ✅ | ✅ | 56% | Reutilizable |
| 46 | 034 | HistoricalStorageAnalyzer | ❌ | ✅ | ✅ | ✅ | 38% | Experimental |
| 47 | 044 | SitesPresence | ❌ | ✅ | ✅ | ✅✅ | 56% | Experimental |
| 48 | 029 | PortalMap | ❌ | ✅ | ✅ | ✅ | 44% | Reutilizable |
| 49 | 035.1 | SiteStorageDiagnostics | ❌ | ❌ | ❌ | ✅ | 13% | Experimental |
| 50 | 035.2 | RecycleBinCalc | ❌ | ❌ | ❌ | — | 6% | Experimental |
| 51 | 048 | PlannedMaintenance | ❌ | ❌ | ❌ | ✅ | 13% | Incompleto |
| 52 | 052 | QuickDecisionCard | ❌ | ✅ | ❌ | ✅✅ | 38% | Incompleto |
| 53 | 053 | SiteCreationGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 54 | 054 | DuplicateSitesControl | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 55 | 055 | OrphanSitesReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 56 | 056 | SiteLifecycleGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 57 | 057 | InactiveSitesValidation | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 58 | 058 | SiteArchiveRetentionGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 59 | 059 | InheritedAccessReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 60 | 060 | ExternalSharingReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 61 | 061 | SensitivityLabelsGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 62 | 062 | RetentionComplianceGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 63 | 063 | AuditActivityReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 64 | 064 | StorageGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 65 | 065 | StorageQuotaGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 66 | 066 | VersionControlGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 67 | 067 | OnedriveSyncLimits | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 68 | 068 | IntranetPublishingGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 69 | 069 | ContentOwnersGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 70 | 070 | ObsoleteContentReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 71 | 071 | ApprovalFlowsGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 72 | 072 | UserGoodPractices | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 73 | 073 | SiteOwnerTraining | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 74 | 074 | SupportModelGovernance | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 75 | 075 | SecurityComplianceReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 76 | 076 | CopilotReadiness | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 77 | 077 | SensitiveContentReview | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 78 | 078 | AdoptionRiskMetrics | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |
| 79 | 079 | TenantSiteInventory | ✅ | ⚠️ | ⚠️ | ✅✅ | 55% | Mock-backed |

> Nota: WP-053–WP-079 puntúan 55% con la fórmula legacy porque aún no implementan `onThemeChanged` ni Teams context detection específica. En el alcance de gobernanza mock-backed sí tienen 100% de documentación, auditoría, tests unitarios, ErrorBoundary, service/repository/hook y build validado.

### Resumen por estado

| Estado | Count | Avg Score |
|--------|-------|-----------|
| Maduro | 28 | 71% |
| Reutilizable | 9 | 53% |
| Experimental | 13 | 36% |
| Incompleto | 3 | 14% |
| Mock-backed auditado / backend pendiente | 27 | 55% legacy / 100% mock-backed |

---

## 11. Glosario de Términos

### Términos de la plataforma

| Término | Definición |
|---------|------------|
| **SPFx** | SharePoint Framework — plataforma de desarrollo para SharePoint Online |
| **Heft** | Herramienta de build y bundling basada en Rush Stack (usada en lugar de Gulp en SPFx 1.20+) |
| **Property Pane** | Panel de configuración de SharePoint donde se exponen las propiedades del web part |
| **WebPartErrorBoundary** | Patrón React (clase) que captura errores de render no controlados y muestra un mensaje amigable |
| **SharePoint List** | Origen de datos nativo de SharePoint — listas y bibliotecas de documentos |
| **SitePages** | SharePoint list especial donde se almacenan las páginas del sitio |
| **AAD** | Azure Active Directory — directorio de usuarios de Microsoft 365 |
| **Graph API** | API RESTful de Microsoft Graph para acceso a recursos de Microsoft 365 |
| **Teams context** | Contexto de Microsoft Teams detectable vía `context.sdks.microsoftTeams` |
| **onDispose** | Ciclo de vida de web part SPFx para cleanup de componentes React |
| **Purview** | Plataforma Microsoft para sensibilidad, retención, DLP, auditoría y cumplimiento |
| **SAM** | SharePoint Advanced Management — capacidades avanzadas de lifecycle, Data Access Governance y access reviews |

### Términos de arquitectura

| Término | Definición |
|---------|------------|
| **Service** | Clase de negocio que orquesta la lógica de aplicación y coordina repositorios |
| **Repository** | Clase de acceso a datos que interactúa directamente con SPHttpClient o fetch |
| **StaticConfig** | Datos embebidos como JSON en el property pane del web part (sin llamadas externas) |
| **JsonUrl** | Datos obtenidos vía fetch desde una URL externa |
| **ApiEndpoint** | Datos obtenidos desde una API REST personalizada (endpoint propio) |
| **DataSourceType** | Enum o string que indica el origen de datos actual del web part |
| **CSS Custom Properties** | Variables CSS personalizadas (--varName) inyectadas desde el tema de SharePoint |
| **spfx-common** | Paquete npm compartido (`@paquete/spfx-common`) con utilidades y componentes comunes |
| **MockGovernanceDashboardRepository** | Repositorio local usado por WP-053–WP-079 para datos representativos no productivos |
| **Governance backend contract** | Contrato esperado para sustituir mocks por evidencias reales desde Graph/CSOM/Purview/SAM |

### Términos de estado y calidad

| Término | Definición |
|---------|------------|
| **Maduro** | Web part con implementación completa: ErrorBoundary, tema, Teams, service/repo, onDispose |
| **Reutilizable** | Web part funcional con buena estructura de datos pero con margen de mejora en patrones de calidad |
| **Experimental** | Web part funcional pero con carencias significativas de calidad (sin error boundary, sin theme, etc.) |
| **Incompleto** | Web part con implementación mínima que requiere trabajo significativo |
| **Mock-backed auditado** | Web part completo como frontend, con mocks visibles, documentación y auditoría; requiere backend para datos reales |
| **Reutilización Alta** | Componente con baja dependencia de contexto específico — fácil de reusar en otros proyectos |
| **Reutilización Media** | Componente reutilizable con algún nivel de acoplamiento específico |
| **Reutilización Baja** | Componente altamente especializado o minino — reusable principalmente como referencia |

---

## 12. Conclusión

Este repositorio contiene **79 proyectos SPFx independientes**, albergando **80 web parts físicos**. El catálogo mantiene **79 entradas numeradas** porque `WP-035` contiene dos webparts físicos (`SiteStorageDiagnosticsWebPart` y `RecycleBinSpaceCalculatorWebPart`).

- **SPFx 1.22.2** con React 17.0.1 y Fluent UI v8
- **Heft** como sistema de build (rushstack 1.1.2)
- **TypeScript ~5.8.0** con ESLint estricto idéntico en todos los proyectos
- **`@paquete/spfx-common`** como capa compartida de utilidades y tokens de tema en proyectos legacy
- **`projects/sharepoint-governance-webparts/_governance/`** como fuente documental compartida para modelos, contratos y coordinación de los nuevos webparts de gobernanza
- **Workspaces npm** con 9 scripts de orquestación en el root

**Puntos fuertes:**
1. Consistencia técnica admirable — todos los proyectos comparten build, lint, dependencias y estructura de carpetas.
2. 28 web parts legacy alcanzan estado "Maduro" con Score Promedio de 71%, demostrando una base de código funcional y estable.
3. Los 27 nuevos webparts de gobernanza tienen ErrorBoundary, service/repository/hook, tests, documentación completa, auditoría individual y build validado.
4. Patrones de Service/Repository bien establecidos en la mayoría de los proyectos maduros y en toda la nueva familia WP-053–WP-079.
5. Integración Teams y detección de tema oscuro presentes en la mayoría de los web parts maduros legacy.

**Áreas de mejora críticas:**
1. **Webparts legacy sin ErrorBoundary** — riesgo de crashes totales de página en SharePoint. Alta prioridad.
2. **Webparts legacy con acceso directo o capa incompleta** — deben alinearse con la separación de capas definida en AGENTS.md.
3. **WP-053–WP-079 sin backend real** — son válidos como frontend mock-backed, pero no deben usarse como evidencia productiva.
4. **WP-053–WP-079 sin onThemeChanged/Teams context detection específica** — conviene añadir adaptación avanzada al host antes de producción.
4. **3 proyectos con propiedades en modelo pero no expuestas** — inconsistencia de mantenimiento (WP-033, WP-046).

**Próximos pasos recomendados (en orden):**
1. Extraer `WebPartErrorBoundary` a `spfx-common` y añadirlo a los legacy faltantes.
2. Extraer `useDarkMode()` y `useTeamsContext()` hooks a `spfx-common` para eliminar duplicación.
3. Conectar backend read-only por fases para WP-053–WP-079, empezando por `tenant-site-inventory`, `storage-governance`, `orphan-sites-review`, `support-model-governance` y `site-creation-governance`.
4. Añadir `onThemeChanged` y detección de Teams/Office/Outlook a la plantilla de gobernanza.
5. Crear `BaseDataSourceWebPart<T>` para los 15+ web parts con el patrón de 3 data sources.
6. Revisar y completar los 3 proyectos marcados como "Incompletos" (WP-011, WP-048, WP-052).
7. Separar WP-035.1 y WP-035.2 en proyectos independientes.

---

*Documento actualizado el 2026-05-28 a partir del análisis directo de los 80 webparts físicos en el repositorio `paquete-webparts`, incluyendo proyectos legacy en `projects/*` y los nuevos proyectos anidados en `projects/sharepoint-governance-webparts/*`.*
