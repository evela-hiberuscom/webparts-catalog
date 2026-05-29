# Matriz consolidada de hallazgos

| ID | Título | Categoría | Severidad | Confianza | Estado |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | Airtable PAT presente en .env.local local e ignorado | Secretos | Low | High | Confirmado |
| SEC-002 | window.open('_blank') sin noopener/noreferrer ni allowlist de URL | Seguridad aplicativa | Low | High | Confirmado |
| SEC-003 | Persistencia local de respuestas/identidad ligera en localStorage | Privacidad e integridad cliente | Low | High | Confirmado |
| SEC-004 | JsonUrl configurable sin restricción same-origin en mis-accesos-recientes | Seguridad aplicativa / gobierno de dominios | Medium | Medium | Sospecha razonable |
| SUPPLY-001 | Sin SCA/SBOM/Dependabot/Renovate versionados | Supply chain | Medium | High | Confirmado |
| SUPPLY-002 | Rangos flotantes y skew de lockfiles entre 52 proyectos | Supply chain / reproducibilidad | Medium | High | Confirmado |
| SUPPLY-003 | Lockfiles potencialmente desincronizados con @paquete/spfx-common | Supply chain / reproducibilidad | Medium | Medium | Sospecha razonable |
| CI-001 | Ausencia total de workflows CI/CD versionados | CI/CD | High | High | Confirmado |
| QA-001 | Tests existentes no ejecutados automáticamente | QA / release readiness | High | High | Confirmado |
| QA-002 | Cobertura desigual: varios proyectos sin tests y gaps negativos/a11y/throttling | QA | Medium | High | Confirmado |
| SMELL-001 | Strings visibles hardcodeados pese a loc files | Localización / UX | Low | High | Confirmado |
| SMELL-002 | Catch silenciosos/fallbacks sin diagnóstico | Observabilidad / mantenibilidad | Medium | High | Confirmado |
| BUG-001 | Uso frágil de getByTitle con encodeURIComponent en repositorios SharePoint | Bug funcional | Medium | Medium | Sospecha razonable |
| ARCH-001 | Repositorios/componentes grandes concentran transporte, parsing y reglas | Arquitectura | Low | High | Confirmado |
| DOC-001 | Drift funcional/nombre en visualizador de biblioteca y papelera | Documentación / producto | Low | Medium | Sospecha razonable |
| TOOL-001 | Cobertura limitada por herramientas no disponibles/no ejecutadas | Zona no cubierta | Info | High | No cubierto |
