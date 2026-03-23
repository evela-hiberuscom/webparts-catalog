import fs from "node:fs";
import path from "node:path";
import { fetchAllRecords } from "./lib/airtable.mjs";
import { assignWaves, createProjectWorkItem } from "./lib/catalog.mjs";

const orchestrationDir = path.resolve(process.cwd(), "orchestration");
const generatedDir = path.join(orchestrationDir, "generated");
fs.mkdirSync(generatedDir, { recursive: true });

const records = await fetchAllRecords();
const workItems = assignWaves(records.map(createProjectWorkItem));
const now = new Date().toISOString();

const payload = {
  generatedAt: now,
  totalProjects: workItems.length,
  waves: [...new Set(workItems.map((item) => item.waveNumber))],
  items: workItems
};

fs.writeFileSync(
  path.join(orchestrationDir, "project-work-items.json"),
  JSON.stringify(payload, null, 2),
  "utf8"
);

const summaryLines = [
  "# Project Work Items",
  "",
  `- Generado: ${now}`,
  `- Total proyectos: ${workItems.length}`,
  "",
  "| Wave | Proyecto | Archetype | Enrichment | Row ID |",
  "|---|---|---|---|---|",
  ...workItems.map(
    (item) =>
      `| ${item.waveNumber} | ${item.name} | ${item.archetype} | ${item.enrichmentStatus} | ${item.rowId} |`
  ),
  ""
];

fs.writeFileSync(path.join(generatedDir, "project-work-items.md"), summaryLines.join("\n"), "utf8");

console.log(`Catalog synchronized: ${workItems.length} work items written.`);
