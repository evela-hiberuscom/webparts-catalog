# POST-AGENTE D — Priorizador de riesgo real

## Modelo usado

Riesgo final = impacto x probabilidad x exposición x confianza.

| Prioridad | ID | Severidad | Motivo |
| --- | --- | --- | --- |
| P1 | CI-001 | High | Sin CI no hay control de build/test/security en PR |
| P1 | QA-001 | High | 212 tests dormidos sin ejecución automática |
| P2 | SUPPLY-001 | Medium | Sin SBOM/SCA/dependency automation |
| P2 | SUPPLY-002 | Medium | Rangos flotantes + skew sin guardrails |
| P2 | SUPPLY-003 | Medium | Posible fallo npm ci por locks desync |
| P2 | SMELL-002 | Medium | Errores invisibles en producción |
| P2 | SEC-004 | Medium | URL externa configurable no alineada con gobernanza |
| P2 | BUG-001 | Medium | Riesgo funcional con títulos SharePoint especiales |
| P3 | SEC-001/002/003 | Low | Higiene y privacidad local |
| P3 | SMELL-001/ARCH-001/DOC-001 | Low | Mantenibilidad/UX/docs |
