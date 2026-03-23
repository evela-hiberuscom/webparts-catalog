import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, "");
    const value = argv[index + 1];
    if (key) {
      args[key] = value;
    }
  }
  return args;
}

function toPascalCase(value) {
  return value
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
    .join("");
}

function quotePowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function moveDirectoryContents(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.renameSync(sourcePath, targetPath);
        continue;
      }

      moveDirectoryContents(sourcePath, targetPath);
      if (fs.existsSync(sourcePath) && fs.readdirSync(sourcePath).length === 0) {
        fs.rmdirSync(sourcePath);
      }
      continue;
    }

    fs.renameSync(sourcePath, targetPath);
  }
}

const args = parseArgs(process.argv);
const slug = args.slug;
if (!slug) {
  throw new Error("Missing required argument --slug");
}

const projectRoot = path.join(process.cwd(), "projects", slug);
const rowSourcePath = path.join(projectRoot, "project-intelligence", "row-source.json");
if (!fs.existsSync(rowSourcePath)) {
  throw new Error(`Missing row source for ${slug}: ${rowSourcePath}`);
}

const rowSource = JSON.parse(fs.readFileSync(rowSourcePath, "utf8"));
const componentName = args.componentName ?? toPascalCase(rowSource.sourceJsons.specsJson?.meta?.id ?? slug);
const solutionName = args.solutionName ?? slug;
const description = args.description ?? rowSource.sourceJsons.specsJson?.summary?.oneLiner ?? rowSource.name;
const commandArgs = [
  "@microsoft/sharepoint",
  "--solution-name",
  solutionName,
  "--component-type",
  "webpart",
  "--component-name",
  componentName,
  "--component-description",
  description,
  "--framework",
  "react",
  "--environment",
  "spo",
  "--package-manager",
  "npm"
];

const result =
  process.platform === "win32"
    ? spawnSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `& yo ${commandArgs.map(quotePowerShell).join(" ")}`
        ],
        {
          cwd: projectRoot,
          stdio: "inherit",
          shell: false
        }
      )
    : spawnSync("yo", commandArgs, {
        cwd: projectRoot,
        stdio: "inherit",
        shell: false
      });

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  throw new Error(`SPFx scaffold failed for ${slug} with exit code ${result.status}`);
}

const nestedSolutionPath = path.join(projectRoot, solutionName);
if (fs.existsSync(nestedSolutionPath) && fs.statSync(nestedSolutionPath).isDirectory()) {
  moveDirectoryContents(nestedSolutionPath, projectRoot);
  fs.rmdirSync(nestedSolutionPath, { recursive: true });
}

console.log(`SPFx scaffold complete for ${slug}`);
