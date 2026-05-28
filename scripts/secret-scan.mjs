import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "lib",
  "lib-commonjs",
  "dist",
  "temp",
  "coverage",
  "sharepoint",
  ".audit"
]);
const ignoredFiles = new Set(["package-lock.json"]);
const textExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".mjs",
  ".cjs",
  ".yml",
  ".yaml",
  ".md",
  ".txt"
]);
const patterns = [
  {
    name: "Airtable PAT",
    regex: /\bpat[a-zA-Z0-9]{14}\.[a-zA-Z0-9]{32,}\b/g
  },
  {
    name: "GitHub token",
    regex: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/g
  },
  {
    name: "Azure storage key",
    regex: /\bDefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{40,}/g
  },
  {
    name: "Private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/g
  }
];

function walk(dirPath, files = []) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (ignoredFiles.has(entry.name) || !textExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

const findings = [];
for (const filePath of walk(repoRoot)) {
  const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const content = fs.readFileSync(filePath, "utf8");
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const line = content.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ file: relativePath, line, type: pattern.name });
    }
  }
}

if (findings.length > 0) {
  console.error(`Potential secret(s) found: ${findings.length}`);
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.type}`);
  }
  process.exit(1);
}

console.log("No high-confidence secrets detected in tracked source paths.");
