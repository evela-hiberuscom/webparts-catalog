import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, ".audit", "red-team");
const raw = path.join(base, "05_raw_tool_outputs");
const dirs = ["00_orchestrator","01_round_1","02_round_2","03_post_agents","04_consolidated","05_raw_tool_outputs","06_backlog","07_ci_hardening","08_evidence","09_final"];
for (const dir of dirs) fs.mkdirSync(path.join(base, dir), { recursive: true });

function read(rel, fallback = "") {
  try { return fs.readFileSync(path.join(root, rel), "utf8").replace(/^\uFEFF/, ""); } catch { return fallback; }
}
function readRaw(name, fallback = "") { return read(path.join(".audit", "red-team", "05_raw_tool_outputs", name), fallback); }
function jsonRaw(name, fallback) { try { return JSON.parse(readRaw(name)); } catch { return fallback; } }
function write(rel, content) {
  const target = path.join(base, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trimEnd() + "\n", "utf8");
}
function mdTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map(row => `| ${row.map(cell => String(cell).replace(/\n/g, "<br>").replace(/\|/g, "\\|")).join(" | ")} |`)
  ].join("\n");
}

const dt = readRaw("datetime.txt").trim() || new Date().toISOString();
const os = readRaw("os.txt").trim();
const branch = readRaw("git-branch.txt").trim();
const commit = readRaw("git-commit.txt").trim();
const status = readRaw("git-status-short.txt").trim();
const top = readRaw("top-level-file-counts.txt").trim();
const level2 = readRaw("level2-file-counts.txt").trim();
const exts = readRaw("file-extensions.txt").trim();
const tools = readRaw("tool-availability.txt").trim();
const localSummary = readRaw("local-static-scan-summary.txt").trim();
const sourceCounts = jsonRaw("source-pattern-counts.json", {});
const archMetrics = jsonRaw("architecture-quality-metrics.json", { perProject: [], largeFiles: [], hardcodedUiStringCandidates: [] });
const depAgg = jsonRaw("dependency-aggregate-summary.json", {});
const lockSummary = jsonRaw("lockfile-summary.json", {});
const solutionSummary = jsonRaw("spfx-package-solution-summary.json", []);
const testLoc = jsonRaw("test-and-localization-summary.json", {});
const noTestProjects = (archMetrics.perProject || []).filter(p => p.tests === 0).map(p => p.project.replace("projects/", ""));
const largeFiles = (archMetrics.largeFiles || []).slice(0, 10).map(x => `${x.file} (${x.lines} líneas)`);
const hardcodedExamples = (archMetrics.hardcodedUiStringCandidates || []).filter(x => !x.file.includes("WebPartErrorBoundary")).slice(0, 12).map(x => `${x.file}:${x.line} — ${x.snippet}`);
const parseErrors = jsonRaw("json-parse-errors.json", []);
const envStatus = readRaw("env-local-tracking-status.txt").trim();

const finalFindings = [
  { id: "SEC-001", title: "Airtable PAT presente en .env.local local e ignorado", category: "Secretos", severity: "Low", confidence: "High", state: "Confirmado", evidence: "secret-scan-local-masked.json; env-local-tracking-status.txt; .gitignore:1-4", files: ".env.local (no trackeado), .gitignore, scripts/lib/airtable.mjs", validation: "Ejecutar gitleaks localmente y revisar historial sin imprimir el secreto", recommendation: "Rotar el PAT si se compartió el entorno; mantenerlo en secretos del entorno y nunca en Git" },
  { id: "SEC-002", title: "window.open('_blank') sin noopener/noreferrer ni allowlist de URL", category: "Seguridad aplicativa", severity: "Low", confidence: "High", state: "Confirmado", evidence: "source-pattern-matches.json windowOpen: 5 hits _blank", files: "MyUsefulDocuments.tsx:60; MyTasksAndPending.tsx:69; NewJoiners.tsx:52; AreaGoals.tsx:71; InternalCampaignPanel.tsx:52", validation: "Prueba un enlace externo controlado y verifica que window.opener sea null", recommendation: "Usar helper seguro de enlace, tercer argumento 'noopener,noreferrer' y validación de protocolo/origen" },
  { id: "SEC-003", title: "Persistencia local de respuestas/identidad ligera en localStorage", category: "Privacidad e integridad cliente", severity: "Low", confidence: "High", state: "Confirmado", evidence: "MicroSurveyWebPart.ts:36-44; pollRepository.ts:253-293; dailyPulseRepository.ts:35-85,401-489", files: "projects/microencuesta; projects/pulso-del-dia", validation: "Inspeccionar claves localStorage tras responder; comprobar TTL/purga y no PII directa", recommendation: "Documentar finalidad, limitar datos, añadir TTL/purga y no tratar localStorage como boundary de seguridad" },
  { id: "SEC-004", title: "JsonUrl configurable sin restricción same-origin en mis-accesos-recientes", category: "Seguridad aplicativa / gobierno de dominios", severity: "Medium", confidence: "Medium", state: "Sospecha razonable", evidence: "R2: JsonRecentAccessesRepository.ts fetch(this._url); property pane recentItemsJsonUrl", files: "projects/mis-accesos-recientes/src/webparts/myRecentAccesses/repositories/JsonRecentAccessesRepository.ts; MyRecentAccessesWebPart.ts", validation: "Configurar URL externa en property pane en entorno local controlado y verificar si se permite", recommendation: "Reutilizar validación same-origin de otros proyectos o exigir allowlist explícita documentada" },
  { id: "SUPPLY-001", title: "Sin SCA/SBOM/Dependabot/Renovate versionados", category: "Supply chain", severity: "Medium", confidence: "High", state: "Confirmado", evidence: "tool-availability.txt; workflow-summary.json=[]; ausencia de dependabot/renovate/SBOM", files: ".github, package.json, projects/*/package.json", validation: "Buscar dependabot.yml/renovate.json/SBOM y ejecutar SCA en CI", recommendation: "Añadir Dependabot/Renovate, SBOM CycloneDX y npm audit controlado en CI" },
  { id: "SUPPLY-002", title: "Rangos flotantes y skew de lockfiles entre 52 proyectos", category: "Supply chain / reproducibilidad", severity: "Medium", confidence: "High", state: "Confirmado", evidence: "dependency-aggregate-summary.json floatingDependencyOccurrenceCount=207; lockfile-summary.json versionSkewCount=139", files: "projects/*/package.json; projects/*/package-lock.json", validation: "Ejecutar npm ci por proyecto en CI limpio", recommendation: "Pinning estricto o actualización agrupada; revisar lockfiles en PR" },
  { id: "SUPPLY-003", title: "Lockfiles potencialmente desincronizados con @paquete/spfx-common", category: "Supply chain / reproducibilidad", severity: "Medium", confidence: "Medium", state: "Sospecha razonable", evidence: "R2 detectó 17 lockfiles sin entrada para @paquete/spfx-common; npm ls raíz falla por root no instalado", files: "17 proyectos listados en R2 supply", validation: "Ejecutar npm ci en cada proyecto afectado sin modificar repo", recommendation: "Regenerar lockfiles afectados en una tarea controlada y añadir check de coherencia" },
  { id: "CI-001", title: "Ausencia total de workflows CI/CD versionados", category: "CI/CD", severity: "High", confidence: "High", state: "Confirmado", evidence: "workflow-summary.json=[]; .github solo contiene copilot-instructions.md", files: ".github", validation: "Listar .github/workflows y required checks del repo", recommendation: "Crear workflow de PR con build/test/lint/SCA/secrets y permisos mínimos" },
  { id: "QA-001", title: "Tests existentes no ejecutados automáticamente", category: "QA / release readiness", severity: "High", confidence: "High", state: "Confirmado", evidence: "testFileCount=212; workflows=0; builds no ejecutados por restricción de no generar artefactos", files: "projects/*/package.json; .github", validation: "Ejecutar heft test/build en CI por proyecto modificado", recommendation: "Gate de PR obligatorio con test/build y reporte de cobertura" },
  { id: "QA-002", title: "Cobertura desigual: varios proyectos sin tests y gaps negativos/a11y/throttling", category: "QA", severity: "Medium", confidence: "High", state: "Confirmado", evidence: `architecture-quality-metrics.json; proyectos sin tests: ${noTestProjects.join(", ") || "no calculado"}`, files: "projects/*", validation: "Medir cobertura real y revisar proyectos con tests=0", recommendation: "Añadir tests negativos 403/404/429, URLs inválidas, accesibilidad y estados vacíos" },
  { id: "SMELL-001", title: "Strings visibles hardcodeados pese a loc files", category: "Localización / UX", severity: "Low", confidence: "High", state: "Confirmado", evidence: "architecture-quality-metrics.json hardcodedUiStringCandidates", files: "CorporateAz.tsx; MyUsefulDocuments.tsx; MyTasksAndPending.tsx; ContextHelpPanel.tsx; otros", validation: "Buscar literales de UI fuera de loc y confirmar visibilidad", recommendation: "Migrar copy visible a loc/es-es.js, loc/en-us.js y mystrings.d.ts por proyecto" },
  { id: "SMELL-002", title: "Catch silenciosos/fallbacks sin diagnóstico", category: "Observabilidad / mantenibilidad", severity: "Medium", confidence: "High", state: "Confirmado", evidence: "source-pattern-counts.json catchSwallow=71", files: "scanEngine.ts; reportListRepository.ts; siteMetricsRepository.ts; pageContextAssistantUtils.ts; usefulDocumentsRepository.ts; tasksRepository.ts", validation: "Revisar cada catch y probar fallo controlado", recommendation: "Registrar error de forma segura, propagar estado de error y evitar success-shaped fallbacks" },
  { id: "BUG-001", title: "Uso frágil de getByTitle con encodeURIComponent en repositorios SharePoint", category: "Bug funcional", severity: "Medium", confidence: "Medium", state: "Sospecha razonable", evidence: "R1/R2 quality: usefulDocumentsRepository.ts:105-107; tasksRepository.ts:133-140", files: "projects/mis-documentos-utiles; projects/mis-tareas-y-pendientes", validation: "Probar títulos con espacios, &, # y comillas en una lista controlada", recommendation: "Escapar OData correctamente o resolver lista por ID/server-relative URL" },
  { id: "ARCH-001", title: "Repositorios/componentes grandes concentran transporte, parsing y reglas", category: "Arquitectura", severity: "Low", confidence: "High", state: "Confirmado", evidence: `largeFiles: ${largeFiles.slice(0,3).join("; ")}`, files: "pollRepository.ts; HistoricalStorageAnalyzer.tsx; dailyPulseRepository.ts; otros", validation: "Medir complejidad/fan-out y revisar cobertura por módulo", recommendation: "Extraer helpers puros y separar transporte/parsing/reglas en refactors incrementales" },
  { id: "DOC-001", title: "Drift funcional/nombre en visualizador de biblioteca y papelera", category: "Documentación / producto", severity: "Low", confidence: "Medium", state: "Sospecha razonable", evidence: "R1 recon: README del proyecto documenta desajuste de dominio/implementación", files: "projects/visualizador-de-elementos-de-biblioteca-y-papelera-superior/README.md", validation: "Confirmar intención de producto con owner", recommendation: "Alinear README, manifest, catálogo y alcance real" },
  { id: "TOOL-001", title: "Cobertura limitada por herramientas no disponibles/no ejecutadas", category: "Zona no cubierta", severity: "Info", confidence: "High", state: "No cubierto", evidence: "tool-availability.txt: semgrep/gitleaks/trivy/cyclonedx/cdxgen/dependency-check no disponibles; npm audit no ejecutado", files: ".audit/red-team/05_raw_tool_outputs/tool-availability.txt", validation: "Ejecutar herramientas en entorno autorizado con red/control de secretos", recommendation: "Integrar herramientas en CI y conservar resultados brutos" }
];

