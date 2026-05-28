# Decisión final de release readiness

1. **¿El repo está listo para producción?**
   Sí para cierre repo-local condicionado: los bloqueos de CI/build/test/SCA y los hallazgos AppSec confirmados quedan remediados o cubiertos por guardrails versionados.

2. **¿Qué bloquea producción?**
   Nada repo-local de severidad High/Medium. Quedan controles externos de tenant/GitHub: branch protection, ejecución real de workflows, Renovate habilitado, app catalog, CSP y permisos efectivos.

3. **¿Qué se corrigió en esta remediación?**
   CI, SCA/SBOM, Renovate, lockfiles, pinning de dependencias, `window.open`, `JsonUrl` same-origin, TTL/purga de `localStorage`, escapes OData para `getByTitle`, catches prioritarios, tests mínimos en proyectos sin tests y documentación del visualizador.

4. **¿Qué requiere refactor/arquitectura?**
   Repositorios grandes, localización completa y cobertura 100% siguen como deuda P3/mejora continua, no como bloqueo de cierre.

5. **¿Qué riesgo residual queda?**
   Runtime SharePoint/tenant, CVEs transitivos detectables solo con ejecución CI/red, branch protection y permisos reales no cubiertos localmente.

6. **¿Qué checks entran en CI?**
   npm ci/build/test por proyecto modificado, secret scan, SCA/SBOM, pinning de dependencias, lockfile consistency y guardrails de remediación.

7. **¿Qué debe revisarse manualmente por una persona?**
   App catalog, branch protections, Renovate habilitado, ejecución de workflows en GitHub, CSP/permisos reales y rotación del PAT local si procede.
