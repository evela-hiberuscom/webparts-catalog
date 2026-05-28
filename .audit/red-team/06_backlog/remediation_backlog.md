# Remediation backlog

| Prioridad | ID hallazgo | Issue | Tipo | Severidad | Archivos | Descripción | Criterios de aceptación | Tests | Esfuerzo | Dependencias |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | CI-001 | Crear workflow PR de build/test por proyecto modificado | Hardening | High | .github/workflows/ci.yml | Ejecutar validación automática | Workflow corre en PR y falla ante build/test roto | heft build/test | M | Ninguna |
| P1 | QA-001 | Activar ejecución de tests y cobertura | QA | High | projects/* | 212 tests deben ejecutarse en CI | Reporte de tests y cobertura disponible | Jest/Heft | M | CI-001 |
| P2 | SUPPLY-001 | Añadir Dependabot/SBOM/SCA | Supply | Medium | .github/dependabot.yml | Automatizar revisión de dependencias | PRs de dependencias y SBOM artifact | npm audit/CycloneDX en CI | M | CI-001 |
| P2 | SUPPLY-003 | Verificar/regenerar lockfiles desincronizados | Supply | Medium | projects/*/package-lock.json | Asegurar npm ci reproducible | npm ci pasa en proyectos afectados | npm ci --ignore-scripts | M | CI-001 |
| P2 | SEC-004 | Restringir JsonUrl en mis-accesos-recientes | Security | Medium | mis-accesos-recientes | Aplicar same-origin/allowlist | URL externa no autorizada falla con mensaje claro | Tests URL externa/relativa | S | Ninguna |
| P2 | SMELL-002 | Eliminar catch silenciosos prioritarios | Quality | Medium | repos/hooks/utils | Registrar/propagar errores | No quedan catch vacíos en rutas críticas | Tests de fallo | M | Ninguna |
| P2 | BUG-001 | Corregir getByTitle frágil | Bug | Medium | mis-documentos-utiles; mis-tareas-y-pendientes | Escapar listas SharePoint correctamente | Títulos con comillas/&/# funcionan | Unit tests endpoint | S | Ninguna |
| P3 | SEC-002 | Normalizar window.open | Security | Low | 5 componentes | Añadir noopener/noreferrer y helper | window.opener null | Unit test helper | S | Ninguna |
| P3 | SEC-003 | Documentar y limitar localStorage | Privacy | Low | microencuesta; pulso-del-dia | TTL/purga/no PII directa | README y tests storage | Unit tests | S | Ninguna |
| P3 | SMELL-001 | Migrar copy visible a loc | i18n | Low | components/hooks | Eliminar hardcoded strings visibles | Claves en es-es/en-us/mystrings | Build/localization | L | Ninguna |
