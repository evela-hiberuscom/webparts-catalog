import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const projectsDir = path.join(repoRoot, "projects");
const args = new Set(process.argv.slice(2));
const getArgValue = (name) => {
  const prefix = `${name}=`;
  const direct = process.argv.indexOf(name);
  if (direct >= 0 && process.argv[direct + 1]) {
    return process.argv[direct + 1];
  }
  const matched = process.argv.find((arg) => arg.startsWith(prefix));
  return matched ? matched.slice(prefix.length) : undefined;
};

const allProjects = fs
  .readdirSync(projectsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

function run(command, commandArgs, cwd = repoRoot) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} failed in ${cwd}`);
  }
}

function capture(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    shell: process.platform === "win32",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    return "";
  }

  return result.stdout;
}

function getChangedFiles() {
  if (args.has("--all")) {
    return ["packages/spfx-common/force-all"];
  }

  const base = getArgValue("--base") || process.env.BASE_SHA;
  const head = getArgValue("--head") || process.env.HEAD_SHA || "HEAD";
  if (base && !/^0+$/.test(base)) {
    const output = capture("git", ["diff", "--name-only", `${base}...${head}`]);
    if (output.trim()) {
      return output.split(/\r?\n/).filter(Boolean);
    }
  }

  const output = capture("git", ["diff", "--name-only", "HEAD"]);
  return output.split(/\r?\n/).filter(Boolean);
}

function selectProjects(changedFiles) {
  if (
    changedFiles.some((file) =>
      file.startsWith("packages/spfx-common/") ||
      file.startsWith("scripts/") ||
      file === "package.json" ||
      file === "package-lock.json" ||
      file.startsWith(".github/workflows/")
    )
  ) {
    return allProjects;
  }

  const selected = new Set();
  for (const file of changedFiles) {
    const match = /^projects\/([^/]+)\//.exec(file.replace(/\\/g, "/"));
    if (match && allProjects.includes(match[1])) {
      selected.add(match[1]);
    }
  }

  return Array.from(selected).sort((left, right) => left.localeCompare(right));
}

const changedFiles = getChangedFiles();
const selectedProjects = selectProjects(changedFiles);

console.log(`Changed files: ${changedFiles.length}`);
console.log(`Selected projects: ${selectedProjects.length ? selectedProjects.join(", ") : "(none)"}`);

if (args.has("--dry-run") || selectedProjects.length === 0) {
  process.exit(0);
}

const skipInstall = args.has("--skip-install");
const skipBuild = args.has("--skip-build");
const runAudit = args.has("--audit");
const runSbom = args.has("--sbom");
const sbomDir = path.join(repoRoot, "artifacts", "sbom");

if (runSbom) {
  fs.mkdirSync(sbomDir, { recursive: true });
}

for (const projectName of selectedProjects) {
  const projectDir = path.join(projectsDir, projectName);
  console.log(`\n== ${projectName} ==`);

  if (!skipInstall) {
    run("npm", ["ci", "--ignore-scripts"], projectDir);
  }

  if (runAudit) {
    run("npm", ["audit", "--audit-level=high", "--omit=dev"], projectDir);
  }

  if (runSbom) {
    run(
      "npx",
      [
        "--yes",
        "@cyclonedx/cyclonedx-npm@1.19.3",
        "--output-file",
        path.join(sbomDir, `${projectName}.cdx.json`)
      ],
      projectDir
    );
  }

  if (!skipBuild) {
    run("npm", ["run", "build", "--if-present"], projectDir);
  }
}