const fpFindings = [
  ["FP-001", "Secret scan: 73 hits por nombres *Tokens", "Falso positivo probable", "Los hits son tipos/campos funcionales como audienceTokens/profileTokens, no credenciales"],
  ["FP-002", "innerHTML=7", "Falso positivo confirmado", "Todos son container.innerHTML='' en tests"],
  ["FP-003", "target=_blank en Link/a", "Falso positivo confirmado", "Los 15 hits usan rel=noreferrer o noopener noreferrer"],
  ["FP-004", "JSON parse errors en manifests", "Falso positivo confirmado", "Los manifests SPFx son JSONC con comentarios; usar jsonc-parser"],
  ["FP-005", "npm ls raíz missing spfx-common como vulnerabilidad", "Falso positivo de severidad", "Root no tiene node_modules; es estado local, no fuga ni CVE"],
  ["NEG-001", "XSS por dangerouslySetInnerHTML/eval/document.write/iframe", "Negativo verificado", "Contadores a 0 en source-pattern-counts.json"]
];

function findingCards(findings = finalFindings) {
  return findings.map(f => `## ${f.id} — ${f.title}

| Campo | Valor |
|---|---|
| Categoría | ${f.category} |
| Severidad final | ${f.severity} |
| Confianza | ${f.confidence} |
| Estado | ${f.state} |
| Evidencia | ${f.evidence} |
| Archivos | ${f.files} |
| Cómo validarlo de forma segura | ${f.validation} |
| Recomendación | ${f.recommendation} |
| Tests recomendados | Tests unitarios/CI específicos del flujo afectado; casos negativos cuando aplique |
| Esfuerzo | Bajo/Medio según alcance |
| Riesgo de regresión | Bajo si se cubre con tests; medio para cambios de repositorios compartidos |
| Prioridad | ${f.severity === "High" ? "P1" : f.severity === "Medium" ? "P2" : "P3"} |
`).join("\n");
}

const severityCounts = finalFindings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {});
const confirmedCount = finalFindings.filter(f => f.state === "Confirmado").length;
const suspicionCount = finalFindings.filter(f => f.state === "Sospecha razonable").length;
const noCoveredCount = finalFindings.filter(f => f.state === "No cubierto").length;

write("00_orchestrator/repo_context.md", `# Contexto del repositorio

- Fecha/hora local capturada: ${dt}
- Sistema operativo: ${os}
- Raíz confirmada: ${readRaw("pwd.txt").trim() || root}
- Rama: ${branch}
- Commit: ${commit}
- Estado git short al inicio:

\`\`\`text
${status || "(sin cambios trackeados; existen archivos untracked de auditoría)"}
\`\`\`

## Estructura primer nivel

\`\`\`text
${top}
\`\`\`

## Estructura segundo nivel agregada

\`\`\`text
${level2}
\`\`\`

## Lenguajes y frameworks detectados

\`\`\`text
${exts}
\`\`\`

- Tipo de proyecto: pack/monorepo de soluciones SPFx para SharePoint Online.
- Frameworks detectados: SPFx 1.22.2, React 17, Fluent UI v8, TypeScript, Jest/Heft por proyecto.
- Gestores de paquetes: npm por proyecto; pnpm/yarn disponibles en máquina pero no fuente de verdad del repo.
- Lockfiles: ${lockSummary.lockfileCount || 52} package-lock.json v3 por proyecto; sin lock raíz operativo.
- Pipelines detectadas: ninguna workflow versionada en .github/workflows.
- Docker/IaC detectado: no detectado localmente.
- Tests: ${testLoc.testFileCount || 212} ficheros de test detectados; ejecución no realizada por restricción de no generar artefactos.
- Documentación: README raíz, AGENTS.md, DESIGN.md, CATALOGO_WEBPARTS_SPFX.md, README por proyecto.

## Resumen de escaneo local

\`\`\`text
${localSummary}
\`\`\`

## Herramientas disponibles/no disponibles

\`\`\`text
${tools}
\`\`\`
`);

write("00_orchestrator/agent_plan.md", `# Plan de agentes

## RONDA 1

1. Reconocimiento e inventario técnico.
2. AppSec/SAST manual y automatizado disponible.
3. Dependencias, supply chain y SBOM.
4. Secretos y datos sensibles.
5. Trivy, contenedores, IaC y configuración.
6. Calidad, bugs, code smells y código muerto.
7. Tests, QA y fiabilidad.
8. CI/CD, permisos y gobernanza.
9. Arquitectura, mantenibilidad y diseño.
10. Lógica de negocio y flujos críticos.

Cada agente tiene informe propio y adversarial correspondiente.

## RONDA 2

Se ejecuta revalidación independiente con foco en contradicciones, falsos positivos, falsos negativos, severidad y release readiness.

## Post-agentes

A. Normalizador de hallazgos.  
B. Cazador de falsos positivos.  
C. Cazador de falsos negativos.  
D. Priorizador de riesgo real.  
E. Auditor de coherencia global.  
F. Backlog.  
G. Hardening CI/CD y supply chain.  
H-L. Informes finales.
`);

