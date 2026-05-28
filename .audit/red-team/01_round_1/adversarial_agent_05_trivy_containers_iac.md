# RONDA 1 — Adversarial 05_trivy_containers_iac

1. Sólido: Trivy no disponible
2. Inflado: ausencia Trivy no es vulnerabilidad
3. FP: JSON parse manifests
4. Falta: Trivy/SBOM real
5. No revisado: app catalog
6. Nuevo: gap CI
7. Poco realista: Docker scan sin Docker
8. Cambio final: no cubierto/preventivo

## Resolución

Los hallazgos sin evidencia suficiente se rebajan a sospecha o falso positivo probable. El informe final prioriza CI/QA/supply chain y evita exagerar riesgos AppSec no confirmados.
