# RONDA 1 — Adversarial 07_tests_qa_reliability

1. Sólido: 212 tests pero sin CI
2. Inflado: asumir cero cobertura
3. FP: node_modules parcial no implica fallo producto
4. Falta: ejecución real
5. No revisado: cobertura
6. Nuevo: proyectos sin tests
7. Poco realista: build de 52 proyectos local
8. Cambio final: CI por proyecto modificado

## Resolución

Los hallazgos sin evidencia suficiente se rebajan a sospecha o falso positivo probable. El informe final prioriza CI/QA/supply chain y evita exagerar riesgos AppSec no confirmados.
