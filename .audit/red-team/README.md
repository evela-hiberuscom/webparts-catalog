# Auditoría red-team defensiva local

## Qué se ha analizado

Repositorio completo `paquete-webparts`, con 52 proyectos SPFx, paquete compartido `packages/spfx-common`, documentación canónica, scripts, package manifests, lockfiles, configuración SPFx, patrones de código, secretos locales enmascarados, CI/CD local y evidencia de tests.

## Herramientas ejecutadas

- Git para contexto e inventario.
- Escaneo local Node/PowerShell sin red.
- npm ls local con --ignore-scripts (falló por root sin node_modules, registrado).
- Revisión manual y subagentes defensivos de RONDA 1/RONDA 2.

## Herramientas no disponibles/no ejecutadas

Semgrep, SonarScanner, Fortify, gitleaks, trivy, CycloneDX/cdxgen, Dependency-Check. npm audit no se ejecutó por requerir consulta externa al registry.

## Cómo leer los informes

- `09_final/executive_summary.md`: lectura principal ejecutiva.
- `09_final/technical_findings.md`: detalle de hallazgos finales.
- `06_backlog/remediation_backlog.md`: acciones listas para issues/Jira.
- `02_round_2/round_2_delta_vs_round_1.md`: cambios de severidad y falsos positivos.
- `05_raw_tool_outputs/`: evidencia bruta local, sin secretos completos.

## Informe más importante

`09_final/executive_summary.md` para decisión de riesgo y `09_final/release_readiness_decision.md` para go/no-go.

## Limitaciones

No se ejecutaron comandos destructivos, installs, restores, npm audit ni ataques externos. No se validó runtime SharePoint, CSP real, branch protection, secretos de CI, CVEs transitivos ni licencias. Los secretos detectados se enmascararon.
