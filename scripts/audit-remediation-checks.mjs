import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const projectsDir = path.join(repoRoot, "projects");
const ignoredDirs = new Set(["node_modules", "lib", "lib-commonjs", "dist", "temp", "coverage", "release", "sharepoint"]);

function walk(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const findings = [];

for (const filePath of walk(projectsDir)) {
  const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const content = fs.readFileSync(filePath, "utf8");

  if (/window\.open\([^,\n]+,\s*['"]_blank['"]\s*\)/.test(content)) {
    findings.push(`${relativePath}: window.open _blank without noopener,noreferrer features`);
  }

  if (/getbytitle\('\$\{encodeURIComponent\(/i.test(content)) {
    findings.push(`${relativePath}: getByTitle uses encodeURIComponent instead of OData escaping`);
  }

  if (/fetch\(this\._url/.test(content) && !content.includes("resolveSameOriginUrl")) {
    findings.push(`${relativePath}: configurable fetch URL is not visibly normalized`);
  }
}

if (findings.length > 0) {
  console.error("Audit remediation guardrails failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Audit remediation guardrails passed.");
