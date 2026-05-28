import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const projectsDir = path.join(repoRoot, "projects");
const shouldFix = process.argv.includes("--fix");
const dependencySections = ["dependencies", "devDependencies", "optionalDependencies"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function listProjects() {
  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function lockNodeKey(packageName) {
  return `node_modules/${packageName}`;
}

function pinProject(projectName) {
  const projectDir = path.join(projectsDir, projectName);
  const packagePath = path.join(projectDir, "package.json");
  const lockfilePath = path.join(projectDir, "package-lock.json");
  if (!fs.existsSync(packagePath) || !fs.existsSync(lockfilePath)) {
    return [];
  }

  const packageJson = readJson(packagePath);
  const lockfile = readJson(lockfilePath);
  const rootLockPackage = lockfile.packages?.[""] ?? {};
  const findings = [];
  let changed = false;

  for (const section of dependencySections) {
    const dependencies = packageJson[section];
    if (!dependencies) {
      continue;
    }

    for (const [packageName, versionSpec] of Object.entries(dependencies)) {
      if (typeof versionSpec !== "string" || !/^[~^]/.test(versionSpec)) {
        continue;
      }

      const lockedVersion = lockfile.packages?.[lockNodeKey(packageName)]?.version;
      if (typeof lockedVersion !== "string" || !lockedVersion) {
        findings.push(`${projectName}: ${section}.${packageName} uses ${versionSpec} and has no locked version`);
        continue;
      }

      findings.push(`${projectName}: ${section}.${packageName} ${versionSpec} -> ${lockedVersion}`);
      if (shouldFix) {
        dependencies[packageName] = lockedVersion;
        if (rootLockPackage[section]?.[packageName]) {
          rootLockPackage[section][packageName] = lockedVersion;
        }
        changed = true;
      }
    }
  }

  if (changed) {
    lockfile.packages[""] = rootLockPackage;
    writeJson(packagePath, packageJson);
    writeJson(lockfilePath, lockfile);
  }

  return findings;
}

const findings = listProjects().flatMap(pinProject);

if (findings.length > 0) {
  const action = shouldFix ? "Pinned" : "Found";
  console.error(`${action} ${findings.length} floating project dependency range(s):`);
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }

  if (!shouldFix) {
    process.exitCode = 1;
  }
} else {
  console.log("Project dependency ranges are pinned.");
}
