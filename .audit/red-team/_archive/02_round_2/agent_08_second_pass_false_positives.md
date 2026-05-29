# RONDA 2 — Agent 08 — Falsos positivos

| ID | Señal | Resolución | Razón |
| --- | --- | --- | --- |
| FP-001 | Secret scan: 73 hits por nombres *Tokens | Falso positivo probable | Los hits son tipos/campos funcionales como audienceTokens/profileTokens, no credenciales |
| FP-002 | innerHTML=7 | Falso positivo confirmado | Todos son container.innerHTML='' en tests |
| FP-003 | target=_blank en Link/a | Falso positivo confirmado | Los 15 hits usan rel=noreferrer o noopener noreferrer |
| FP-004 | JSON parse errors en manifests | Falso positivo confirmado | Los manifests SPFx son JSONC con comentarios; usar jsonc-parser |
| FP-005 | npm ls raíz missing spfx-common como vulnerabilidad | Falso positivo de severidad | Root no tiene node_modules; es estado local, no fuga ni CVE |
| NEG-001 | XSS por dangerouslySetInnerHTML/eval/document.write/iframe | Negativo verificado | Contadores a 0 en source-pattern-counts.json |

## Cambios de severidad

- target=_blank con rel=noreferrer: se cierra como FP.
- innerHTML en tests: se cierra como FP.
- manifest parse errors: se cierra como FP de herramienta.
- npm ls root missing: se reclasifica como estado local/operacional.
