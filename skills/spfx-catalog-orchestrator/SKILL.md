---
name: spfx-catalog-orchestrator
description: >
  Orquesta inventario, catalogo, validacion, remediacion, documentacion,
  auditoria adversarial y compactacion/limpieza de evidencias para uno,
  varios o todos los proyectos SPFx de un catalogo de webparts.
  Trigger: actualizar catalogo webparts, validar proyectos SPFx, auditar gobernanza SPFx, compactar logs.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Use this skill when the task is to:

- Update or validate an SPFx webpart catalog for one project, a selected batch, or the full repository.
- Reproduce an evidence-first validation loop: inventory, build/test, remediation, documentation, red-team, and final closure.
- Coordinate old and new SPFx projects without losing traceability across many independent webparts.
- Compact reports/logs and remove disposable validation artifacts after evidence has been summarized.

## Critical Patterns

1. Read `AGENTS.md` first and `DESIGN.md` second. They are the source of truth for architecture, SPFx compatibility, testing, security, UX, accessibility, and final validation.
2. Do not invent scripts or conventions. Inspect `package.json`, `scripts/`, project `package.json` files, SPFx manifests, and existing docs before running commands.
3. A processable SPFx project is a directory under `projects\` with `package.json` and `config\config.json`. Documentation-only directories such as `_governance` are not buildable projects.
4. Support three scopes:

| Scope | Input | Validation approach |
| --- | --- | --- |
| `single` | One project path | Validate only that project plus repo guardrails affected by the change. |
| `batch` | Explicit project list or changed-project selection | Validate each selected project and aggregate results. |
| `all` | Full catalog | Discover all SPFx projects, validate every one, update catalog/global docs, and run global red-team. |

5. Evidence must be durable. Every validation run should end with a compact summary that includes command, scope, timestamp, selected projects, pass/fail status, failures fixed, remaining risks, and cleanup status.
6. Fix only evidence-backed blockers. Do not change dependencies, permissions, `package-solution.json`, `webApiPermissionRequests`, deployment settings, external domains, CSP, or shared architecture without explicit justification and, when needed, ADR/user approval.
7. Keep the final docs truthful. Do not claim 100 percent coverage unless thresholds prove it. It is valid to say coverage artifacts exist but no global threshold is enforced.
8. Use adversarial review before closure for broad changes. Check duplicate logic, inconsistent UX, model drift, build/deploy risks, security risks, dependency risks, and backend-integration gaps.

## Workflow

1. **Analyze**
   - Read `AGENTS.md`, `DESIGN.md`, root `package.json`, relevant project manifests, catalog docs, and validation scripts.
   - Discover SPFx projects by the repo contract: `package.json` plus `config\config.json`.
   - Compare physical projects/webparts against catalog entries. Record special cases, such as one SPFx project containing multiple webparts.

2. **Plan**
   - State scope: `single`, `batch`, or `all`.
   - List target projects and expected evidence files.
   - Identify sensitive surfaces that require caution: permissions, package solution, dependencies, shared packages, CI, deployment, and security scans.

3. **Validate baseline**
   - Run discovery/dry-run before changing code.
   - Run the real project build/test/package script for the selected scope.
   - Capture exact failures and warnings. Do not remediate from assumptions.

4. **Remediate**
   - Apply small, targeted fixes.
   - Prefer existing helpers, shared test setup, repo scripts, and local conventions.
   - Keep localization files synchronized across `mystrings.d.ts`, `es-es.js`, and `en-us.js`.
   - Keep React, Fluent UI, SPFx, TypeScript, and Jest compatibility aligned with the project baseline.

5. **Revalidate**
   - Re-run the failing project first.
   - Re-run the selected batch or full scope after fixes.
   - Run guardrails that exist in the repo: lock consistency, pinned dependencies, secret scan, audit remediation, completeness, and whitespace checks.

6. **Document**
   - Update the catalog and orchestrator docs with final counts, status, special cases, failures fixed, and remaining risks.
   - For governance/project sets, keep per-project red-team evidence and global red-team evidence separate.

7. **Compact and clean**
   - Extract durable evidence from raw logs before deleting any transient files.
   - Keep only final summaries, latest manifest entries, active failure logs, and docs needed for auditability.
   - Remove disposable generated artifacts after validation passes.

8. **Close**
   - Confirm no selected project remains failed.
   - Confirm no temporary artifacts remain visible in Git status.
   - Report the outcome with counts, changed evidence files, validations run, and open risks.

## Validation Commands

Run only scripts that exist in the repository. For this repo, these are the standard commands:

```powershell
npm run ci:projects:dry-run -- --all
npm run check:locks
npm run check:pinned-deps
npm run check:secrets
npm run check:audit-remediation
node .\scripts\audit-webpart-completeness.mjs
git --no-pager diff --check
```

For a single project:

```powershell
Push-Location "projects\PROJECT-NAME"
npm ci --ignore-scripts
npm run build --if-present
Pop-Location
```

For the full selected-project CI script:

```powershell
npm run ci:projects -- --all
```

Use `--skip-install` only when the exact dependency state is already established and the purpose is a fast rerun:

```powershell
npm run ci:projects -- --all --skip-install
```

## Evidence Files

Use these files when present; adapt names only if the repo already defines a different convention:

| File | Purpose |
| --- | --- |
| `CATALOGO_WEBPARTS_SPFX.md` | Human-readable catalog source of truth. |
| `docs\orchestrator\run-manifest.json` | Machine-readable command/project validation evidence. |
| `docs\orchestrator\validation-progress.md` | Project validation matrix and progress summary. |
| `docs\orchestrator\final-global-validation.md` | Final validation summary and guardrail evidence. |
| `docs\orchestrator\global-red-team-validation.md` | Repo-wide adversarial findings and mitigations. |
| `projects\sharepoint-governance-webparts\_governance\docs\project-index.md` | Governance project index when that structure exists. |
| `projects\sharepoint-governance-webparts\_governance\docs\red-team\global-red-team.md` | Governance-set global red-team audit. |

## Report and Log Compaction System

Always run compaction after a successful validation batch and before final closure. The goal is to preserve auditability while avoiding large, duplicated, stale, or machine-specific logs.

### Classification

| Class | Keep? | Examples | Rule |
| --- | --- | --- | --- |
| Durable evidence | Yes | Catalog, final validation docs, global red-team docs, compact manifest | Keep and update. |
| Active failure evidence | Temporarily | Logs for projects still failing | Keep until the failure is fixed and summarized. |
| Intermediate success logs | No, after summarizing | Full stdout/stderr from passed builds | Extract summary, then delete or stop tracking. |
| Disposable generated artifacts | No | `.node_modules_delete_*`, `build-last*.log`, temp build logs | Delete after evidence is captured. |
| Regenerable project output | No in repo evidence | `lib`, `dist`, `temp`, `coverage`, `sharepoint`, `teams` | Do not commit; remove only when safe and not needed for diagnosis. |

### Manifest compaction

Use `run-manifest.json` or equivalent to retain one latest result per project and a compact command history:

- Keep `relativePath`, command, cwd or repo-relative cwd, status, exit code, started/finished timestamp, duration when available, and short failure summary.
- For repeated project validations, keep the latest status as authoritative and move older run details into aggregate counts.
- For full-catalog work, record final totals: discovered projects, physical webparts, passed, failed, skipped, warnings, and special cases.
- Avoid absolute local paths unless they are necessary for diagnosis; prefer repo-relative paths.
- Never copy secrets, tokens, cookies, or tenant-specific credentials into reports.

### Log compaction

For each raw log:

1. Extract command, project, status, first meaningful error, warning count, and remediation note.
2. Add the summary to `validation-progress.md`, `final-global-validation.md`, or the relevant red-team doc.
3. If the project now passes, remove the raw success log.
4. If the project still fails, keep the smallest useful failure log and link/reference it from the progress doc.
5. Re-run secret scan after compaction if logs were generated or moved.

### Cleanup safety rules

- Never delete source files, `package.json`, `package-lock.json`, `config\`, `src\`, `docs\` final evidence, ADRs, or project READMEs.
- Never use broad destructive commands without a precise path and prior classification.
- Do not remove failed-run evidence until the failure is fixed or explicitly documented as an external dependency.
- If a cleanup target appears in `git --no-pager status --short`, inspect it before deleting.

### Cleanup commands

Use these only after durable evidence has been written:

```powershell
Get-ChildItem -Path . -Directory -Recurse -Force -Filter ".node_modules_delete_*" | Remove-Item -Recurse -Force
Get-ChildItem -Path . -File -Recurse -Force -Filter "build-last*.log" | Remove-Item -Force
git --no-pager status --short | Select-String -Pattern "node_modules|\.node_modules_delete|build-last"
npm run check:secrets
git --no-pager diff --check
```

If the status grep prints anything, inspect it and either remove the disposable artifact or document why it must remain.

## Red-Team Checklist

Use this checklist before final closure:

| Area | Attack question |
| --- | --- |
| Catalog | Does disk inventory match catalog totals and special cases? |
| Scope | Were single/batch/all boundaries respected? |
| Build | Can every selected SPFx project compile independently? |
| Tests | Were existing tests run, and are warnings/failures explained? |
| UX | Are UI states, localization, accessibility, and Fluent UI consistency preserved? |
| Security | Were secrets, permissions, CSP, external domains, and dependency risks checked? |
| Reuse | Are shared models/contracts documented without forcing a fragile shared package? |
| Evidence | Are final docs enough to understand what passed without reading raw logs? |
| Cleanup | Were transient logs and backup folders removed after compaction? |
| Remaining risk | Are external dependencies and non-enforced thresholds stated honestly? |

## Standalone Prompt

Copy this prompt into an agent that does not support skills:

```text
Act as an SPFx catalog validation orchestrator for this repository.

