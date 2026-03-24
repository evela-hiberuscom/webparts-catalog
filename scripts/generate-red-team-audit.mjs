import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const orchestrationDir = path.join(rootDir, "orchestration");
const generatedDir = path.join(orchestrationDir, "generated");
const progressBoardPath = path.join(generatedDir, "project-progress.json");
const issueRegistryPath = path.join(orchestrationDir, "issue-registry.json");

fs.mkdirSync(generatedDir, { recursive: true });

if (!fs.existsSync(progressBoardPath)) {
  throw new Error("Missing orchestration/generated/project-progress.json. Run npm run progress:board first.");
}

const progressBoard = JSON.parse(fs.readFileSync(progressBoardPath, "utf8"));
const issueRegistry = fs.existsSync(issueRegistryPath)
  ? JSON.parse(fs.readFileSync(issueRegistryPath, "utf8"))
  : { entries: [] };
const generatedAt = new Date().toISOString();

const packagedProjects = progressBoard.items.filter((item) => item.progressStatus === "packaged");
const sharedOpenIssues = issueRegistry.entries.filter((entry) => entry.status === "open");

const ignoredDirectories = new Set([
  "node_modules",
  "lib",
  "lib-commonjs",
  "dist",
  "temp",
  "coverage",
  "jest-output",
  "release",
  "sharepoint",
  "project-intelligence",
  "design",
  "provisioning",
  ".git",
  ".rush"
]);

const businessCodeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt"]);

function readJsonIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}

function walkFiles(startDir) {
  const files = [];

  function visit(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }

      files.push(fullPath);
    }
  }

  if (fs.existsSync(startDir)) {
    visit(startDir);
  }

  return files;
}