write("00_orchestrator/execution_log.md", `# Execution log

| Fase | Comando/acción | Resultado | Salida bruta |
|---|---|---|---|
| Contexto | git branch --show-current | ${branch || "capturado"} | 05_raw_tool_outputs/git-branch.txt |
| Contexto | git rev-parse HEAD | ${commit || "capturado"} | 05_raw_tool_outputs/git-commit.txt |
| Contexto | git status --short | Capturado | 05_raw_tool_outputs/git-status-short.txt |
| Inventario | git ls-files | Capturado | 05_raw_tool_outputs/git-ls-files.txt |
| Inventario | Escaneo local Node sin red | Capturado | local-static-scan-summary.txt, source-pattern-matches.json |
| Herramientas | Get-Command herramientas | Capturado | tool-availability.txt |
| Dependencias | npm ls --all --json --omit=dev --ignore-scripts | Falló por entorno raíz sin node_modules/workspace link; no instala ni cambia estado | npm-ls-root-json.txt |
| Seguridad | Secret scan heurístico local enmascarado | Capturado | secret-scan-local-masked.json |
| Seguridad | Estado .env.local sin valor | Capturado | env-local-tracking-status.txt |
| RONDA 1 | Subagentes locales defensivos | Completado | Informes en 01_round_1 |
| RONDA 2 | Revalidación independiente | Completado | Informes en 02_round_2 |
| Post | Consolidación y backlog | Completado | 03_post_agents, 06_backlog, 07_ci_hardening, 09_final |

## Comandos no ejecutados por restricción

- npm audit / pnpm audit / yarn audit: requiere consulta al registry externo.
- npm install / npm ci: altera entorno y puede ejecutar scripts de paquetes.
- semgrep/gitleaks/trivy/cyclonedx/cdxgen/dependency-check: no disponibles localmente.
- builds/tests Heft: generan artefactos y pueden tardar/producir cambios; quedan como recomendación de CI.
`);

write("01_round_1/agent_01_recon_inventory.md", `# RONDA 1 — AGENTE 1 — Reconocimiento e inventario técnico

## Alcance

Repositorio completo con foco en estructura SPFx, proyectos, paquetes compartidos, documentación, manifiestos, scripts y evidencia generada localmente.

## Archivos revisados

- AGENTS.md, DESIGN.md, README.md, CATALOGO_WEBPARTS_SPFX.md.
- package.json raíz y packages/spfx-common.
- projects/*/package.json, config/package-solution.json, README.md y muestras de webparts críticos.
- Evidencia en 05_raw_tool_outputs.

## Herramientas usadas

Lectura local, git ls-files, glob/rg, escaneo Node local sin red.

${mdTable(["Área","Evidencia","Riesgo inicial","Archivos implicados","Qué debe revisar otro agente"], [
  ["Monorepo SPFx", "52 proyectos y 53 webparts", "Medio", "projects/*", "Build/test por proyecto"],
  ["Arquitectura canónica", "AGENTS.md exige components/hooks/services/repositories/models/utils", "Medio", "AGENTS.md:86-106", "Arquitectura y code smells"],
  ["Localización", "loc existe pero hay hardcoded UI", "Medio", "loc/* + components/*", "Calidad/UX"],
  ["Error boundary", "53 WebPartErrorBoundary para 53 webparts", "Bajo", "architecture-quality-metrics.json", "Montaje en raíz"],
  ["Pipelines", "workflow-summary.json=[]", "Alto operacional", ".github", "CI/CD"],
  ["Supply chain", "52 lockfiles, 207 rangos flotantes", "Medio", "projects/*/package*.json", "Supply chain"],
  ["Secretos", ".env.local local ignorado", "Bajo repositorio", ".env.local, .gitignore", "Secret scanning/historial"],
  ["Docker/IaC", "iacFiles=0", "Info", "repo", "Trivy/IaC si aparece fuera del repo"]
])}

## Hallazgos

- Confirmado: el repositorio es un pack SPFx gobernado por AGENTS.md y DESIGN.md.
- Confirmado: 52 soluciones SPFx tienen package-solution.json con skipFeatureDeployment=false y sin webApiPermissionRequests.
- Confirmado: no hay CI versionado ni Docker/IaC local.
- Sospecha razonable: el volumen de proyectos y lockfiles independientes exige gates automáticos para evitar drift.

## Incertidumbres y zonas no cubiertas

No se validó runtime SharePoint, app catalog, branch protection, historial git con gitleaks ni build/test real.

## Recomendaciones

Priorizar CI, SCA/SBOM, secret scanning, validación de lockfiles y normalización de localización/error handling.
`);

write("01_round_1/agent_02_appsec_sast.md", `# RONDA 1 — AGENTE 2 — AppSec / SAST manual y automatizado

## Alcance

Revisión OWASP aplicable a SPFx cliente: XSS, navegación externa, storage cliente, fetch/SPHttpClient, permisos declarados y errores.

## Archivos revisados

source-pattern-matches.json, source-pattern-counts.json, MicroSurvey, DailyPulse, MyUsefulDocuments, MyTasksAndPending, PageContextAssistant, reservas/favoritos y package-solution summaries.

## Herramientas usadas

Escaneo local heurístico y revisión manual. Semgrep/Sonar/Fortify no disponibles.

## Hallazgos

- Confirmado negativo: dangerouslySetInnerHTML=0, iframe=0, eval/new Function=0, document.write=0.
- Falso positivo probable: innerHTML aparece solo en tests como limpieza de contenedor.
- Confirmado: 5 window.open con _blank sin noopener/noreferrer ni helper de URL segura.
- Sospecha razonable R2: mis-accesos-recientes permite JsonUrl configurable con fetch directo sin same-origin confirmado.
- Confirmado: localStorage persiste respuestas/identidad ligera en microencuesta y pulso-del-dia.
- Confirmado positivo: webApiPermissionRequests vacío en las 52 soluciones.

## Incertidumbres

No se ejecutó Semgrep/Sonar ni análisis de flujo semántico. No se verificó CSP real del tenant.

## Recomendaciones

Usar helper createSafeExternalLink/validación same-origin, minimizar localStorage, revisar JsonUrl configurables, y añadir SAST en CI.
`);

write("01_round_1/agent_03_supply_chain.md", `# RONDA 1 — AGENTE 3 — Dependencias, supply chain y SBOM

## Alcance

Package managers, lockfiles, rangos, lifecycle scripts, SBOM y automatización de dependencias.

## Evidencia

- package-manifest-summary.json: 54 package manifests.
- dependency-aggregate-summary.json: 207 ocurrencias de rangos flotantes; lifecycleScripts=[].
- lockfile-summary.json: 52 package-lock.json v3; versionSkewCount=${lockSummary.versionSkewCount || 139}.
- tool-availability.txt: cyclonedx/cdxgen/dependency-check/trivy no disponibles.

## Hallazgos

- Confirmado: 52 lockfiles independientes para proyectos SPFx.
- Confirmado: rangos flotantes repetidos, incluidos @fluentui/react, typescript y css-loader.
- Confirmado positivo: no hay lifecycle scripts peligrosos declarados.
- Confirmado: no hay SBOM, Dependabot ni Renovate detectados.
- Sospecha razonable R2: 17 lockfiles pueden estar desincronizados con @paquete/spfx-common.
- No cubierto: CVEs; npm audit no se ejecutó para no consultar registry externo.

## Recomendaciones

Validar npm ci por proyecto, añadir Dependabot/SBOM/SCA, pinning controlado y revisión de lockfile en PR.
`);

write("01_round_1/agent_04_secrets_sensitive_data.md", `# RONDA 1 — AGENTE 4 — Secretos y datos sensibles

## Alcance

Búsqueda de secretos hardcodeados, ficheros de entorno, tokens funcionales falsos positivos y PII cliente.

## Herramientas usadas

Escaneo heurístico local enmascarado. Gitleaks/Trivy secret scanner no disponibles.

## Hallazgos

- Confirmado: .env.local existe localmente y contiene AIRTABLE_API_TOKEN enmascarado. No está trackeado por Git y .gitignore lo cubre.
- Falsos positivos probables: 73 hits restantes por nombres como audienceTokens/profileTokens/departmentTokens son campos funcionales, no credenciales.
- Confirmado: scripts/lib/airtable.mjs usa AIRTABLE_API_TOKEN desde entorno para tooling local.
- Confirmado: localStorage guarda datos de comportamiento en microencuesta/pulso-del-dia.

## Evidencia

- secret-scan-local-masked.json: valor enmascarado, sin imprimir secreto completo.
- env-local-tracking-status.txt: git ls-files vacío para .env.local.
- .gitignore: líneas 1-4 ignoran .env* local.

## No cubierto

Historial Git con gitleaks, validez/scope del token, secretos de CI, artefactos ignorados.

## Recomendaciones

Rotar si el entorno se compartió, ejecutar gitleaks en CI, mantener env fuera de Git y documentar tratamiento de PII local.
`);

