import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const raw = path.join(root, ".audit", "red-team", "05_raw_tool_outputs");
const evidence = path.join(root, ".audit", "red-team", "08_evidence");
const ignoredDirs = new Set([".git", "node_modules", ".audit", "lib", "lib-commonjs", "dist", "temp", "coverage", "jest-output", "release", "sharepoint", ".rush"]);
const textExts = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".scss", ".yml", ".yaml", ".npmrc", ".env", ""]);
const sourceExts = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".scss", ".md"]);

function rel(p) { return path.relative(root, p).replaceAll(path.sep, "/"); }
function safeRead(file) { return fs.readFileSync(file, "utf8"); }
function writeJson(name, value) { fs.writeFileSync(path.join(raw, name), JSON.stringify(value, null, 2), "utf8"); }
function writeText(name, value) { fs.writeFileSync(path.join(raw, name), value, "utf8"); }
const parseErrors = [];
function parseJsonFile(file) {
  try {
    return JSON.parse(safeRead(path.join(root, file)));
  } catch (error) {
    parseErrors.push({ file, error: error.message });
    return undefined;
  }
}
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}
function lineMatches(files, checks, { maxPerCheck = 200 } = {}) {
  const out = {};
  for (const [name, regex] of Object.entries(checks)) out[name] = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!sourceExts.has(ext) && !file.endsWith(".npmrc") && !file.endsWith(".env")) continue;
    let text;
    try { text = safeRead(file); } catch { continue; }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const [name, regex] of Object.entries(checks)) {
        regex.lastIndex = 0;
        if (out[name].length < maxPerCheck && regex.test(line)) {
          out[name].push({ file: rel(file), line: i + 1, snippet: line.trim().slice(0, 240) });
        }
      }
    }
  }
  return out;
}
function maskSecretSnippet(line) {
  return line
    .replace(/([A-Za-z0-9_ .-]*(?:secret|token|password|passwd|pwd|api[_-]?key|client[_-]?secret|private[_-]?key|connectionstring)[A-Za-z0-9_ .-]*\s*[:=]\s*["']?)([^"'\s,;]{6,})/gi, (_, a, b) => `${a}${b.slice(0, 3)}***${b.slice(-2)}`)
    .replace(/(-----BEGIN [A-Z ]*PRIVATE KEY-----)[\s\S]*/g, "$1***MASKED***")
    .replace(/(Bearer\s+)([A-Za-z0-9._~+\/-]{12,})/gi, (_, a, b) => `${a}${b.slice(0, 4)}***${b.slice(-3)}`)
    .replace(/(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})/g, (m) => `${m.slice(0, 8)}***${m.slice(-6)}`);
}

const files = walk(root);
const relFiles = files.map(rel).sort();
const packageFiles = relFiles.filter(f => f.endsWith("package.json"));
const packageSummaries = packageFiles.map(f => {
  const json = parseJsonFile(f);
  if (!json) return { file: f, parseError: true };
  const allDeps = { ...(json.dependencies ?? {}), ...(json.devDependencies ?? {}), ...(json.peerDependencies ?? {}), ...(json.optionalDependencies ?? {}) };
  const floating = Object.entries(allDeps).filter(([, v]) => typeof v === "string" && (/^[\^~*xX]/.test(v) || v.includes(" - ") || /[<>=]/.test(v))).map(([k, v]) => ({ name: k, version: v }));
  const lifecycleScripts = Object.entries(json.scripts ?? {}).filter(([k]) => /^(preinstall|install|postinstall|prepare|prepublish|prepack|postpack)$/i.test(k)).map(([k, v]) => ({ name: k, command: v }));
  const spfxDeps = Object.entries(allDeps).filter(([k]) => k.startsWith("@microsoft/sp-") || k === "@microsoft/spfx-heft-plugins").map(([k, v]) => ({ name: k, version: v }));
  return { file: f, name: json.name, private: json.private, version: json.version, scripts: json.scripts ?? {}, dependencyCount: Object.keys(allDeps).length, floatingDependencyCount: floating.length, floatingDependencies: floating.slice(0, 25), lifecycleScripts, spfxDeps, hasFilesProperty: Object.prototype.hasOwnProperty.call(json, "files") };
});
writeJson("package-manifest-summary.json", packageSummaries);

const packageSolutionFiles = relFiles.filter(f => f.endsWith("config/package-solution.json"));
const solutionSummaries = packageSolutionFiles.map(f => {
  const json = parseJsonFile(f);
  if (!json) return { file: f, parseError: true };
  const solution = json.solution ?? {};
  return { file: f, name: solution.name, id: solution.id, version: solution.version, skipFeatureDeployment: solution.skipFeatureDeployment, webApiPermissionRequests: solution.webApiPermissionRequests ?? [], includeClientSideAssets: solution.includeClientSideAssets, featuresCount: Array.isArray(solution.features) ? solution.features.length : 0 };
});
writeJson("spfx-package-solution-summary.json", solutionSummaries);

const manifestFiles = relFiles.filter(f => f.endsWith(".manifest.json"));
const manifestSummaries = manifestFiles.map(f => {
  const json = parseJsonFile(f);
  if (!json) return { file: f, parseError: true };
  return { file: f, id: json.id, alias: json.alias, componentType: json.componentType, version: json.version, supportedHosts: json.supportedHosts, requiresCustomScript: json.requiresCustomScript, supportsThemeVariants: json.supportsThemeVariants };
});
writeJson("spfx-manifest-summary.json", manifestSummaries);

const sourceFiles = relFiles.filter(f => /\.(ts|tsx|js|jsx)$/.test(f));
const testFiles = relFiles.filter(f => /(\.|\/)(test|spec)\.[jt]sx?$/.test(f) || f.includes("/__tests__/"));
const locFiles = relFiles.filter(f => /\/loc\/(mystrings\.d\.ts|es-es\.js|en-us\.js)$/.test(f));
writeJson("test-and-localization-summary.json", { sourceFileCount: sourceFiles.length, testFileCount: testFiles.length, testFiles: testFiles.slice(0, 200), locFileCount: locFiles.length, locFiles: locFiles.slice(0, 200) });

const checks = {
  dangerouslySetInnerHTML: /dangerouslySetInnerHTML/,
  innerHTML: /\.innerHTML\b/,
  iframe: /<iframe\b|\biframe\b/i,
  evalOrFunction: /\beval\s*\(|new\s+Function\s*\(/,
  documentWrite: /document\.write\s*\(/,
  windowOpen: /window\.open\s*\(/,
  targetBlank: /target\s*=\s*["']_blank["']/,
  localOrSessionStorage: /\b(localStorage|sessionStorage)\b/,
  fetchOrAxios: /\bfetch\s*\(|\baxios\b/,
  spHttpClient: /\bSPHttpClient\b|\bAadHttpClient\b|\bMSGraphClient\b|\bGraphFI\b|\bspfi\b/,
  getByTitleOrListUrl: /getByTitle\s*\(|GetList\(@listUrl\)|getById\s*\(/,
  catchSwallow: /catch\s*\([^)]*\)\s*\{\s*(return\s*;|return\s+undefined|\/\/|$)/,
  consoleErrorWarn: /console\.(log|warn|error|debug)\s*\(/,
  anyUsage: /:\s*any\b|as\s+any\b|<any>/,
  todoFixme: /\b(TODO|FIXME|HACK)\b/i,
  propertyPaneText: /PropertyPane(TextField|Dropdown|Toggle|Slider|ChoiceGroup|Button)/,
  externalUrl: /https?:\/\//i
};
writeJson("source-pattern-matches.json", lineMatches(files, checks));

const secretNameRegex = /(secret|token|password|passwd|pwd|api[_-]?key|apikey|client[_-]?secret|private[_-]?key|connectionstring|sas[_-]?token|pat)/i;
const secretValueRegex = /(-----BEGIN [A-Z ]*PRIVATE KEY-----|Bearer\s+[A-Za-z0-9._~+\/-]{12,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|[A-Za-z0-9_ .-]*(?:secret|token|password|passwd|pwd|api[_-]?key|apikey|client[_-]?secret|private[_-]?key|connectionstring)[A-Za-z0-9_ .-]*\s*[:=]\s*["']?[^"'\s,;]{6,})/i;
const secretHits = [];
for (const file of files) {
  const r = rel(file);
  const base = path.basename(file).toLowerCase();
  const ext = path.extname(file).toLowerCase();
  if (!textExts.has(ext) && !base.includes("env") && !base.includes("npmrc") && !base.includes("pypirc") && !base.includes("pem") && !base.includes("key")) continue;
  let text;
  try { text = safeRead(file); } catch { continue; }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((secretNameRegex.test(line) || base.match(/\.env|\.npmrc|\.pypirc|\.pem|\.key|\.pfx|\.cer/)) && secretValueRegex.test(line)) {
      secretHits.push({ file: r, line: i + 1, maskedSnippet: maskSecretSnippet(line.trim().slice(0, 500)) });
    }
  }
}
writeJson("secret-scan-local-masked.json", secretHits.slice(0, 500));

const workflowFiles = relFiles.filter(f => f.startsWith(".github/workflows/") && /\.(yml|yaml)$/.test(f));
const workflowSummaries = workflowFiles.map(f => ({ file: f, content: safeRead(path.join(root, f)).split(/\r?\n/).slice(0, 220).join("\n") }));
writeJson("workflow-summary.json", workflowSummaries);

const iacFiles = relFiles.filter(f => /(^|\/)(Dockerfile|docker-compose\.ya?ml|compose\.ya?ml)$/.test(f) || /\.(tf|bicep|template\.json|ya?ml)$/.test(f) && /(kubernetes|helm|chart|deployment|service|ingress|terraform|infra|iac|azure-pipelines|cloudformation)/i.test(f));
writeJson("iac-and-container-files.json", iacFiles);

const docs = relFiles.filter(f => /(^|\/)README\.md$|\.md$/.test(f));
writeJson("documentation-summary.json", { markdownCount: docs.length, markdownFiles: docs.slice(0, 250) });

const projectDirs = fs.existsSync(path.join(root, "projects")) ? fs.readdirSync(path.join(root, "projects"), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => `projects/${d.name}`).sort() : [];
writeJson("project-list.json", projectDirs);

const nestedProjectRoots = relFiles.filter(f => /^projects\/[^/]+\/[^/]+\/package\.json$/.test(f));
writeJson("nested-project-roots.json", nestedProjectRoots);

writeText("local-static-scan-summary.txt", `files=${relFiles.length}\npackages=${packageFiles.length}\nprojects=${projectDirs.length}\nsolutions=${packageSolutionFiles.length}\nmanifests=${manifestFiles.length}\nsourceFiles=${sourceFiles.length}\ntestFiles=${testFiles.length}\nsecretHeuristicHits=${secretHits.length}\nworkflows=${workflowFiles.length}\niacFiles=${iacFiles.length}\n`);
writeJson("json-parse-errors.json", parseErrors);