# Informe ejecutivo final

## Resumen ejecutivo

La auditoría local defensiva de doble ronda no encontró vulnerabilidades AppSec críticas confirmadas en el código SPFx. El riesgo dominante es operacional: ausencia de CI/CD versionado, tests existentes sin ejecución automática, supply chain sin SBOM/SCA/automatización y señales de deuda de observabilidad/localización.

## Nivel de riesgo global

**Medium con componente operacional High**. No apto para release sin condiciones de validación automática.

## Apto/no apto para producción

**No apto para producción sin condiciones.** Apto de forma condicionada cuando exista CI mínimo con build/test por proyecto modificado, secret scan/SCA básico y validación de lockfiles.

## Top 10 riesgos confirmados

1. CI-001 — Ausencia total de workflows CI/CD versionados (High)
2. QA-001 — Tests existentes no ejecutados automáticamente (High)
3. SUPPLY-001 — Sin SCA/SBOM/Dependabot/Renovate versionados (Medium)
4. SUPPLY-002 — Rangos flotantes y skew de lockfiles entre 52 proyectos (Medium)
5. SUPPLY-003 — Lockfiles potencialmente desincronizados con @paquete/spfx-common (Medium)
6. SEC-004 — JsonUrl configurable sin restricción same-origin en mis-accesos-recientes (Medium)
7. QA-002 — Cobertura desigual: varios proyectos sin tests y gaps negativos/a11y/throttling (Medium)
8. SMELL-002 — Catch silenciosos/fallbacks sin diagnóstico (Medium)
9. BUG-001 — Uso frágil de getByTitle con encodeURIComponent en repositorios SharePoint (Medium)
10. SEC-001 — Airtable PAT presente en .env.local local e ignorado (Low)

## Top 10 quick wins

1. Crear workflow CI mínimo.
2. Ejecutar tests/build por proyecto modificado.
3. Añadir Dependabot/SBOM/SCA.
4. Rotar PAT Airtable local si procede.
5. Añadir noopener/noreferrer y helper de enlaces.
6. Restringir JsonUrl de mis-accesos-recientes.
7. Añadir lint no-empty catch.
8. Migrar top hardcoded strings a loc.
9. Usar parser JSONC para manifests en auditorías.
10. Verificar lockfiles con npm ci controlado.

## Herramientas ejecutadas

Git, Node scanner local, npm ls local sin install, inventario PowerShell, búsquedas locales.

## Herramientas no disponibles/no ejecutadas

Semgrep, gitleaks, trivy, cyclonedx-npm, cdxgen, dependency-check, npm audit.

## Zonas no cubiertas

Runtime SharePoint, CSP real del tenant, app catalog, branch protection, CVEs transitivos, licencias, pipelines externos.

## Recomendación siguiente

Implementar CI mínimo y repetir SCA/secret scanning en entorno autorizado antes de aceptar release.
