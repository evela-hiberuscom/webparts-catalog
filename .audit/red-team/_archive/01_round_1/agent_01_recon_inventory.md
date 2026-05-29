# RONDA 1 — AGENTE 1 — Reconocimiento e inventario técnico

## Alcance

Repositorio completo con foco en estructura SPFx, proyectos, paquetes compartidos, documentación, manifiestos, scripts y evidencia generada localmente.

## Archivos revisados

- AGENTS.md, DESIGN.md, README.md, CATALOGO_WEBPARTS_SPFX.md.
- package.json raíz y packages/spfx-common.
- projects/*/package.json, config/package-solution.json, README.md y muestras de webparts críticos.
- Evidencia en 05_raw_tool_outputs.

## Herramientas usadas

Lectura local, git ls-files, glob/rg, escaneo Node local sin red.

| Área | Evidencia | Riesgo inicial | Archivos implicados | Qué debe revisar otro agente |
| --- | --- | --- | --- | --- |
| Monorepo SPFx | 52 proyectos y 53 webparts | Medio | projects/* | Build/test por proyecto |
| Arquitectura canónica | AGENTS.md exige components/hooks/services/repositories/models/utils | Medio | AGENTS.md:86-106 | Arquitectura y code smells |
| Localización | loc existe pero hay hardcoded UI | Medio | loc/* + components/* | Calidad/UX |
| Error boundary | 53 WebPartErrorBoundary para 53 webparts | Bajo | architecture-quality-metrics.json | Montaje en raíz |
| Pipelines | workflow-summary.json=[] | Alto operacional | .github | CI/CD |
| Supply chain | 52 lockfiles, 207 rangos flotantes | Medio | projects/*/package*.json | Supply chain |
| Secretos | .env.local local ignorado | Bajo repositorio | .env.local, .gitignore | Secret scanning/historial |
| Docker/IaC | iacFiles=0 | Info | repo | Trivy/IaC si aparece fuera del repo |

## Hallazgos

- Confirmado: el repositorio es un pack SPFx gobernado por AGENTS.md y DESIGN.md.
- Confirmado: 52 soluciones SPFx tienen package-solution.json con skipFeatureDeployment=false y sin webApiPermissionRequests.
- Confirmado: no hay CI versionado ni Docker/IaC local.
- Sospecha razonable: el volumen de proyectos y lockfiles independientes exige gates automáticos para evitar drift.

## Incertidumbres y zonas no cubiertas

No se validó runtime SharePoint, app catalog, branch protection, historial git con gitleaks ni build/test real.

## Recomendaciones

Priorizar CI, SCA/SBOM, secret scanning, validación de lockfiles y normalización de localización/error handling.
