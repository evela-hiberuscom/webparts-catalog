# Matriz final de cobertura

| Área | Cubierta | Herramientas | Revisión manual | Limitaciones | Riesgo residual |
| --- | --- | --- | --- | --- | --- |
| Seguridad aplicativa | Parcial | Escaneo local | Sí | Sin Semgrep/runtime | Medium |
| Dependencias | Parcial | npm ls local, lockfile scan | Sí | Sin npm audit/CVEs | Medium |
| Secretos | Parcial | Heurístico local | Sí | Sin gitleaks histórico | Low-Medium |
| CI/CD | Sí local | Inventario .github | Sí | No branch protection | High |
| Docker | Sí negativo | Inventario | Sí | Sin Trivy | Low |
| IaC | Sí negativo | Inventario | Sí | Pipelines externos no cubiertos | Low |
| Calidad | Parcial | Pattern scan | Sí | Sin lint/build | Medium |
| Bugs | Parcial | Manual | Sí | Sin ejecución | Medium |
| Código muerto | Parcial | Pattern scan | Sí | Sin dead-code tool | Low |
| Arquitectura | Parcial | Métricas locales | Sí | Sin grafo completo | Low-Medium |
| Tests | Parcial | Inventario | Sí | No ejecutados | High |
| Documentación | Parcial | Inventario | Sí | No owner review | Low |
| Lógica de negocio | Parcial | Manual | Sí | Sin datos reales | Medium |
| Observabilidad | Parcial | catch scan | Sí | Sin runtime logs | Medium |
| Configuración | Parcial | package-solution scan | Sí | JSONC parser pendiente | Low |
| Licencias | No | No disponible | No | Sin license scanner | Unknown |
| Release readiness | Sí | Consolidación | Sí | Condicionado a CI | High operacional |
