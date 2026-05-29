# RONDA 1 — AGENTE 7 — Tests, QA y fiabilidad

## Alcance

Tests unitarios, integración/e2e, cobertura, flakiness, scripts de validación y release QA.

## Evidencia

- source files: 1057
- test files: 212
- proyectos sin tests detectados: objetivos-del-area, panel-de-campana-interna, presencia-de-sedes, ruta-guiada, tarjeta-de-decision-rapida, turnos-guardias-o-disponibilidad
- scripts build por proyecto: heft build --clean --production && heft test --production && heft package-solution --production.

## Hallazgos

- Confirmado: hay base de tests amplia pero no hay CI que la ejecute.
- Confirmado: no se ejecutó build/test en esta auditoría por restricción de no generar artefactos.
- Confirmado: root node_modules ausente; entorno incompleto para validación agregada.
- Sospecha razonable: flakiness en scanEngine/useScanEngine por asincronía, throttling y cache.
- Confirmado: faltan tests negativos/a11y/throttling/URLs inválidas en el alcance muestreado.

## Recomendaciones

CI por proyecto modificado, cobertura real, tests negativos 403/404/429, accesibilidad con axe y smoke de packaging.