function normalizeRelative(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function isTestFile(filePath) {
  return /\.(test|spec)\.[jt]sx?$/.test(filePath) || filePath.includes(`${path.sep}__tests__${path.sep}`);
}

function findMatches(files, pattern, options = {}) {
  const {
    includeTests = false,
    extensions = businessCodeExtensions
  } = options;
  const matches = [];

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    if (!extensions.has(extension)) {
      continue;
    }

    if (!includeTests && isTestFile(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    if (!pattern.test(content)) {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      if (pattern.test(lines[index])) {
        matches.push(`${normalizeRelative(filePath)}:${index + 1}`);
        if (matches.length >= 5) {
          return matches;
        }
      }
    }
  }

  return matches;
}

function supportsPattern(files, pattern, options = {}) {
  return findMatches(files, pattern, options).length > 0;
}

function createFinding(id, severity, area, title, rationale, evidence, recommendation) {
  return {
    id,
    severity,
    area,
    title,
    rationale,
    evidence,
    recommendation
  };
}

function buildProjectFindings(project, files) {
  const findings = [];
  const packageSolutionPath = path.join(project.projectDir, "config", "package-solution.json");
  const packageSolution = readJsonIfExists(packageSolutionPath);
  const solution = packageSolution?.solution;

  const hasDangerousHtml = findMatches(files, /dangerouslySetInnerHTML/g);
  const hasIframe = findMatches(files, /<iframe\b|\biframe\b/g);
  const hasWindowOpen = findMatches(files, /window\.open\(/g);
  const hasLocalStorage = findMatches(files, /\blocalStorage\b|\bsessionStorage\b/g);
  const hasTodos = findMatches(files, /\bTODO\b|\bFIXME\b/g, { includeTests: true, extensions: textExtensions });
  const usesJsonUrl = findMatches(files, /\bJsonUrl\b/g);
  const usesApiEndpoint = findMatches(files, /\bApiEndpoint\b/g);
  const usesListApi = findMatches(files, /GetList\(@listUrl\)|getbytitle\('/g);

  if (hasDangerousHtml.length > 0) {
    findings.push(
      createFinding(
        "html-sink",
        "high",
        "security",
        "Eliminar sinks HTML inseguros o encapsular sanitizacion estricta",
        "Un render HTML directo es un punto de entrada clásico para XSS persistente o reflejado en SharePoint.",
        hasDangerousHtml,
        "Sustituir el render HTML por composición segura o introducir sanitización fuerte con tests negativos."
      )
    );
  }

  if (hasIframe.length > 0) {
    findings.push(
      createFinding(
        "iframe-surface",
        "high",
        "security",
        "Revisar iframes o referencias embebidas antes de producción",
        "Los iframes elevan la superficie de CSP, clickjacking y dependencia externa; no deben quedar sin revisión explícita.",
        hasIframe,
        "Verificar origen, necesidad real y compatibilidad CSP; si no es imprescindible, retirarlo."
      )
    );
  }

  if (hasWindowOpen.length > 0) {
    findings.push(
      createFinding(
        "window-open",
        "medium",
        "security",
        "Reemplazar `window.open` por enlaces seguros tipados",
        "Abrir ventanas nuevas sin pasar por la utilidad compartida facilita inconsistencias de `noopener/noreferrer` y gobierno de navegación.",
        hasWindowOpen,
        "Normalizar aperturas externas con `createSafeExternalLink` o el wrapper de navegación compartido."
      )
    );
  }

  if (solution?.skipFeatureDeployment === true) {
    findings.push(
      createFinding(
        "tenant-wide",
        "high",
        "governance",
        "Evitar `skipFeatureDeployment=true` salvo aprobación explícita",
        "El despliegue tenant-wide aumenta el radio de impacto y contradice el default del repositorio.",
        [normalizeRelative(packageSolutionPath)],
        "Fijar `skipFeatureDeployment=false` o documentar excepción de gobernanza aprobada."
      )
    );
  }

  if (Array.isArray(solution?.webApiPermissionRequests) && solution.webApiPermissionRequests.length > 0) {
    findings.push(
      createFinding(
        "api-permissions",
        "high",
        "permissions",
        "Revisar y justificar permisos API declarados",
        "Los permisos extra elevan el riesgo de sobreprivilegio y requieren trazabilidad formal.",
        [normalizeRelative(packageSolutionPath)],
        "Reducir a mínimo privilegio o documentar por qué cada permiso es imprescindible."
      )
    );
  }

  if (project.nestedScaffoldExists) {
    findings.push(
      createFinding(
        "nested-scaffold",
        "medium",
        "hygiene",
        "Eliminar el scaffold anidado residual del proyecto",
        "La carpeta duplicada induce drift entre artefactos, complica scripts y aumenta la probabilidad de editar el árbol equivocado.",
        [project.projectDir.replace(/\\/g, "/")],
        "Mover o borrar el árbol anidado y dejar un único root canónico por solución."
      )
    );
  }

  if (project.enrichmentStatus !== "sufficient") {
    findings.push(
      createFinding(
        "spec-debt",
        "medium",
        "spec",
        "Cerrar la deuda de especificación inferida antes del despliegue real",
        "El proyecto sigue apoyándose en inferencias y puede desviarse del esquema o las reglas de negocio del tenant final.",
        [
          `orchestration/generated/project-progress.json#${project.slug}`,
          `projects/${project.slug}/project-intelligence/project-intelligence.md`
        ],
        "Validar con datos reales nombres de campos, estados y edge cases que hoy están deducidos."
      )
    );
  }

  if (hasLocalStorage.length > 0) {
    findings.push(
      createFinding(
        "client-storage",
        "medium",
        "tampering",
        "Endurecer el uso de almacenamiento local y documentar su rol exacto",
        "localStorage/sessionStorage es manipulable por el usuario y no puede actuar como fuente de verdad ni control de seguridad.",
        hasLocalStorage,
        "Limitarlo a UX/cache, añadir expiración/invalidación clara y cubrir escenarios de manipulación o limpieza."
      )
    );
  }

  if (usesJsonUrl.length > 0 || usesApiEndpoint.length > 0) {
    findings.push(
      createFinding(
        "endpoint-hardening",
        "medium",
        "input-validation",
        "Añadir validación temprana de endpoints configurables y smoke tests negativos",
        "Aunque la lógica runtime ya restringe hosts, un admin puede dejar configuraciones inválidas que solo fallan en ejecución.",
        [...usesJsonUrl, ...usesApiEndpoint].slice(0, 5),
        "Bloquear valores inválidos en property pane/configuración y añadir pruebas de misconfiguración same-origin."
      )
    );
  }

  if (usesListApi.length > 0) {
    findings.push(
      createFinding(
        "tenant-scale",
        "medium",
        "resilience",
        "Ejecutar prueba adversarial en listas grandes e indexadas del tenant real",
        "La auditoría local no demuestra comportamiento bajo throttling, listas >5k ni esquemas reales de SharePoint pegados desde URLs de vista.",
        usesListApi,
        "Validar en tenant con listas indexadas, view URLs reales y volúmenes cercanos a producción; registrar tiempos y fallos."
      )
    );
  }

  if (hasTodos.length > 0) {
    findings.push(
      createFinding(
        "todo-debt",
        "low",
        "maintenance",
        "Resolver TODO/FIXME residuales antes de tratar la solución como cerrada",
        "La deuda silenciosa tiende a reabrirse en olas posteriores y oculta decisiones no cerradas.",
        hasTodos,
        "Convertir cada TODO en issue explícita o resolverlo antes de seguir."
      )
    );
  }

  if (findings.length === 0) {
    findings.push(
      createFinding(
        "no-static-blockers",
        "low",
        "hardening",
        "Sin bloqueos estáticos nuevos; mantener una pasada de humo en tenant",
        "La auditoría estática no encontró sinks o configuraciones peligrosas adicionales, pero sigue faltando validación en entorno real.",
        [project.projectDir.replace(/\\/g, "/")],
        "Ejecutar smoke test funcional con datos reales antes de promoción final."
      )
    );
  }

  return findings;
}

const projectAudits = packagedProjects.map((project) => {
  const files = walkFiles(project.projectDir);
  const findings = buildProjectFindings(project, files);
  const highestSeverity =
    findings.some((finding) => finding.severity === "high") ? "high" :
    findings.some((finding) => finding.severity === "medium") ? "medium" :
    "low";

  return {
    rowId: project.rowId,
    name: project.name,
    slug: project.slug,
    waveNumber: project.waveNumber,
    archetype: project.archetype,
    enrichmentStatus: project.enrichmentStatus,
    highestSeverity,
    packagedArtifactCount: project.sppkgFiles.length,
    pendingCorrections: findings
  };
});

const sharedPendingCorrections = [];

const fluentIssue = sharedOpenIssues.find((entry) => entry.id === "ISSUE-016");
if (fluentIssue) {
  sharedPendingCorrections.push({
    id: fluentIssue.id,
    severity: "low",
    title: "Reducir ruido de warnings de iconos Fluent UI en tests",
    rationale: fluentIssue.summary,
    recommendation: fluentIssue.mitigation
  });
}

const payload = {
  generatedAt,
  auditStyle: "red-team-adversarial-static-backlog",
  packagedProjects: packagedProjects.length,
  sharedPendingCorrections,
  projects: projectAudits
};

const mdLines = [
  "# Red Team Audit Backlog",
  "",
  `- Generated: ${generatedAt}`,
  `- Scope: ${packagedProjects.length} packaged SPFx projects`,
  `- Audit style: adversarial static review with pending-correction backlog`,
  "",
  "## Shared Pending Corrections",
  ""
];

if (sharedPendingCorrections.length === 0) {
  mdLines.push("- No shared open corrections were detected in the central issue registry.", "");
} else {
  for (const correction of sharedPendingCorrections) {
    mdLines.push(`- [${correction.severity}] ${correction.id}: ${correction.title}`);
    mdLines.push(`  - rationale: ${correction.rationale}`);
    mdLines.push(`  - recommendation: ${correction.recommendation}`);
  }
  mdLines.push("");
}

mdLines.push("## Per Project Backlog", "");

for (const project of projectAudits) {
  mdLines.push(`### Wave ${project.waveNumber} · ${project.name}`);
  mdLines.push(`- slug: \`${project.slug}\``);
  mdLines.push(`- highest severity: \`${project.highestSeverity}\``);
  mdLines.push(`- enrichment status: \`${project.enrichmentStatus}\``);
  for (const finding of project.pendingCorrections) {
    mdLines.push(`- [${finding.severity}] ${finding.title}`);
    mdLines.push(`  - area: ${finding.area}`);
    mdLines.push(`  - rationale: ${finding.rationale}`);
    mdLines.push(`  - evidence: ${finding.evidence.join(", ")}`);
    mdLines.push(`  - recommendation: ${finding.recommendation}`);
  }
  mdLines.push("");
}

fs.writeFileSync(path.join(generatedDir, "red-team-audit-2026-03-24.json"), JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(path.join(generatedDir, "red-team-audit-2026-03-24.md"), mdLines.join("\n"), "utf8");

console.log(`Red-team audit backlog generated for ${packagedProjects.length} packaged projects.`);
