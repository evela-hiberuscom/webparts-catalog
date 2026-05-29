# RONDA 2 — Delta vs RONDA 1

| Tema | Ronda 1 decía | Ronda 2 dice | Resolución propuesta | Impacto en severidad |
| --- | --- | --- | --- | --- |
| .env.local Airtable PAT | Secreto confirmado | Local ignorado y no trackeado | Rotar preventivamente; no tratar como fuga Git | Low |
| Tokens funcionales | Hits de secret scan | 73 falsos positivos | Allowlist futura | N/A |
| window.open | 7 hits | 5 _blank reales; 2 _self no tabnabbing | Tercer argumento y URL helper | Low |
| target=_blank | Riesgo implícito | Todos tienen noreferrer/noopener | Cerrar FP | N/A |
| innerHTML | No XSS confirmado | Todos en tests | Cerrar FP | N/A |
| localStorage | Bajo/medio | Solo microencuesta/pulso; datos comportamiento | TTL/documentación | Low |
| CI | Ausente | Ausente confirmado | Crear workflow PR | High operacional |
| SBOM/Dependabot | Ausentes | Ausentes confirmado | Dependabot + SBOM | Medium |
| Lockfiles | Skew | Skew + posible desync spfx-common | npm ci por proyecto | Medium |
| npm ls root missing | Problema | FP por root no instalado | No usar como vulnerabilidad | N/A/Bajo operacional |
| Manifests parse errors | FP probable | FP confirmado JSONC | jsonc-parser | N/A |
| Catch silenciosos | Bajo/medio | 71 ocurrencias; observabilidad real | no-empty catch | Medium |
| Hardcoded strings | Detectado | Localización incompleta | Backlog top proyectos | Low |
| XSS/eval/iframe/IaC | No confirmado | Negativo verificado localmente | Cerrar | N/A |
| Riesgo dominante | Mixto | Operacional, no AppSec crítico | CI/QA/Supply primero | Ajuste de foco |
