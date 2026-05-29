# Environment Discovery

Fecha: 2026-05-28
Rama usada: `fix/validate-all-webpart-projects`

## Estado del repositorio

| Elemento | Resultado |
| --- | --- |
| Directorio raíz | `C:/dev/paquete-webparts` |
| Git status al crear este documento | Cambios presentes tras corrección documental inicial |
| Cambios detectados | `M CATALOGO_WEBPARTS_SPFX.md` |
| Branch creada para la orquestación | `fix/validate-all-webpart-projects` |

## Gestor de paquetes y runtime

| Elemento | Resultado |
| --- | --- |
| Gestor raíz | npm con workspaces solo para `packages/*` |
| Node detectado | `v22.14.0` |
| npm detectado | `9.6.7` |
| Node esperado | `>=22.14.0 <23.0.0` por catálogo, proyectos, Renovate y CI |
| pnpm/yarn/rush/nx/turbo/lerna | No detectados como arnés raíz activo |

## Comandos raíz detectados

| Comando | Script |
| --- | --- |
| npm run sync:airtable | `node ./scripts/sync-airtable-catalog.mjs` |
| npm run bootstrap:contexts | `node ./scripts/bootstrap-project-contexts.mjs` |
| npm run orchestrate:foundation | `npm run sync:airtable && npm run bootstrap:contexts` |
| npm run scaffold:spfx | `node ./scripts/scaffold-spfx-project.mjs` |
| npm run prepare:spfx | `node ./scripts/prepare-spfx-project.mjs` |
| npm run record:issue | `node ./scripts/record-issue.mjs` |
| npm run progress:board | `node ./scripts/render-progress-board.mjs` |
| npm run progress:trace | `node ./scripts/render-agent-trace.mjs` |
| npm run audit:redteam | `node ./scripts/generate-red-team-audit.mjs` |
| npm run ci:projects | `node ./scripts/ci-validate-projects.mjs` |
| npm run ci:projects:dry-run | `node ./scripts/ci-validate-projects.mjs --dry-run` |
| npm run check:locks | `node ./scripts/check-lockfile-consistency.mjs` |
| npm run check:pinned-deps | `node ./scripts/check-pinned-project-deps.mjs` |
| npm run check:secrets | `node ./scripts/secret-scan.mjs` |
| npm run check:audit-remediation | `node ./scripts/audit-remediation-checks.mjs` |

## CI/CD detectado

| Workflow | Uso |
| --- | --- |
| .github/workflows/ci.yml | Guardrails, build y test de proyectos afectados |
| .github/workflows/supply-chain.yml | SCA/SBOM sobre proyectos afectados o todos en schedule |

## Decisiones operativas

- Se procesa todo proyecto con `package.json` y `config/config.json` bajo `projects/`.
- `projects/sharepoint-governance-webparts/_governance/` queda excluido como carpeta documental sin código SPFx productivo.
- Se usa npm por proyecto porque todos los proyectos detectados tienen `package-lock.json`.
- No se ejecutan operaciones contra SharePoint, Graph, Purview ni Teams.
- No se hace `git add` ni commit automático salvo permiso explícito posterior.