Goal:
- Update and validate the SPFx webpart catalog for one project, a selected batch, or all projects.
- Produce durable evidence, remediate failures, run adversarial review, compact reports/logs, and clean disposable artifacts.

Required workflow:
1. Read AGENTS.md first and DESIGN.md second.
2. Inspect package.json, scripts, project manifests, catalog docs, and existing validation evidence.
3. Determine scope: single, batch, or all. A buildable SPFx project has package.json plus config\config.json.
4. Run discovery/dry-run and existing repo guardrails only. Do not invent scripts.
5. Validate selected projects with their real build/test/package commands.
6. Fix only evidence-backed issues, preserving SPFx/React/Fluent UI compatibility, localization integrity, security, permissions, and repo conventions.
7. Re-run failed projects, then the selected batch or full catalog.
8. Update catalog, progress, final validation, and red-team docs with truthful counts and remaining risks.
9. Compact evidence:
   - Keep final summaries, latest project statuses, active failure summaries, and red-team findings.
   - Summarize raw logs into durable docs.
   - Remove passing raw logs, build-last logs, .node_modules_delete_* folders, and other disposable generated artifacts after evidence is captured.
   - Keep failed logs only while failures remain unresolved.
10. Run final guardrails: lock consistency, pinned dependencies, secret scan, audit remediation, completeness, git diff --check, and status grep for temporary artifacts.
11. Final response must include scope, counts, validations, docs updated, cleanup result, and unresolved risks.

Hard constraints:
- Do not change dependencies, package-solution.json, webApiPermissionRequests, deployment settings, CSP, external domains, or shared architecture without explicit justification and approval.
- Do not claim 100 percent coverage unless enforced thresholds prove it.
- Do not delete source/config/docs final evidence. Cleanup only classified disposable artifacts.
```
