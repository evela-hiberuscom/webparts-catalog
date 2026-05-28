# RONDA 2 — Agent 02 — Seguridad

## Hallazgos ajustados

- SEC-R2-01: .env.local contiene AIRTABLE_API_TOKEN local, ignorado y no trackeado. Severidad repositorio: Low.
- SEC-R2-02: window.open inseguro concentrado en 5 _blank; 2 _self no son reverse-tabnabbing. Falta allowlist de URL/protocolo.
- SEC-R2-03: localStorage confirmado en microencuesta y pulso-del-dia; riesgo de privacidad/integridad bajo-medio.
- SEC-R2-04: JsonUrl configurable en mis-accesos-recientes sin same-origin confirmado. Severidad Medium, confianza Medium.

## Negativos confirmados

No se confirma dangerouslySetInnerHTML, eval, new Function, document.write ni iframe.

## Herramientas no disponibles

Semgrep, gitleaks y trivy no disponibles; no se ejecutó npm audit por restricción de no enviar datos al registry.