write("01_round_1/agent_05_trivy_containers_iac.md", `# RONDA 1 — AGENTE 5 — Trivy, contenedores, IaC y configuración

## Alcance

Trivy FS, Dockerfiles, compose, Kubernetes/Helm/Terraform/Bicep/ARM y configuración SPFx.

## Herramientas usadas

Inventario local. Trivy no disponible.

## Hallazgos

- No cubierto: Trivy no disponible, por tanto no se afirman CVEs/misconfigs de filesystem.
- Confirmado negativo: iac-and-container-files.json está vacío; no se detectó Docker/IaC local.
- Confirmado: 52 soluciones con skipFeatureDeployment=false, webApiPermissionRequests=[] e includeClientSideAssets=true.
- Falso positivo probable: parse errors de manifests se deben a JSONC con comentarios SPFx, no a manifests rotos.

## Recomendaciones

Integrar Trivy/SBOM en CI si el entorno lo permite; usar parser JSONC para manifests SPFx; no exigir escaneo Docker si no hay Dockerfiles.
`);

write("01_round_1/agent_06_quality_bugs_dead_code.md", `# RONDA 1 — AGENTE 6 — Calidad, bugs, code smells y código muerto

## Alcance

Bugs probables, code smells, catch silenciosos, any, hardcoded strings, duplicación, archivos grandes y deuda técnica.

## Evidencia clave

\`\`\`json
${JSON.stringify(sourceCounts, null, 2)}
\`\`\`

## Hallazgos

- Confirmado: hardcoded UI strings visibles fuera de loc en CorporateAz, MyUsefulDocuments, MyTasksAndPending y ContextHelpPanel.
- Confirmado: 71 catch/fallbacks silenciosos candidatos.
- Confirmado: 23 anyUsage y 29 TODO/FIXME.
- Confirmado: archivos grandes como ${largeFiles.slice(0,5).join("; ")}.
- Sospecha razonable: getByTitle con encodeURIComponent en repositorios SharePoint puede fallar con caracteres especiales.
- Confirmado: duplicación de estados loading/empty/error/card en varios componentes.

## Recomendaciones

Migrar copy a loc, prohibir catch vacíos, eliminar any en DTOs SharePoint, refactorizar repos grandes y añadir tests de caracteres especiales en listas.
`);

write("01_round_1/agent_07_tests_qa_reliability.md", `# RONDA 1 — AGENTE 7 — Tests, QA y fiabilidad

## Alcance

Tests unitarios, integración/e2e, cobertura, flakiness, scripts de validación y release QA.

## Evidencia

- source files: ${testLoc.sourceFileCount || 1057}
- test files: ${testLoc.testFileCount || 212}
- proyectos sin tests detectados: ${noTestProjects.join(", ") || "no calculado"}
- scripts build por proyecto: heft build --clean --production && heft test --production && heft package-solution --production.

## Hallazgos

- Confirmado: hay base de tests amplia pero no hay CI que la ejecute.
- Confirmado: no se ejecutó build/test en esta auditoría por restricción de no generar artefactos.
- Confirmado: root node_modules ausente; entorno incompleto para validación agregada.
- Sospecha razonable: flakiness en scanEngine/useScanEngine por asincronía, throttling y cache.
- Confirmado: faltan tests negativos/a11y/throttling/URLs inválidas en el alcance muestreado.

## Recomendaciones

CI por proyecto modificado, cobertura real, tests negativos 403/404/429, accesibilidad con axe y smoke de packaging.
`);

write("01_round_1/agent_08_cicd_governance.md", `# RONDA 1 — AGENTE 8 — CI/CD, permisos y gobernanza

## Alcance

GitHub Actions, permisos, secretos, gates, publicación, branch protection y gobernanza.

## Hallazgos

- Confirmado: no hay .github/workflows versionados.
- Confirmado: no hay permisos YAML que auditar ni pull_request_target peligroso detectado localmente.
- Confirmado: no hay gates de SAST/SCA/secrets/build/test en CI local.
- No cubierto: branch protection, required checks, environments y secretos GitHub por no estar en repo.
- Confirmado: despliegue SPFx no muestra permisos API extra en package-solution.json.

## Recomendaciones

Crear workflow con permissions: contents: read, CI de build/test por proyecto, SCA/SBOM/secrets, branch protection y revisión de lockfiles.
`);

write("01_round_1/agent_09_architecture_maintainability.md", `# RONDA 1 — AGENTE 9 — Arquitectura, mantenibilidad y diseño

## Mapa de arquitectura inferido

Patrón dominante: WebPart -> componente -> hook -> service -> repository -> SharePoint/API/localStorage, con models/utils por proyecto. packages/spfx-common aporta utilidades compartidas como createSafeExternalLink y classifyAsyncState.

## Riesgos

- Confirmado: arquitectura homogénea pero repetida 52 veces, con alto coste de coherencia.
- Confirmado: repositorios/componentes grandes concentran transporte, parsing, cache y reglas.
- Confirmado: spfx-common es útil pero no todos los proyectos consumen helpers seguros de navegación.
- Sospecha razonable: visualizador-de-elementos-de-biblioteca-y-papelera-superior mezcla o deriva de dominio funcional.

## Cambios pequeños de alto valor

- Reutilizar helper seguro de enlaces.
- Estandarizar error handling y estados async.
- Extraer helpers puros de repos grandes.
- Completar localización visible.

## Cambios grandes que requieren decisión

- Orquestación raíz para 52 proyectos.
- Estrategia única de datos/cache/persistencia.
- Redefinición de alcance de visualizador si el owner confirma drift.
`);

write("01_round_1/agent_10_business_logic.md", `# RONDA 1 — AGENTE 10 — Lógica de negocio y flujos críticos

## Flujos críticos inferidos

- microencuesta: cargar pregunta, detectar respuesta previa, evitar doble envío, persistir por StaticConfig/API/SharePoint.
- pulso-del-dia: resolver prompt diario, evitar reenvío, persistir local y remoto.
- analizador/visualizador: escanear bibliotecas/sitio, tolerar throttling, persistir reportes.
- asistente-contextual: match exacto y fallback genérico.

## Hallazgos

- Confirmado: microencuesta aplica same-origin para ApiEndpoint y soporta SharePointList.
- Confirmado: StaticConfig persiste en localStorage, no debe considerarse control de seguridad.
- Confirmado: pulso-del-dia persiste respuesta en localStorage incluso en flujos remotos, como apoyo de UX.
- Sospecha: identidad incompleta puede debilitar unicidad de respuesta en microencuesta.
- Sospecha: mis-accesos-recientes JsonUrl configurable puede saltarse política same-origin aplicada por otros proyectos.

## Recomendaciones

Definir reglas de identidad/unicidad, documentar localStorage, probar fallos backend y centralizar validación de URLs configurables.
`);

