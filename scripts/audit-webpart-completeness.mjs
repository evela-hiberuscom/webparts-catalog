import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const projectsDir = path.join(repoRoot, "projects");
const generatedDir = path.join(repoRoot, "orchestration", "generated");
const progressPath = path.join(generatedDir, "project-progress.json");
const runtimeTrackerPath = path.join(repoRoot, "orchestration", "runtime-tracker.json");

fs.mkdirSync(generatedDir, { recursive: true });

const progress = fs.existsSync(progressPath)
  ? JSON.parse(fs.readFileSync(progressPath, "utf8"))
  : { items: [] };
const runtimeTracker = fs.existsSync(runtimeTrackerPath)
  ? JSON.parse(fs.readFileSync(runtimeTrackerPath, "utf8"))
  : { projects: [] };
const trackerBySlug = new Map((runtimeTracker.projects ?? []).map((project) => [project.slug, project]));
const progressBySlug = new Map((progress.items ?? []).map((item) => [item.slug, item]));

function listFiles(dirPath, predicate = () => true) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const output = [];
  const stack = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (predicate(fullPath, entry)) {
        output.push(fullPath);
      }
    }
  }
  return output;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function countFiles(root, relativeDir, extensions) {
  return listFiles(path.join(root, relativeDir), (filePath) =>
    extensions.some((extension) => filePath.endsWith(extension))
  ).length;
}

function detectScaffoldResidual(componentFiles) {
  const markers = ["Welcome to SharePoint Framework", "Well done,"];
  return componentFiles.some((filePath) => {
    const content = readText(filePath);
    return markers.some((marker) => content.includes(marker));
  });
}

function classifyWebPart(projectName) {
  const webpartsRoot = path.join(projectsDir, projectName, "src", "webparts");
  if (!fs.existsSync(webpartsRoot)) {
    return [];
  }

  return fs
    .readdirSync(webpartsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const webpartRoot = path.join(webpartsRoot, entry.name);
      const componentFiles = listFiles(path.join(webpartRoot, "components"), (filePath) =>
        filePath.endsWith(".ts") || filePath.endsWith(".tsx")
      );
      const componentCount = componentFiles.length;
      const hooksCount = countFiles(webpartRoot, "hooks", [".ts", ".tsx"]);
      const servicesCount = countFiles(webpartRoot, "services", [".ts", ".tsx"]);
      const repositoriesCount = countFiles(webpartRoot, "repositories", [".ts", ".tsx"]);
      const testsCount = listFiles(webpartRoot, (filePath) =>
        filePath.endsWith(".test.ts") || filePath.endsWith(".test.tsx")
      ).length;
      const scaffoldResidual = detectScaffoldResidual(componentFiles);
      const missingLayers = [];

      if (hooksCount === 0) missingLayers.push("hooks");
      if (servicesCount === 0) missingLayers.push("services");
      if (repositoriesCount === 0) missingLayers.push("repositories");
      if (testsCount === 0) missingLayers.push("tests");

      let status = "healthy";
      if (scaffoldResidual) {
        status = "scaffold_residual";
      } else if (missingLayers.length > 0) {
        status = "architecture_gap";
      }

      return {
        project: projectName,
        webpart: entry.name,
        status,
        scaffoldResidual,
        componentCount,
        hooksCount,
        servicesCount,
        repositoriesCount,
        testsCount,
        missingLayers
      };
    });
}

const projectNames = fs
  .readdirSync(projectsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const findings = projectNames.flatMap(classifyWebPart).map((finding) => {
  const tracker = trackerBySlug.get(finding.project);
  const progressItem = progressBySlug.get(finding.project);
  return {
    ...finding,
    progressStatus: progressItem?.progressStatus ?? "unknown",
    packaged: progressItem?.physicalStatus === "packaged",
    auditDone: tracker?.gates?.audit === "done",
    trackerPhase: tracker?.phase ?? null
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  totalWebParts: findings.length,
  scaffoldResidual: findings.filter((finding) => finding.scaffoldResidual).length,
  architectureGap: findings.filter((finding) => finding.status === "architecture_gap").length,
  missingTests: findings.filter((finding) => finding.testsCount === 0).length,
  auditPending: findings.filter((finding) => !finding.auditDone).length
};

const markdown = [
  "# WebPart Completeness Audit",
  "",
  `- Generated: ${summary.generatedAt}`,
  `- Total web parts audited: ${summary.totalWebParts}`,
  `- Scaffold residual: ${summary.scaffoldResidual}`,
  `- Architecture gap: ${summary.architectureGap}`,
  `- Missing tests: ${summary.missingTests}`,
  `- Audit pending: ${summary.auditPending}`,
  "",
  "| Project | WebPart | Status | Components | Hooks | Services | Repositories | Tests | Packaged | Audit Done | Missing Layers |",
  "|---|---|---|---|---|---|---|---|---|---|---|",
  ...findings.map((finding) =>
    `| ${finding.project} | ${finding.webpart} | ${finding.status} | ${finding.componentCount} | ${finding.hooksCount} | ${finding.servicesCount} | ${finding.repositoriesCount} | ${finding.testsCount} | ${finding.packaged ? "yes" : "no"} | ${finding.auditDone ? "yes" : "no"} | ${finding.missingLayers.join(", ") || "-"} |`
  ),
  ""
];

fs.writeFileSync(
  path.join(generatedDir, "webpart-completeness-audit.json"),
  JSON.stringify({ summary, findings }, null, 2),
  "utf8"
);
fs.writeFileSync(path.join(generatedDir, "webpart-completeness-audit.md"), markdown.join("\n"), "utf8");

console.log(
  `WebPart completeness audit generated: ${summary.totalWebParts} web parts, ${summary.scaffoldResidual} scaffold residual, ${summary.architectureGap} architecture gaps.`
);
