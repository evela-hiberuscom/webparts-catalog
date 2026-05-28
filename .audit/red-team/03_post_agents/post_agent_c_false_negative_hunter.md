# POST-AGENTE C — Cazador de falsos negativos

## Hallazgos añadidos o reforzados

- SEC-004: JsonUrl configurable en mis-accesos-recientes sin same-origin confirmado.
- SUPPLY-003: lockfiles potencialmente desincronizados con @paquete/spfx-common.
- TOOL-001: manifests JSONC no cubiertos por parser JSON estándar.
- QA-002: proyectos sin tests y ausencia de tests negativos/a11y/throttling.
- SMELL-002: 71 catch/fallbacks silenciosos afectan observabilidad.

## Zonas que requieren revisión manual posterior

Branch protections, secret scanning GitHub, app catalog, CSP/tenant, CVEs transitivos, licencias y runtime SharePoint con datos reales.
