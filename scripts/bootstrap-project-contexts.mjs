import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const orchestrationPath = path.join(repoRoot, "orchestration", "project-work-items.json");
if (!fs.existsSync(orchestrationPath)) {
  throw new Error("Missing orchestration/project-work-items.json. Run `npm run sync:airtable` first.");
}

const payload = JSON.parse(fs.readFileSync(orchestrationPath, "utf8"));
const templatePath = path.join(repoRoot, "orchestration", "templates", "project-intelligence.template.md");
const template = fs.readFileSync(templatePath, "utf8");

for (const item of payload.items) {
  const projectRoot = path.join(repoRoot, "projects", item.slug);
  const intelligenceDir = path.join(projectRoot, "project-intelligence");
  const designDir = path.join(projectRoot, "design");
  const provisioningDir = path.join(projectRoot, "provisioning");
  fs.mkdirSync(intelligenceDir, { recursive: true });
  fs.mkdirSync(designDir, { recursive: true });
  fs.mkdirSync(provisioningDir, { recursive: true });

  const intelligenceDoc = template
    .replace("- `rowId`:", `- \`rowId\`: ${item.rowId}`)
    .replace("- `name`:", `- \`name\`: ${item.name}`)
    .replace("- `slug`:", `- \`slug\`: ${item.slug}`)
    .replace("- `waveNumber`:", `- \`waveNumber\`: ${item.waveNumber}`);

  fs.writeFileSync(path.join(intelligenceDir, "project-intelligence.md"), intelligenceDoc, "utf8");
  fs.writeFileSync(path.join(intelligenceDir, "row-source.json"), JSON.stringify(item, null, 2), "utf8");

  const designReference = {
    projectSlug: item.slug,
    rowId: item.rowId,
    references: [
      "../../style-guide/brand-profile.json",
      "../../style-guide/design-tokens.json",
      "../../style-guide/component-inventory.json",
      "../../style-guide/mockup-spec-spfx-portal.md"
    ],
    projectDesignJson: item.sourceJsons.designJson
  };

  fs.writeFileSync(path.join(designDir, "design-reference.json"), JSON.stringify(designReference, null, 2), "utf8");

  const provisioningDefinition = {
    projectSlug: item.slug,
    archetype: item.archetype,
    rowId: item.rowId,
    sources: item.provisioningNeeds,
    acceptanceCriteria: item.sourceJsons.specsJson?.acceptanceCriteria ?? [],
    businessRules: item.sourceJsons.specsJson?.businessRules ?? []
  };

  fs.writeFileSync(
    path.join(provisioningDir, "provisioning-definition.json"),
    JSON.stringify(provisioningDefinition, null, 2),
    "utf8"
  );
}

console.log(`Bootstrapped project contexts for ${payload.items.length} projects.`);