const adversarial = {
  "01_recon_inventory": ["Sólido: inventario de 52 proyectos y fuentes canónicas", "Inflado: tratar cada spHttpClient como riesgo", "FP: externalUrl no implica salida insegura", "Falta: manifests con parser JSONC", "No revisado: branch protections", "Nuevo: ausencia CI domina riesgo", "Poco realista: refactor global", "Cambio final: priorizar CI/SCA/localización"],
  "02_appsec_sast": ["Sólido: no XSS/eval/iframe confirmado", "Inflado: target=_blank con rel=noreferrer", "FP: innerHTML en tests", "Falta: Semgrep y runtime", "No revisado: todos los JsonUrl", "Nuevo: mis-accesos-recientes", "Poco realista: prohibir todo fetch", "Cambio final: severidad baja/media"],
  "03_supply_chain": ["Sólido: 52 lockfiles y rangos flotantes", "Inflado: npm ls root missing como vulnerabilidad", "FP: dependencyRootCount=0 en locks v3", "Falta: npm ci por proyecto", "No revisado: CVEs", "Nuevo: locks desincronizados", "Poco realista: migrar todo a pnpm", "Cambio final: CI reproducible primero"],
  "04_secrets_sensitive_data": ["Sólido: .env.local contiene token local", "Inflado: llamarlo fuga confirmada", "FP: audienceTokens/profileTokens", "Falta: historial gitleaks", "No revisado: CI secrets", "Nuevo: PII ligera storage", "Poco realista: imprimir secreto", "Cambio final: rotación preventiva"],
  "05_trivy_containers_iac": ["Sólido: Trivy no disponible", "Inflado: ausencia Trivy no es vulnerabilidad", "FP: JSON parse manifests", "Falta: Trivy/SBOM real", "No revisado: app catalog", "Nuevo: gap CI", "Poco realista: Docker scan sin Docker", "Cambio final: no cubierto/preventivo"],
  "06_quality_bugs_dead_code": ["Sólido: hardcoded strings/catch/any", "Inflado: tamaño de archivo como bug", "FP: WebPartErrorBoundary false positives en hardcoded scan", "Falta: complejidad real", "No revisado: todos los proyectos", "Nuevo: getByTitle frágil", "Poco realista: resolver 238 strings de golpe", "Cambio final: backlog por prioridad"],
  "07_tests_qa_reliability": ["Sólido: 212 tests pero sin CI", "Inflado: asumir cero cobertura", "FP: node_modules parcial no implica fallo producto", "Falta: ejecución real", "No revisado: cobertura", "Nuevo: proyectos sin tests", "Poco realista: build de 52 proyectos local", "Cambio final: CI por proyecto modificado"],
  "08_cicd_governance": ["Sólido: no workflows", "Inflado: no equivale a compromiso", "FP: no hay pull_request_target peligroso", "Falta: branch protections", "No revisado: pipelines externos", "Nuevo: ausencia de gates supply", "Poco realista: full DevSecOps de una vez", "Cambio final: CI mínimo"],
  "09_architecture_maintainability": ["Sólido: patrón por capas existe", "Inflado: arquitectura limpia sin excepciones", "FP: Context no es monolito", "Falta: grafo dependencias", "No revisado: fan-out completo", "Nuevo: repositorios monolíticos", "Poco realista: plataforma compartida inmediata", "Cambio final: refactors incrementales"],
  "10_business_logic": ["Sólido: flujos críticos identificados", "Inflado: no hay bypass auth crítico", "FP: partialData puede ser semántico", "Falta: datos reales SharePoint", "No revisado: permisos tenant", "Nuevo: JsonUrl mis-accesos", "Poco realista: rediseñar todos flujos", "Cambio final: tests de edge cases"]
};
for (const [name, points] of Object.entries(adversarial)) {
  write(`01_round_1/adversarial_agent_${name}.md`, `# RONDA 1 — Adversarial ${name}

${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Resolución

Los hallazgos sin evidencia suficiente se rebajan a sospecha o falso positivo probable. El informe final prioriza CI/QA/supply chain y evita exagerar riesgos AppSec no confirmados.
`);
}

write("02_round_2/agent_01_second_pass_recon.md", `# RONDA 2 — Agent 01 — Second pass recon

## Reanálisis independiente

- Repo con 52 proyectos, 53 webparts y 53 WebPartErrorBoundary.
- Existe base de localización, pero la cobertura no es completa.
- Proyectos sin tests: ${noTestProjects.join(", ") || "no calculado"}.
- Los scripts por proyecto existen, pero no hay orquestación CI agregada.

## Delta frente a R1

R1 acertó en la estructura general, pero R2 matiza que el riesgo dominante no es AppSec crítico sino operacional: CI, tests dormidos, lockfiles y error handling.

## Zonas no cubiertas

Runtime SharePoint, branch protections, pipelines externos y validación de todos los manifests con parser JSONC.
`);

write("02_round_2/agent_02_second_pass_security.md", `# RONDA 2 — Agent 02 — Seguridad

## Hallazgos ajustados

- SEC-R2-01: .env.local contiene AIRTABLE_API_TOKEN local, ignorado y no trackeado. Severidad repositorio: Low.
- SEC-R2-02: window.open inseguro concentrado en 5 _blank; 2 _self no son reverse-tabnabbing. Falta allowlist de URL/protocolo.
- SEC-R2-03: localStorage confirmado en microencuesta y pulso-del-dia; riesgo de privacidad/integridad bajo-medio.
- SEC-R2-04: JsonUrl configurable en mis-accesos-recientes sin same-origin confirmado. Severidad Medium, confianza Medium.

## Negativos confirmados

No se confirma dangerouslySetInnerHTML, eval, new Function, document.write ni iframe.

## Herramientas no disponibles

Semgrep, gitleaks y trivy no disponibles; no se ejecutó npm audit por restricción de no enviar datos al registry.
`);

write("02_round_2/agent_03_second_pass_supply_chain.md", `# RONDA 2 — Agent 03 — Supply chain

## Hallazgos ajustados

- SC-R2-01: workspace raíz solo cubre packages/*, no projects/*; los 52 proyectos se gestionan aislados.
- SC-R2-02: 17 lockfiles potencialmente desincronizados con @paquete/spfx-common. Severidad Medium hasta probar npm ci.
- SC-R2-03: 207 rangos flotantes y skew real de locks. Severidad Medium.
- SC-R2-04: lifecycleScripts=[] es control positivo.
- SC-R2-05: sin SBOM/dependency automation local.

## Falsos positivos/ajustes

npm ls raíz missing @paquete/spfx-common refleja entorno sin install; no es vulnerabilidad por sí mismo. dependencyRootCount=0 en locks v3 no indica locks vacíos.
`);

write("02_round_2/agent_04_second_pass_quality.md", `# RONDA 2 — Agent 04 — Calidad

## Reanálisis

- hardcoded UI strings confirmados pese a loc files.
- catchSwallow=71, anyUsage=23, consoleErrorWarn=61, todoFixme=29.
- No es solo estética: afecta localización, soporte, accesibilidad y coherencia de producto.

## Severidad ajustada

- Hardcoded strings: Low/Medium según proyecto.
- Catch silenciosos: Medium.
- any usage: Low.

## Recomendaciones

Backlog progresivo por top proyectos, lint para no-empty catch, DTOs SharePoint tipados y tests negativos.
`);

write("02_round_2/agent_05_second_pass_cicd_iac.md", `# RONDA 2 — Agent 05 — CI/CD e IaC

## Hallazgos

- Sin pipeline CI/CD versionado: workflow-summary.json=[].
- Sin Docker/IaC local: iac-and-container-files.json=[].
- Sin gates supply/security automatizados.
- Build existe por proyecto, no agregado desde raíz.

## No cubierto

Branch protection, secret scanning GitHub, pipelines externos, tenant/app catalog policies.
`);

write("02_round_2/agent_06_second_pass_architecture.md", `# RONDA 2 — Agent 06 — Arquitectura

## Hallazgos

- Arquitectura por capas existe, pero archivos grandes concentran responsabilidades.
- Ejemplos: ${largeFiles.slice(0,8).join("; ")}.
- dailyPulseRepository combina localStorage, anti-duplicado, digest, POST y parsing.
- PollRepository combina tres fuentes de datos, payloads SharePoint y storage local.

## Recomendación

Refactors incrementales con helpers puros y separación de parsing/transporte/reglas, priorizando módulos con tests.
`);

write("02_round_2/agent_07_second_pass_business_logic.md", `# RONDA 2 — Agent 07 — Lógica de negocio

## Hallazgos

- localStorage no debe ser control de unicidad ni integridad.
- Microencuesta y pulso-del-dia requieren tests de fallo backend, identidad incompleta y manipulación storage.
- JsonUrl configurable debe ser same-origin/allowlist para mantener gobernanza SPFx.
- Repositorios grandes pueden ocultar falsos éxitos por fallbacks.

## Severidad ajustada

No hay bypass auth crítico confirmado. Riesgos funcionales/privacidad: Low-Medium; JsonUrl configurable: Medium.
`);

write("02_round_2/agent_08_second_pass_false_positives.md", `# RONDA 2 — Agent 08 — Falsos positivos

${mdTable(["ID","Señal","Resolución","Razón"], fpFindings)}

## Cambios de severidad

- target=_blank con rel=noreferrer: se cierra como FP.
- innerHTML en tests: se cierra como FP.
- manifest parse errors: se cierra como FP de herramienta.
- npm ls root missing: se reclasifica como estado local/operacional.
`);

