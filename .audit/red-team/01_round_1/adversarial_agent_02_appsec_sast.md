# RONDA 1 — Adversarial 02_appsec_sast

1. Sólido: no XSS/eval/iframe confirmado
2. Inflado: target=_blank con rel=noreferrer
3. FP: innerHTML en tests
4. Falta: Semgrep y runtime
5. No revisado: todos los JsonUrl
6. Nuevo: mis-accesos-recientes
7. Poco realista: prohibir todo fetch
8. Cambio final: severidad baja/media

## Resolución

Los hallazgos sin evidencia suficiente se rebajan a sospecha o falso positivo probable. El informe final prioriza CI/QA/supply chain y evita exagerar riesgos AppSec no confirmados.
