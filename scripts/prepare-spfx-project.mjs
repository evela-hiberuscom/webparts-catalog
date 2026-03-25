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

/**
 * Inject ErrorBoundaryTitle and ErrorBoundaryMessage into a loc .js AMD module
 * if they are not already present. Automatically adds a trailing comma to the
 * last existing key so the object remains syntactically valid.
 */
function injectErrorBoundaryKeysIntoLocJs(filePath, titleValue, messageValue) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes("ErrorBoundaryTitle")) return; // already present

  // Add trailing comma to the last property before the closing `}` of the return object.
  // Matches the last non-empty line before `  };` that ends with a quote, paren, or bracket.
  content = content.replace(
    /([^\s,{])([ \t]*\n[ \t]*};)/,
    `$1,\n    ErrorBoundaryTitle: ${JSON.stringify(titleValue)},\n    ErrorBoundaryMessage: ${JSON.stringify(messageValue)}\n  };`
  );

  // If the simple replacement didn't fire (edge case), do a safe append before `};`
  if (!content.includes("ErrorBoundaryTitle")) {
    content = content.replace(
      /(\n[ \t]*};[ \t]*\n\}\);)/,
      `,\n    ErrorBoundaryTitle: ${JSON.stringify(titleValue)},\n    ErrorBoundaryMessage: ${JSON.stringify(messageValue)}\n  };\n});`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * Inject ErrorBoundaryTitle and ErrorBoundaryMessage into a mystrings.d.ts
 * interface declaration if they are not already present.
 */
function injectErrorBoundaryKeysIntoStringsInterface(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes("ErrorBoundaryTitle")) return;

  content = content.replace(
    /(\n\}[ \t]*\n\/\* tslint)/,
    `\n  ErrorBoundaryTitle: string;\n  ErrorBoundaryMessage: string;\n}\n/* tslint`
  );
  // Fallback: last `}` in the interface block
  if (!content.includes("ErrorBoundaryTitle")) {
    content = content.replace(
      /(\n\}[ \t]*$)/m,
      `\n  ErrorBoundaryTitle: string;\n  ErrorBoundaryMessage: string;\n}`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
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

// Inject ErrorBoundary loc keys into all loc files found under src/
// This avoids the recurring SyntaxError caused by a missing comma when
// the agent manually appends keys to a Yeoman-generated AMD module.
const srcLocDir = path.join(projectRoot, "src");
const locInjected = [];
if (fs.existsSync(srcLocDir)) {
  const findLocFiles = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findLocFiles(fullPath);
      } else if (entry.name === "es-es.js" && dir.endsWith("loc")) {
        injectErrorBoundaryKeysIntoLocJs(fullPath, "Se ha producido un error inesperado", "Este web part ha encontrado un error no esperado. Recarga la página o contacta con el administrador.");
        locInjected.push(fullPath);
      } else if (entry.name === "en-us.js" && dir.endsWith("loc")) {
        injectErrorBoundaryKeysIntoLocJs(fullPath, "Something went wrong", "This web part encountered an unexpected error. Please reload the page or contact your administrator.");
        locInjected.push(fullPath);
      } else if (entry.name === "mystrings.d.ts" && dir.endsWith("loc")) {
        injectErrorBoundaryKeysIntoStringsInterface(fullPath);
        locInjected.push(fullPath);
      }
    }
  };
  findLocFiles(srcLocDir);
}

fs.writeFileSync(
  path.join(intelligenceDir, "preparation-log.md"),
  [
    "# Preparation Log",
    "",
    `- Project: ${slug}`,
    "- Added local dependency: `@paquete/spfx-common`",
    "- Normalized `npm run build` to `heft build --clean --production && heft test --production && heft package-solution --production`",
    "- Forced `skipFeatureDeployment=false` in `config/package-solution.json` when present",
    locInjected.length > 0
      ? `- Injected ErrorBoundaryTitle/ErrorBoundaryMessage into: ${locInjected.map((f) => path.relative(projectRoot, f)).join(", ")}`
      : "- No loc files found for ErrorBoundary injection"
  ].join("\n"),
  "utf8"
);

console.log(`Prepared SPFx defaults for ${slug}`);