write("02_round_2/agent_09_second_pass_false_negatives.md", `# RONDA 2 — Agent 09 — Falsos negativos

${mdTable(["ID","Posible omisión","Severidad","Evidencia","Acción"], [
  ["FN-001", "JsonUrl arbitrario en mis-accesos-recientes", "Medium", "JsonRecentAccessesRepository.ts fetch(this._url)", "Validar same-origin/allowlist"],
  ["FN-002", "Falta allowlist de protocolo en window.open", "Medium", "5 _blank desde campos configurables", "Helper seguro de enlaces"],
  ["FN-003", "localStorage en pulso con respuesta/usuario", "Low-Medium", "dailyPulseRepository.ts", "TTL/purga/documentación"],
  ["FN-004", "17 lockfiles desincronizados", "Medium", "R2 supply", "npm ci por proyecto"],
  ["FN-005", "Scanner no parsea JSONC manifests", "Info/coverage", "json-parse-errors.json", "jsonc-parser"]
])}
`);

write("02_round_2/agent_10_second_pass_release_readiness.md", `# RONDA 2 — Agent 10 — Release readiness

## Decisión R2

No listo para release sin condiciones. No hay hallazgos AppSec críticos confirmados, pero el riesgo operacional es alto por ausencia de CI, tests no ejecutados automáticamente y supply chain sin automatización.

## Bloqueantes de confianza

- CI-001: sin workflows/gates.
- QA-001: 212 tests no se ejecutan en CI.
- SUPPLY-002/SUPPLY-003: drift y lockfiles potencialmente desincronizados.
- SMELL-002: catch silenciosos dificultan soporte en producción.

## Condición mínima para release

Workflow de PR con build/test por proyecto modificado, revisión de lockfiles, secret scan y SCA/SBOM inicial.
`);

write("02_round_2/round_2_delta_vs_round_1.md", `# RONDA 2 — Delta vs RONDA 1

${mdTable(["Tema","Ronda 1 decía","Ronda 2 dice","Resolución propuesta","Impacto en severidad"], [
  [".env.local Airtable PAT", "Secreto confirmado", "Local ignorado y no trackeado", "Rotar preventivamente; no tratar como fuga Git", "Low"],
  ["Tokens funcionales", "Hits de secret scan", "73 falsos positivos", "Allowlist futura", "N/A"],
  ["window.open", "7 hits", "5 _blank reales; 2 _self no tabnabbing", "Tercer argumento y URL helper", "Low"],
  ["target=_blank", "Riesgo implícito", "Todos tienen noreferrer/noopener", "Cerrar FP", "N/A"],
  ["innerHTML", "No XSS confirmado", "Todos en tests", "Cerrar FP", "N/A"],
  ["localStorage", "Bajo/medio", "Solo microencuesta/pulso; datos comportamiento", "TTL/documentación", "Low"],
  ["CI", "Ausente", "Ausente confirmado", "Crear workflow PR", "High operacional"],
  ["SBOM/Dependabot", "Ausentes", "Ausentes confirmado", "Dependabot + SBOM", "Medium"],
  ["Lockfiles", "Skew", "Skew + posible desync spfx-common", "npm ci por proyecto", "Medium"],
  ["npm ls root missing", "Problema", "FP por root no instalado", "No usar como vulnerabilidad", "N/A/Bajo operacional"],
  ["Manifests parse errors", "FP probable", "FP confirmado JSONC", "jsonc-parser", "N/A"],
  ["Catch silenciosos", "Bajo/medio", "71 ocurrencias; observabilidad real", "no-empty catch", "Medium"],
  ["Hardcoded strings", "Detectado", "Localización incompleta", "Backlog top proyectos", "Low"],
  ["XSS/eval/iframe/IaC", "No confirmado", "Negativo verificado localmente", "Cerrar", "N/A"],
  ["Riesgo dominante", "Mixto", "Operacional, no AppSec crítico", "CI/QA/Supply primero", "Ajuste de foco"]
])}
`);

write("03_post_agents/post_agent_a_finding_normalizer.md", `# POST-AGENTE A — Normalizador de hallazgos

${findingCards()}
`);

write("03_post_agents/post_agent_b_false_positive_hunter.md", `# POST-AGENTE B — Cazador de falsos positivos

${mdTable(["ID","Hallazgo","Evidencia disponible","Argumento de falso positivo","Resolución","Severidad final","Confianza final"], [
  ["FP-001", "Secret scan Tokens", "secret-scan-local-masked.json", "Son identificadores de segmentación, no credenciales", "Excluir del top final", "N/A", "High"],
  ["FP-002", "innerHTML", "source-pattern-matches.json", "Solo limpieza de DOM en tests", "Cerrar", "N/A", "High"],
  ["FP-003", "target=_blank", "source-pattern-matches.json", "Todos con noreferrer/noopener", "Cerrar", "N/A", "High"],
  ["FP-004", "manifest parse errors", "json-parse-errors.json", "SPFx manifests son JSONC", "Usar parser JSONC", "N/A", "High"],
  ["FP-005", "npm ls root missing", "npm-ls-root-json.txt", "Root sin node_modules; no prueba vulnerabilidad", "Reclasificar", "Info", "High"]
])}
`);

write("03_post_agents/post_agent_c_false_negative_hunter.md", `# POST-AGENTE C — Cazador de falsos negativos

## Hallazgos añadidos o reforzados

- SEC-004: JsonUrl configurable en mis-accesos-recientes sin same-origin confirmado.
- SUPPLY-003: lockfiles potencialmente desincronizados con @paquete/spfx-common.
- TOOL-001: manifests JSONC no cubiertos por parser JSON estándar.
- QA-002: proyectos sin tests y ausencia de tests negativos/a11y/throttling.
- SMELL-002: 71 catch/fallbacks silenciosos afectan observabilidad.

## Zonas que requieren revisión manual posterior

Branch protections, secret scanning GitHub, app catalog, CSP/tenant, CVEs transitivos, licencias y runtime SharePoint con datos reales.
`);

write("03_post_agents/post_agent_d_risk_prioritizer.md", `# POST-AGENTE D — Priorizador de riesgo real

## Modelo usado

Riesgo final = impacto x probabilidad x exposición x confianza.

${mdTable(["Prioridad","ID","Severidad","Motivo"], [
  ["P1", "CI-001", "High", "Sin CI no hay control de build/test/security en PR"],
  ["P1", "QA-001", "High", "212 tests dormidos sin ejecución automática"],
  ["P2", "SUPPLY-001", "Medium", "Sin SBOM/SCA/dependency automation"],
  ["P2", "SUPPLY-002", "Medium", "Rangos flotantes + skew sin guardrails"],
  ["P2", "SUPPLY-003", "Medium", "Posible fallo npm ci por locks desync"],
  ["P2", "SMELL-002", "Medium", "Errores invisibles en producción"],
  ["P2", "SEC-004", "Medium", "URL externa configurable no alineada con gobernanza"],
  ["P2", "BUG-001", "Medium", "Riesgo funcional con títulos SharePoint especiales"],
  ["P3", "SEC-001/002/003", "Low", "Higiene y privacidad local"],
  ["P3", "SMELL-001/ARCH-001/DOC-001", "Low", "Mantenibilidad/UX/docs"]
])}
`);

write("03_post_agents/post_agent_e_global_consistency_auditor.md", `# POST-AGENTE E — Auditor de coherencia global

## Coherencia final

- No hay hallazgos AppSec críticos confirmados.
- El riesgo global se clasifica como Medium/High operacional por ausencia de CI y automatización de supply chain.
- Secretos: un token local confirmado, sin evidencia de versión en Git.
- Falsos positivos explícitos: target blank protegido, innerHTML en tests, manifests JSONC, Tokens funcionales.
- No se exageran CVEs porque npm audit/SCA no se ejecutaron.

## Contradicciones resueltas

- npm ls root missing se resuelve como entorno raíz sin install, no vulnerabilidad.
- manifest parse errors se resuelven como parser incorrecto para JSONC.
- target=_blank con noreferrer no entra en el top de riesgos.

## Gaps residuales

Branch protection, runtime tenant, CSP, app catalog, CVEs, licencias y gitleaks histórico.
`);

