import fs from "node:fs";
import path from "node:path";

const ignoredDirectoryNames = new Set([
  ".git",
  "node_modules",
  "lib",
  "lib-commonjs",
  "dist",
  "temp",
  "coverage",
  "release",
  "sharepoint",
  "teams"
]);

export function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function isSpfxProject(dirPath) {
  return (
    fs.existsSync(path.join(dirPath, "package.json")) &&
    fs.existsSync(path.join(dirPath, "config", "config.json"))
  );
}

export function discoverSpfxProjects(projectsDir = path.join(process.cwd(), "projects")) {
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const projects = [];
  const stack = [projectsDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (currentDir !== projectsDir && isSpfxProject(currentDir)) {
      const relativePath = toPosixPath(path.relative(projectsDir, currentDir));
      projects.push({
        name: path.basename(currentDir),
        relativePath,
        absolutePath: currentDir
      });
      continue;
    }

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || ignoredDirectoryNames.has(entry.name) || entry.name.startsWith("_")) {
        continue;
      }

      stack.push(path.join(currentDir, entry.name));
    }
  }

  return projects.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export function selectChangedProjects(changedFiles, projects) {
  const selected = new Map();
  const sortedProjects = [...projects].sort((left, right) => right.relativePath.length - left.relativePath.length);

  for (const changedFile of changedFiles) {
    const normalizedFile = changedFile.replace(/\\/g, "/");
    for (const project of sortedProjects) {
      const projectPrefix = `projects/${project.relativePath}/`;
      if (normalizedFile === `projects/${project.relativePath}` || normalizedFile.startsWith(projectPrefix)) {
        selected.set(project.relativePath, project);
        break;
      }
    }
  }

  return Array.from(selected.values()).sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}
