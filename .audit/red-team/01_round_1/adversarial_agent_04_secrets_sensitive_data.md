# RONDA 1 — Adversarial 04_secrets_sensitive_data

1. Sólido: .env.local contiene token local
2. Inflado: llamarlo fuga confirmada
3. FP: audienceTokens/profileTokens
4. Falta: historial gitleaks
5. No revisado: CI secrets
6. Nuevo: PII ligera storage
7. Poco realista: imprimir secreto
8. Cambio final: rotación preventiva

## Resolución

Los hallazgos sin evidencia suficiente se rebajan a sospecha o falso positivo probable. El informe final prioriza CI/QA/supply chain y evita exagerar riesgos AppSec no confirmados.