write("04_consolidated/final_findings_matrix.md", `# Matriz consolidada de hallazgos

${mdTable(["ID","Título","Categoría","Severidad","Confianza","Estado"], finalFindings.map(f => [f.id, f.title, f.category, f.severity, f.confidence, f.state]))}
`);

write("06_backlog/remediation_backlog.md", `# Remediation backlog

${mdTable(["Prioridad","ID hallazgo","Issue","Tipo","Severidad","Archivos","Descripción","Criterios de aceptación","Tests","Esfuerzo","Dependencias"], [
  ["P1", "CI-001", "Crear workflow PR de build/test por proyecto modificado", "Hardening", "High", ".github/workflows/ci.yml", "Ejecutar validación automática", "Workflow corre en PR y falla ante build/test roto", "heft build/test", "M", "Ninguna"],
  ["P1", "QA-001", "Activar ejecución de tests y cobertura", "QA", "High", "projects/*", "212 tests deben ejecutarse en CI", "Reporte de tests y cobertura disponible", "Jest/Heft", "M", "CI-001"],
  ["P2", "SUPPLY-001", "Añadir Dependabot/SBOM/SCA", "Supply", "Medium", ".github/dependabot.yml", "Automatizar revisión de dependencias", "PRs de dependencias y SBOM artifact", "npm audit/CycloneDX en CI", "M", "CI-001"],
  ["P2", "SUPPLY-003", "Verificar/regenerar lockfiles desincronizados", "Supply", "Medium", "projects/*/package-lock.json", "Asegurar npm ci reproducible", "npm ci pasa en proyectos afectados", "npm ci --ignore-scripts", "M", "CI-001"],
  ["P2", "SEC-004", "Restringir JsonUrl en mis-accesos-recientes", "Security", "Medium", "mis-accesos-recientes", "Aplicar same-origin/allowlist", "URL externa no autorizada falla con mensaje claro", "Tests URL externa/relativa", "S", "Ninguna"],
  ["P2", "SMELL-002", "Eliminar catch silenciosos prioritarios", "Quality", "Medium", "repos/hooks/utils", "Registrar/propagar errores", "No quedan catch vacíos en rutas críticas", "Tests de fallo", "M", "Ninguna"],
  ["P2", "BUG-001", "Corregir getByTitle frágil", "Bug", "Medium", "mis-documentos-utiles; mis-tareas-y-pendientes", "Escapar listas SharePoint correctamente", "Títulos con comillas/&/# funcionan", "Unit tests endpoint", "S", "Ninguna"],
  ["P3", "SEC-002", "Normalizar window.open", "Security", "Low", "5 componentes", "Añadir noopener/noreferrer y helper", "window.opener null", "Unit test helper", "S", "Ninguna"],
  ["P3", "SEC-003", "Documentar y limitar localStorage", "Privacy", "Low", "microencuesta; pulso-del-dia", "TTL/purga/no PII directa", "README y tests storage", "Unit tests", "S", "Ninguna"],
  ["P3", "SMELL-001", "Migrar copy visible a loc", "i18n", "Low", "components/hooks", "Eliminar hardcoded strings visibles", "Claves en es-es/en-us/mystrings", "Build/localization", "L", "Ninguna"]
])}
`);

write("07_ci_hardening/ci_cd_supply_chain_hardening_plan.md", `# Plan de hardening CI/CD y supply chain

## Objetivo

Pasar de auditoría manual local a controles reproducibles en PR sin introducir permisos excesivos.

## Workflow mínimo recomendado

- GitHub Actions con permissions: contents: read.
- Detectar proyectos modificados bajo projects/*.
- Ejecutar npm ci --ignore-scripts inicialmente en proyecto modificado.
- Ejecutar npm run build del proyecto si el entorno lo permite.
- Publicar logs/test results como artefacto.

## SAST

- Semgrep en CI si la organización lo aprueba.
- CodeQL JS/TS.
- Fortify solo si ya existe licencia/configuración.

## SCA/SBOM

- npm audit controlado con umbral High/Critical y allowlist temporal.
- CycloneDX npm para SBOM por proyecto o por release.
- Dependency review si GitHub Advanced Security está disponible.

## Secret scanning

- Gitleaks en PR con baseline y reglas allowlist para *Tokens funcionales.
- GitHub secret scanning si está disponible.
- Nunca imprimir valores completos en logs.

## Trivy / IaC

- Trivy fs cuando esté instalado; Docker/IaC actualmente no aplica porque no hay ficheros detectados.

## npm hardening

- Revisar rangos flotantes; pinning para SPFx/core y paquetes críticos.
- Validar lockfile en PR.
- Evaluar cooldown/minimum release age con Renovate/Dependabot.
- Mantener lifecycleScripts vigilados; hoy están vacíos.

## Publicación SPFx

- Site collection app catalog por defecto.
- No añadir webApiPermissionRequests sin ADR/aprobación.
- Artefactos .sppkg fuera de Git salvo política explícita.

## Branch protection

- PR obligatorio, review, status checks, bloquear pushes directos a main y CODEOWNERS si hay owners por oleada/proyecto.
`);

write("08_evidence/evidence_index.md", `# Evidence index

- 05_raw_tool_outputs/local-static-scan-summary.txt
- 05_raw_tool_outputs/source-pattern-counts.json
- 05_raw_tool_outputs/source-pattern-matches.json
- 05_raw_tool_outputs/secret-scan-local-masked.json
- 05_raw_tool_outputs/env-local-tracking-status.txt
- 05_raw_tool_outputs/package-manifest-summary.json
- 05_raw_tool_outputs/dependency-aggregate-summary.json
- 05_raw_tool_outputs/lockfile-summary.json
- 05_raw_tool_outputs/architecture-quality-metrics.json
- 05_raw_tool_outputs/test-and-localization-summary.json
- 05_raw_tool_outputs/spfx-package-solution-summary.json
- 05_raw_tool_outputs/workflow-summary.json
- 05_raw_tool_outputs/iac-and-container-files.json
- 08_evidence/AGENTS.md
- 08_evidence/DESIGN.md
`);

write("09_final/executive_summary.md", `# Informe ejecutivo final

## Resumen ejecutivo

La auditoría local defensiva de doble ronda no encontró vulnerabilidades AppSec críticas confirmadas en el código SPFx. El riesgo dominante es operacional: ausencia de CI/CD versionado, tests existentes sin ejecución automática, supply chain sin SBOM/SCA/automatización y señales de deuda de observabilidad/localización.

## Nivel de riesgo global

**Medium con componente operacional High**. No apto para release sin condiciones de validación automática.

## Apto/no apto para producción

**No apto para producción sin condiciones.** Apto de forma condicionada cuando exista CI mínimo con build/test por proyecto modificado, secret scan/SCA básico y validación de lockfiles.

## Top 10 riesgos confirmados

${finalFindings.filter(f => f.state === "Confirmado" || f.state === "Sospecha razonable").slice(0, 10).map((f, i) => `${i + 1}. ${f.id} — ${f.title} (${f.severity})`).join("\n")}

## Top 10 quick wins

1. Crear workflow CI mínimo.
2. Ejecutar tests/build por proyecto modificado.
3. Añadir Dependabot/SBOM/SCA.
4. Rotar PAT Airtable local si procede.
5. Añadir noopener/noreferrer y helper de enlaces.
6. Restringir JsonUrl de mis-accesos-recientes.
7. Añadir lint no-empty catch.
8. Migrar top hardcoded strings a loc.
9. Usar parser JSONC para manifests en auditorías.
10. Verificar lockfiles con npm ci controlado.

## Herramientas ejecutadas

Git, Node scanner local, npm ls local sin install, inventario PowerShell, búsquedas locales.

## Herramientas no disponibles/no ejecutadas

Semgrep, gitleaks, trivy, cyclonedx-npm, cdxgen, dependency-check, npm audit.

## Zonas no cubiertas

Runtime SharePoint, CSP real del tenant, app catalog, branch protection, CVEs transitivos, licencias, pipelines externos.

## Recomendación siguiente

Implementar CI mínimo y repetir SCA/secret scanning en entorno autorizado antes de aceptar release.
`);

