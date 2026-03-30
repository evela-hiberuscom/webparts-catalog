import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const orchestrationDir = path.join(rootDir, "orchestration");
const generatedDir = path.join(orchestrationDir, "generated");
const runtimeTrackerPath = path.join(orchestrationDir, "runtime-tracker.json");
const executionWavesPath = path.join(generatedDir, "execution-waves-2026-03-30.json");
const progressBoardPath = path.join(generatedDir, "project-progress.json");

fs.mkdirSync(generatedDir, { recursive: true });

if (!fs.existsSync(runtimeTrackerPath)) {
  throw new Error("Missing orchestration/runtime-tracker.json.");
}

const runtimeTracker = JSON.parse(fs.readFileSync(runtimeTrackerPath, "utf8"));
const executionWaves = fs.existsSync(executionWavesPath)
  ? JSON.parse(fs.readFileSync(executionWavesPath, "utf8"))
  : { waves: [] };
const progressBoard = fs.existsSync(progressBoardPath)
  ? JSON.parse(fs.readFileSync(progressBoardPath, "utf8"))
  : { items: [] };

const progressMap = new Map((progressBoard.items ?? []).map((item) => [item.slug, item]));
const dateStamp = new Date().toISOString().slice(0, 10);

const agentItems = (runtimeTracker.projects ?? []).map((project) => {
  const progress = progressMap.get(project.slug);
  return {
    slug: project.slug,
    waveId: project.waveId ?? null,
    waveNumber: progress?.waveNumber ?? null,
    name: progress?.name ?? project.slug,
    agentId: project.agentId ?? null,
    agentNickname: project.agentNickname ?? null,
    phase: project.phase ?? "unknown",
    progressStatus: progress?.progressStatus ?? "unknown",
    auditStatus: project.gates?.audit ?? "not-started",
    buildStatus: project.gates?.build ?? "not-started",
    testStatus: project.gates?.test ?? "not-started",
    packageStatus: project.gates?.package ?? "not-started",
    lastTrackedAt: project.lastTrackedAt ?? null,
    lastSignal: project.lastSignal ?? null,
    notes: project.notes ?? []
  };
});

const waves = (executionWaves.waves ?? []).map((wave) => {
  const projects = agentItems.filter((project) => project.waveId === wave.id);
  return {
    id: wave.id,
    status: wave.status,
    projects
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  objective: executionWaves.objective ?? null,
  waves,
  trackedProjects: agentItems
};

const lines = [
  "# Agent Trace Board",
  "",
  `- Generated: ${payload.generatedAt}`,
  `- Tracked projects: ${agentItems.length}`,
  "",
  "## Wave Status",
  "",
  "| Wave | Status | Projects |",
  "|---|---|---|",
  ...waves.map((wave) => `| ${wave.id} | ${wave.status} | ${wave.projects.length} |`),
  "",
  "## Project Trace",
  "",
  "| Wave | Project | Agent | Phase | Build | Test | Package | Audit | Status | Last Signal |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...agentItems.map((item) => {
    const agent = item.agentNickname ?? "-";
    return `| ${item.waveId ?? "-"} | ${item.name} | ${agent} | ${item.phase} | ${item.buildStatus} | ${item.testStatus} | ${item.packageStatus} | ${item.auditStatus} | ${item.progressStatus} | ${item.lastSignal ?? "-"} |`;
  }),
  ""
];

fs.writeFileSync(path.join(generatedDir, `agent-trace-${dateStamp}.json`), JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(path.join(generatedDir, `agent-trace-${dateStamp}.md`), lines.join("\n"), "utf8");
fs.writeFileSync(path.join(generatedDir, "agent-trace-latest.json"), JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(path.join(generatedDir, "agent-trace-latest.md"), lines.join("\n"), "utf8");

console.log(`Agent trace generated for ${agentItems.length} tracked projects.`);
