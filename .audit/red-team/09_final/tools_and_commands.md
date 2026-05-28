# Herramientas y comandos

| Herramienta | Disponible | Comando ejecutado | Resultado | Archivo bruto | Limitaciones |
| --- | --- | --- | --- | --- | --- |
| git | Sí | git branch --show-current; git rev-parse HEAD; git status --short; git ls-files | Capturado | git-*.txt | Solo repo local |
| Node | Sí | node .audit/red-team/05_raw_tool_outputs/local-static-scan.mjs | Capturado | local-static-scan-summary.txt | Heurístico |
| npm | Sí | npm ls --all --json --omit=dev --ignore-scripts | Falló por root sin node_modules/workspace link | npm-ls-root-json.txt | No instala ni consulta audit |
| semgrep | No | No ejecutado | No disponible | tool-availability.txt | Instalar/CI |
| gitleaks | No | No ejecutado | No disponible | tool-availability.txt | Historial no cubierto |
| trivy | No | No ejecutado | No disponible | tool-availability.txt | FS/IaC/CVEs no cubiertos |
| cyclonedx/cdxgen | No | No ejecutado | No disponible | tool-availability.txt | Sin SBOM |
| npm audit | N/A | No ejecutado | Evitado por consulta externa | execution_log.md | Requiere registry |
| heft build/test | Disponible por proyecto | No ejecutado | Evitado por artefactos/coste | package-manifest-summary.json | Debe ejecutarse en CI |

## Comandos recomendados no ejecutados

- semgrep scan --config auto --json --output .audit/red-team/05_raw_tool_outputs/semgrep.json
- gitleaks detect --source . --report-format json --report-path .audit/red-team/05_raw_tool_outputs/gitleaks.json
- trivy fs --scanners vuln,misconfig,secret,license --format json --output .audit/red-team/05_raw_tool_outputs/trivy-fs.json .
- npx @cyclonedx/cyclonedx-npm --output-file sbom.json
- npm audit --json (solo en entorno autorizado)