write("09_final/technical_findings.md", `# Informe técnico final consolidado

${finalFindings.map(f => `# Hallazgo ${f.id} — ${f.title}

* Severidad: ${f.severity}
* Confianza: ${f.confidence}
* Estado: ${f.state}
* Categoría: ${f.category}
* Fuente: RONDA 1 + RONDA 2 + evidencia local
* Archivos: ${f.files}
* Líneas aproximadas: ver evidencia asociada
* Evidencia: ${f.evidence}
* Explicación: ${f.title} impacta ${f.category.toLowerCase()} con el nivel de exposición descrito.
* Impacto: ${f.severity === "High" ? "Alto operacional" : f.severity === "Medium" ? "Medio" : "Bajo/Informativo"}
* Probabilidad: ${f.confidence === "High" ? "Media-Alta" : "Media"}
* Escenario seguro de fallo/explotabilidad: reproducir con datos de prueba/locales sin llamar a sistemas externos.
* Cómo validarlo: ${f.validation}
* Recomendación: ${f.recommendation}
* Tests recomendados: pruebas unitarias/CI y casos negativos del flujo afectado.
* Esfuerzo: ${f.severity === "High" ? "Medio" : "Bajo/Medio"}
* Riesgo de regresión: bajo si se añade cobertura; medio para repositorios compartidos.
* Prioridad: ${f.severity === "High" ? "P1" : f.severity === "Medium" ? "P2" : "P3"}
`).join("\n")}
`);

write("09_final/coverage_matrix.md", `# Matriz final de cobertura

${mdTable(["Área","Cubierta","Herramientas","Revisión manual","Limitaciones","Riesgo residual"], [
  ["Seguridad aplicativa", "Parcial", "Escaneo local", "Sí", "Sin Semgrep/runtime", "Medium"],
  ["Dependencias", "Parcial", "npm ls local, lockfile scan", "Sí", "Sin npm audit/CVEs", "Medium"],
  ["Secretos", "Parcial", "Heurístico local", "Sí", "Sin gitleaks histórico", "Low-Medium"],
  ["CI/CD", "Sí local", "Inventario .github", "Sí", "No branch protection", "High"],
  ["Docker", "Sí negativo", "Inventario", "Sí", "Sin Trivy", "Low"],
  ["IaC", "Sí negativo", "Inventario", "Sí", "Pipelines externos no cubiertos", "Low"],
  ["Calidad", "Parcial", "Pattern scan", "Sí", "Sin lint/build", "Medium"],
  ["Bugs", "Parcial", "Manual", "Sí", "Sin ejecución", "Medium"],
  ["Código muerto", "Parcial", "Pattern scan", "Sí", "Sin dead-code tool", "Low"],
  ["Arquitectura", "Parcial", "Métricas locales", "Sí", "Sin grafo completo", "Low-Medium"],
  ["Tests", "Parcial", "Inventario", "Sí", "No ejecutados", "High"],
  ["Documentación", "Parcial", "Inventario", "Sí", "No owner review", "Low"],
  ["Lógica de negocio", "Parcial", "Manual", "Sí", "Sin datos reales", "Medium"],
  ["Observabilidad", "Parcial", "catch scan", "Sí", "Sin runtime logs", "Medium"],
  ["Configuración", "Parcial", "package-solution scan", "Sí", "JSONC parser pendiente", "Low"],
  ["Licencias", "No", "No disponible", "No", "Sin license scanner", "Unknown"],
  ["Release readiness", "Sí", "Consolidación", "Sí", "Condicionado a CI", "High operacional"]
])}
`);

write("09_final/tools_and_commands.md", `# Herramientas y comandos

${mdTable(["Herramienta","Disponible","Comando ejecutado","Resultado","Archivo bruto","Limitaciones"], [
  ["git", "Sí", "git branch --show-current; git rev-parse HEAD; git status --short; git ls-files", "Capturado", "git-*.txt", "Solo repo local"],
  ["Node", "Sí", "node .audit/red-team/05_raw_tool_outputs/local-static-scan.mjs", "Capturado", "local-static-scan-summary.txt", "Heurístico"],
  ["npm", "Sí", "npm ls --all --json --omit=dev --ignore-scripts", "Falló por root sin node_modules/workspace link", "npm-ls-root-json.txt", "No instala ni consulta audit"],
  ["semgrep", "No", "No ejecutado", "No disponible", "tool-availability.txt", "Instalar/CI"],
  ["gitleaks", "No", "No ejecutado", "No disponible", "tool-availability.txt", "Historial no cubierto"],
  ["trivy", "No", "No ejecutado", "No disponible", "tool-availability.txt", "FS/IaC/CVEs no cubiertos"],
  ["cyclonedx/cdxgen", "No", "No ejecutado", "No disponible", "tool-availability.txt", "Sin SBOM"],
  ["npm audit", "N/A", "No ejecutado", "Evitado por consulta externa", "execution_log.md", "Requiere registry"],
  ["heft build/test", "Disponible por proyecto", "No ejecutado", "Evitado por artefactos/coste", "package-manifest-summary.json", "Debe ejecutarse en CI"]
])}

## Comandos recomendados no ejecutados

- semgrep scan --config auto --json --output .audit/red-team/05_raw_tool_outputs/semgrep.json
- gitleaks detect --source . --report-format json --report-path .audit/red-team/05_raw_tool_outputs/gitleaks.json
- trivy fs --scanners vuln,misconfig,secret,license --format json --output .audit/red-team/05_raw_tool_outputs/trivy-fs.json .
- npx @cyclonedx/cyclonedx-npm --output-file sbom.json
- npm audit --json (solo en entorno autorizado)
`);

write("09_final/release_readiness_decision.md", `# Decisión final de release readiness

1. **¿El repo está listo para producción?**  
   No sin condiciones. No hay vulnerabilidad crítica confirmada, pero falta CI/build/test/SCA automatizado.

2. **¿Qué bloquea producción?**  
   CI-001, QA-001, SUPPLY-001/SUPPLY-002/SUPPLY-003 y SMELL-002 en rutas críticas.

3. **¿Qué puede corregirse rápido?**  
   window.open, parser JSONC en auditoría, rotación PAT, Dependabot inicial, lint no-empty catch, documentación localStorage.

4. **¿Qué requiere refactor/arquitectura?**  
   Repositorios grandes, estrategia de datos/cache, localización completa y orquestación raíz de los 52 proyectos.

5. **¿Qué riesgo residual queda?**  
   Runtime SharePoint/tenant, CVEs transitivos, branch protection y permisos reales no cubiertos localmente.

6. **¿Qué checks deben entrar en CI antes del siguiente release?**  
   npm ci/build/test por proyecto modificado, secret scan, SCA/SBOM, lint, lockfile consistency y manifest JSONC validation.

7. **¿Qué debe revisarse manualmente por una persona?**  
   Alcance funcional del visualizador, tratamiento de datos localStorage, app catalog, branch protections y excepciones de dominios externos.
`);

write("README.md", `# Auditoría red-team defensiva local

## Qué se ha analizado

Repositorio completo \`paquete-webparts\`, con 52 proyectos SPFx, paquete compartido \`packages/spfx-common\`, documentación canónica, scripts, package manifests, lockfiles, configuración SPFx, patrones de código, secretos locales enmascarados, CI/CD local y evidencia de tests.

## Herramientas ejecutadas

- Git para contexto e inventario.
- Escaneo local Node/PowerShell sin red.
- npm ls local con --ignore-scripts (falló por root sin node_modules, registrado).
- Revisión manual y subagentes defensivos de RONDA 1/RONDA 2.

## Herramientas no disponibles/no ejecutadas

Semgrep, SonarScanner, Fortify, gitleaks, trivy, CycloneDX/cdxgen, Dependency-Check. npm audit no se ejecutó por requerir consulta externa al registry.

## Cómo leer los informes

- \`09_final/executive_summary.md\`: lectura principal ejecutiva.
- \`09_final/technical_findings.md\`: detalle de hallazgos finales.
- \`06_backlog/remediation_backlog.md\`: acciones listas para issues/Jira.
- \`02_round_2/round_2_delta_vs_round_1.md\`: cambios de severidad y falsos positivos.
- \`05_raw_tool_outputs/\`: evidencia bruta local, sin secretos completos.

## Informe más importante

\`09_final/executive_summary.md\` para decisión de riesgo y \`09_final/release_readiness_decision.md\` para go/no-go.

## Limitaciones

No se ejecutaron comandos destructivos, installs, restores, npm audit ni ataques externos. No se validó runtime SharePoint, CSP real, branch protection, secretos de CI, CVEs transitivos ni licencias. Los secretos detectados se enmascararon.
`);

console.log(JSON.stringify({ written: true, findings: finalFindings.length, severityCounts, confirmedCount, suspicionCount, noCoveredCount }, null, 2));