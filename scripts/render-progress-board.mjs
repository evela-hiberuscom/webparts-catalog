import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const orchestrationDir = path.join(rootDir, "orchestration");
const generatedDir = path.join(orchestrationDir, "generated");
const catalogPath = path.join(orchestrationDir, "project-work-items.json");

fs.mkdirSync(generatedDir, { recursive: true });

if (!fs.existsSync(catalogPath)) {
  throw new Error("Missing orchestration/project-work-items.json. Run sync:airtable first.");
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const generatedAt = new Date().toISOString();

function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

function getFirstExistingFile(paths) {
  return paths.find((candidate) => pathExists(candidate));
}

function listSppkgFiles(projectDir) {
  const solutionDir = path.join(projectDir, "sharepoint", "solution");
  if (!pathExists(solutionDir)) {
    return [];
  }

  return fs
    .readdirSync(solutionDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sppkg"))
    .map((entry) => path.join(solutionDir, entry.name));
}

function classifyProject(projectDir, slug) {
  const nestedDir = path.join(projectDir, slug);
  const hasRoot = pathExists(projectDir);
  const hasPackageJson = pathExists(path.join(projectDir, "package.json"));
  const hasSrc = pathExists(path.join(projectDir, "src"));
  const hasConfig = pathExists(path.join(projectDir, "config"));
  const hasNodeModules = pathExists(path.join(projectDir, "node_modules"));
  const hasProjectIntel = Boolean(
    getFirstExistingFile([
      path.join(projectDir, "project-intelligence", "project-intelligence.md"),
      path.join(projectDir, "project-intelligence", "preparation-log.md")
    ])
  );
  const hasDesign = Boolean(
    getFirstExistingFile([
      path.join(projectDir, "design", "mockup-spec.md"),
      path.join(projectDir, "design", "design-reference.json")
    ])
  );
  const hasProvisioning = pathExists(path.join(projectDir, "provisioning", "provisioning-definition.json"));
  const sppkgFiles = listSppkgFiles(projectDir);

  let status = "not_started";
  if (sppkgFiles.length > 0) {
    status = "packaged";
  } else if (hasPackageJson && hasSrc && hasConfig) {
    status = "in_progress";
  } else if (hasProjectIntel || hasDesign || hasProvisioning || hasRoot) {
    status = "prepared";
  }

  const completionRank =
    status === "packaged" ? 3 :
    status === "in_progress" ? 2 :
    status === "prepared" ? 1 :
    0;

  return {
    status,
    completionRank,
    hasRoot,
    hasPackageJson,
    hasSrc,
    hasConfig,
    hasNodeModules,
    hasProjectIntel,
    hasDesign,
    hasProvisioning,
    nestedScaffoldExists: pathExists(nestedDir),
    sppkgFiles
  };
}

const items = catalog.items.map((item) => {
  const projectDir = path.join(rootDir, "projects", item.slug);
  const runtime = classifyProject(projectDir, item.slug);

  return {
    rowId: item.rowId,
    name: item.name,
    slug: item.slug,
    waveNumber: item.waveNumber,
    archetype: item.archetype,
    enrichmentStatus: item.enrichmentStatus,
    progressStatus: runtime.status,
    completionRank: runtime.completionRank,
    nestedScaffoldExists: runtime.nestedScaffoldExists,
    projectDir,
    hasPackageJson: runtime.hasPackageJson,
    hasSrc: runtime.hasSrc,
    hasConfig: runtime.hasConfig,
    hasNodeModules: runtime.hasNodeModules,
    hasProjectIntel: runtime.hasProjectIntel,
    hasDesign: runtime.hasDesign,
    hasProvisioning: runtime.hasProvisioning,
    sppkgFiles: runtime.sppkgFiles
  };
});

const waveMap = new Map();
for (const item of items) {
  const existing = waveMap.get(item.waveNumber) ?? {
    waveNumber: item.waveNumber,
    total: 0,
    packaged: 0,
    in_progress: 0,
    prepared: 0,
    not_started: 0,
    remaining: 0,
    slugs: []
  };

  existing.total += 1;
  existing[item.progressStatus] += 1;
  if (item.progressStatus !== "packaged") {
    existing.remaining += 1;
  }

  existing.slugs.push(item.slug);
  waveMap.set(item.waveNumber, existing);
}

const waveSummary = [...waveMap.values()].sort((left, right) => left.waveNumber - right.waveNumber);
const completedProjects = items.filter((item) => item.progressStatus === "packaged").length;
const remainingProjects = items.length - completedProjects;
const currentWave =
  waveSummary.find((wave) => wave.remaining > 0)?.waveNumber ??
  waveSummary[waveSummary.length - 1]?.waveNumber ??
  null;

const payload = {
  generatedAt,
  totalProjects: items.length,
  completedProjects,
  remainingProjects,
  currentWave,
  statuses: {
    packaged: items.filter((item) => item.progressStatus === "packaged").length,
    in_progress: items.filter((item) => item.progressStatus === "in_progress").length,
    prepared: items.filter((item) => item.progressStatus === "prepared").length,
    not_started: items.filter((item) => item.progressStatus === "not_started").length
  },
  waves: waveSummary,
  items: items.sort((left, right) => {
    if (left.waveNumber !== right.waveNumber) {
      return left.waveNumber - right.waveNumber;
    }

    if (right.completionRank !== left.completionRank) {
      return right.completionRank - left.completionRank;
    }

    return left.slug.localeCompare(right.slug);
  })
};

const mdLines = [
  "# Project Progress Board",
  "",
  `- Generated: ${generatedAt}`,
  `- Total projects: ${payload.totalProjects}`,
  `- Completed (packaged): ${payload.completedProjects}`,
  `- Remaining: ${payload.remainingProjects}`,
  `- Current wave: ${payload.currentWave ?? "n/a"}`,
  "",
  "## Wave Summary",
  "",
  "| Wave | Total | Packaged | In Progress | Prepared | Not Started | Remaining |",
  "|---|---|---|---|---|---|---|",
  ...waveSummary.map(
    (wave) =>
      `| ${wave.waveNumber} | ${wave.total} | ${wave.packaged} | ${wave.in_progress} | ${wave.prepared} | ${wave.not_started} | ${wave.remaining} |`
  ),
  "",
  "## Projects",
  "",
  "| Wave | Project | Slug | Status | Enrichment | Nested Scaffold | Package |",
  "|---|---|---|---|---|---|---|",
  ...payload.items.map((item) => {
    const packageLabel = item.sppkgFiles.length > 0 ? "yes" : "no";
    return `| ${item.waveNumber} | ${item.name} | ${item.slug} | ${item.progressStatus} | ${item.enrichmentStatus} | ${item.nestedScaffoldExists ? "yes" : "no"} | ${packageLabel} |`;
  }),
  ""
];

fs.writeFileSync(path.join(generatedDir, "project-progress.json"), JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(path.join(generatedDir, "project-progress.md"), mdLines.join("\n"), "utf8");

console.log(`Progress board generated: ${completedProjects}/${items.length} packaged.`);
