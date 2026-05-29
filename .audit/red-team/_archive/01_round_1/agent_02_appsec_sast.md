# RONDA 1 — AGENTE 2 — AppSec / SAST manual y automatizado

## Alcance

Revisión OWASP aplicable a SPFx cliente: XSS, navegación externa, storage cliente, fetch/SPHttpClient, permisos declarados y errores.

## Archivos revisados

source-pattern-matches.json, source-pattern-counts.json, MicroSurvey, DailyPulse, MyUsefulDocuments, MyTasksAndPending, PageContextAssistant, reservas/favoritos y package-solution summaries.

## Herramientas usadas

Escaneo local heurístico y revisión manual. Semgrep/Sonar/Fortify no disponibles.

## Hallazgos

- Confirmado negativo: dangerouslySetInnerHTML=0, iframe=0, eval/new Function=0, document.write=0.
- Falso positivo probable: innerHTML aparece solo en tests como limpieza de contenedor.
- Confirmado: 5 window.open con _blank sin noopener/noreferrer ni helper de URL segura.
- Sospecha razonable R2: mis-accesos-recientes permite JsonUrl configurable con fetch directo sin same-origin confirmado.
- Confirmado: localStorage persiste respuestas/identidad ligera en microencuesta y pulso-del-dia.
- Confirmado positivo: webApiPermissionRequests vacío en las 52 soluciones.

## Incertidumbres

No se ejecutó Semgrep/Sonar ni análisis de flujo semántico. No se verificó CSP real del tenant.

## Recomendaciones

Usar helper createSafeExternalLink/validación same-origin, minimizar localStorage, revisar JsonUrl configurables, y añadir SAST en CI.
