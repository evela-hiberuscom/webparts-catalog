# POST-AGENTE B — Cazador de falsos positivos

| ID | Hallazgo | Evidencia disponible | Argumento de falso positivo | Resolución | Severidad final | Confianza final |
| --- | --- | --- | --- | --- | --- | --- |
| FP-001 | Secret scan Tokens | secret-scan-local-masked.json | Son identificadores de segmentación, no credenciales | Excluir del top final | N/A | High |
| FP-002 | innerHTML | source-pattern-matches.json | Solo limpieza de DOM en tests | Cerrar | N/A | High |
| FP-003 | target=_blank | source-pattern-matches.json | Todos con noreferrer/noopener | Cerrar | N/A | High |
| FP-004 | manifest parse errors | json-parse-errors.json | SPFx manifests son JSONC | Usar parser JSONC | N/A | High |
| FP-005 | npm ls root missing | npm-ls-root-json.txt | Root sin node_modules; no prueba vulnerabilidad | Reclasificar | Info | High |
