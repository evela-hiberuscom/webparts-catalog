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

const args = parseArgs(process.argv);
const registryPath = path.join(process.cwd(), "orchestration", "issue-registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const nextNumber = registry.entries.length + 1;
const padded = String(nextNumber).padStart(3, "0");
registry.updatedAt = new Date().toISOString();
registry.entries.push({
  id: args.id ?? `ISSUE-${padded}`,
  scope: args.scope ?? "general",
  archetype: args.archetype ?? "general",
  projectSlug: args.projectSlug ?? null,
  summary: args.summary ?? "Issue recorded without summary.",
  rootCause: args.rootCause ?? "Pending analysis",
  detectionStage: args.detectionStage ?? "execution",
  mitigation: args.mitigation ?? "Pending mitigation",
  status: args.status ?? "open",
  reusable: args.reusable === "false" ? false : true
});

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf8");
console.log(`Issue recorded in ${registryPath}`);
