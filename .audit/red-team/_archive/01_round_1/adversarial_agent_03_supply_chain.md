# RONDA 1 — Adversarial 03_supply_chain

1. Sólido: 52 lockfiles y rangos flotantes
2. Inflado: npm ls root missing como vulnerabilidad
3. FP: dependencyRootCount=0 en locks v3
4. Falta: npm ci por proyecto
5. No revisado: CVEs
6. Nuevo: locks desincronizados
7. Poco realista: migrar todo a pnpm
8. Cambio final: CI reproducible primero

## Resolución

Los hallazgos sin evidencia suficiente se rebajan a sospecha o falso positivo probable. El informe final prioriza CI/QA/supply chain y evita exagerar riesgos AppSec no confirmados.
