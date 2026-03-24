import fs from "node:fs";
import path from "node:path";

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

function updateJson(filePath, transform) {
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const next = transform(json);
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2), "utf8");
}

const args = parseArgs(process.argv);
const slug = args.slug;
if (!slug) {
  throw new Error("Missing required argument --slug");
}

const projectRoot = path.join(process.cwd(), "projects", slug);
const packageJsonPath = path.join(projectRoot, "package.json");
const packageSolutionPath = path.join(projectRoot, "config", "package-solution.json");

if (!fs.existsSync(packageJsonPath)) {
  throw new Error(`Missing package.json for ${slug}. Scaffold the project first.`);
}

updateJson(packageJsonPath, (packageJson) => {
  packageJson.dependencies ??= {};
  packageJson.dependencies["@paquete/spfx-common"] = "file:../../packages/spfx-common";
  packageJson.scripts ??= {};
  packageJson.scripts.build = "heft build --clean --production && heft test --production && heft package-solution --production";
  return packageJson;
});

if (fs.existsSync(packageSolutionPath)) {
  updateJson(packageSolutionPath, (packageSolutionJson) => {
    packageSolutionJson.solution ??= {};
    packageSolutionJson.solution.skipFeatureDeployment = false;
    return packageSolutionJson;
  });
}

const intelligenceDir = path.join(projectRoot, "project-intelligence");
fs.mkdirSync(intelligenceDir, { recursive: true });
fs.writeFileSync(
  path.join(intelligenceDir, "preparation-log.md"),
  [
    "# Preparation Log",
    "",
    `- Project: ${slug}`,
    "- Added local dependency: `@paquete/spfx-common`",
    "- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`",
    "- Forced `skipFeatureDeployment=false` in `config/package-solution.json` when present"
  ].join("\n"),
  "utf8"
);

console.log(`Prepared SPFx defaults for ${slug}`);
