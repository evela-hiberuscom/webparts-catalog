import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const projectsDir = path.join(repoRoot, "projects");
const commonPackagePath = path.join(repoRoot, "packages", "spfx-common", "package.json");
const commonPackage = JSON.parse(fs.readFileSync(commonPackagePath, "utf8"));
const shouldFix = process.argv.includes("--fix");
const commonSpec = "file:../../packages/spfx-common";
const commonPackageKey = "../../packages/spfx-common";
const commonNodeModuleKey = "node_modules/@paquete/spfx-common";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function listProjects() {
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function ensureLockfileEntry(projectName) {
  const projectDir = path.join(projectsDir, projectName);
  const packagePath = path.join(projectDir, "package.json");
  const lockfilePath = path.join(projectDir, "package-lock.json");
  if (!fs.existsSync(packagePath) || !fs.existsSync(lockfilePath)) {
    return [];
  }

  const packageJson = readJson(packagePath);
  const usesCommon =
    packageJson.dependencies?.["@paquete/spfx-common"] === commonSpec ||
    packageJson.devDependencies?.["@paquete/spfx-common"] === commonSpec;
  if (!usesCommon) {
    return [];
  }

  const lockfile = readJson(lockfilePath);
  lockfile.packages = lockfile.packages ?? {};
  const rootPackage = lockfile.packages[""] ?? {};
  rootPackage.dependencies = rootPackage.dependencies ?? {};

  const changed = [];
  if (rootPackage.dependencies["@paquete/spfx-common"] !== commonSpec) {
    rootPackage.dependencies["@paquete/spfx-common"] = commonSpec;
    changed.push("root dependency");
  }

  const expectedCommonPackage = {
    name: commonPackage.name,
    version: commonPackage.version
  };
  if (JSON.stringify(lockfile.packages[commonPackageKey]) !== JSON.stringify(expectedCommonPackage)) {
    lockfile.packages[commonPackageKey] = expectedCommonPackage;
    changed.push(commonPackageKey);
  }

  const expectedLink = {
    resolved: "../../packages/spfx-common",
    link: true
  };
  if (JSON.stringify(lockfile.packages[commonNodeModuleKey]) !== JSON.stringify(expectedLink)) {
    lockfile.packages[commonNodeModuleKey] = expectedLink;
    changed.push(commonNodeModuleKey);
  }

  lockfile.packages[""] = rootPackage;

  if (changed.length > 0 && shouldFix) {
    writeJson(lockfilePath, lockfile);
  }

  return changed.map((change) => `${projectName}: ${change}`);
}

const findings = listProjects().flatMap(ensureLockfileEntry);

if (findings.length > 0) {
  const action = shouldFix ? "Fixed" : "Found";
  console.error(`${action} ${findings.length} @paquete/spfx-common lockfile inconsistency item(s):`);
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }

  if (!shouldFix) {
    process.exitCode = 1;
  }
} else {
  console.log("@paquete/spfx-common lockfile entries are consistent.");
}
