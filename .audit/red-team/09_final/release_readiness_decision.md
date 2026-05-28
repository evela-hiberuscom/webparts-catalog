# Decisión final de release readiness

1. **¿El repo está listo para producción?**  
   No sin condiciones. No hay vulnerabilidad crítica confirmada, pero falta CI/build/test/SCA automatizado.

2. **¿Qué bloquea producción?**  
   CI-001, QA-001, SUPPLY-001/SUPPLY-002/SUPPLY-003 y SMELL-002 en rutas críticas.

3. **¿Qué puede corregirse rápido?**  
   window.open, parser JSONC en auditoría, rotación PAT, Dependabot inicial, lint no-empty catch, documentación localStorage.

4. **¿Qué requiere refactor/arquitectura?**  
   Repositorios grandes, estrategia de datos/cache, localización completa y orquestación raíz de los 52 proyectos.

5. **¿Qué riesgo residual queda?**  
   Runtime SharePoint/tenant, CVEs transitivos, branch protection y permisos reales no cubiertos localmente.

6. **¿Qué checks deben entrar en CI antes del siguiente release?**  
   npm ci/build/test por proyecto modificado, secret scan, SCA/SBOM, lint, lockfile consistency y manifest JSONC validation.

7. **¿Qué debe revisarse manualmente por una persona?**  
   Alcance funcional del visualizador, tratamiento de datos localStorage, app catalog, branch protections y excepciones de dominios externos.
