# Repo Rules Summary

Fecha: 2026-05-28

## Orden de prioridad aplicado

1. Instrucciones explícitas del usuario para esta orquestación.
2. `AGENTS.md` más cercano; en este repo solo hay reglas canónicas raíz para código productivo.
3. Instrucciones específicas del proyecto si existen.
4. `.github/copilot-instructions.md` y `CLAUDE.md` como wrappers ligeros.
5. `DESIGN.md`, style-guide y documentación de orquestación.
6. Convenciones observadas en los proyectos existentes.
7. Buenas prácticas SPFx, React y TypeScript.

| Fuente | Ruta | Tipo de regla | Aplicabilidad | Regla detectada | Prioridad |
| --- | --- | --- | --- | --- | --- |
| Usuario | prompt de orquestación | Proceso | Todos los proyectos | Inventariar, validar, documentar y auditar todos los proyectos bajo projects/ sin dejar estados pendientes | 1 |
| Usuario | prompt de arquitectura previa | Arquitectura governance | projects/sharepoint-governance-webparts | Un proyecto SPFx independiente por webpart governance; _governance solo documental | 1 |
| AGENTS | AGENTS.md | Arquitectura | Todos los SPFx | Separar components, hooks, contexts, services, repositories, models y utils | 2 |
| AGENTS | AGENTS.md | Seguridad | Todos los SPFx | Mínimo privilegio; no secretos; no modificar permisos, package-solution o dominios externos sin justificación | 2 |
| AGENTS | AGENTS.md | Testing | Todos los SPFx | Objetivo 100% de cobertura en lógica y componentes; Jest como base | 2 |
| AGENTS | AGENTS.md | Error handling | Webparts React | Cada webpart debe envolver la raíz con WebPartErrorBoundary y strings localizados | 2 |
| AGENTS | AGENTS.md | Localización | UI | Todos los literales visibles deben vivir en loc/es-es.js, loc/en-us.js y mystrings.d.ts | 2 |
| DESIGN | DESIGN.md | UX/UI | Webparts y extensiones | Diseñar para SharePoint host real; estados loading, vacío, error, sin permisos, éxito, parcial y reintento | 5 |
| DESIGN | DESIGN.md | Accesibilidad | UI | No depender solo de color; foco visible, teclado y semántica correcta | 5 |
| Copilot | .github/copilot-instructions.md | Wrapper | Agentes Copilot | Redirige a AGENTS.md y DESIGN.md; no inventar dependencias, permisos ni scripts | 4 |
| Claude | CLAUDE.md | Wrapper | Claude Code | Redirige a AGENTS.md y DESIGN.md; cambios pequeños y verificables | 4 |
| CI | .github/workflows/ci.yml | CI/CD | Pull requests y main | Node 22.14.0; check:locks, check:pinned-deps, check:secrets, check:audit-remediation, ci:projects | 4 |
| Supply chain | .github/workflows/supply-chain.yml | CI/CD | PR, main y schedule | npm audit high y SBOM con ci:projects --audit --sbom | 4 |
| Renovate | renovate.json | Dependencias | npm | rangeStrategy pin; agrupar toolchain SPFx y superficie React/Fluent compatible | 5 |
| Orchestration | orchestration/archetype-notes.md | Patrones | Legacy generados | Gate estándar: heft build --clean --production && heft test --production && heft package-solution --production | 5 |

## Contradicciones detectadas

- El catálogo declaraba 78 proyectos independientes, pero el inventario real y el índice rápido contienen 79 rutas únicas; se corrigió el total a 79.
- El objetivo de cobertura 100% existe como política, pero los proyectos solo exponen `npm run build`; no hay script dedicado de coverage. La cobertura se documenta como no verificable por comando dedicado hasta que se añada arnés de coverage.
- El prompt pide commits por proyecto, pero también condiciona commits a permiso del repo. Esta ejecución no realizará commits automáticos sin permiso explícito.
