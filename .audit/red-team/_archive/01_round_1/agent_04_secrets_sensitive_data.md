# RONDA 1 — AGENTE 4 — Secretos y datos sensibles

## Alcance

Búsqueda de secretos hardcodeados, ficheros de entorno, tokens funcionales falsos positivos y PII cliente.

## Herramientas usadas

Escaneo heurístico local enmascarado. Gitleaks/Trivy secret scanner no disponibles.

## Hallazgos

- Confirmado: .env.local existe localmente y contiene AIRTABLE_API_TOKEN enmascarado. No está trackeado por Git y .gitignore lo cubre.
- Falsos positivos probables: 73 hits restantes por nombres como audienceTokens/profileTokens/departmentTokens son campos funcionales, no credenciales.
- Confirmado: scripts/lib/airtable.mjs usa AIRTABLE_API_TOKEN desde entorno para tooling local.
- Confirmado: localStorage guarda datos de comportamiento en microencuesta/pulso-del-dia.

## Evidencia

- secret-scan-local-masked.json: valor enmascarado, sin imprimir secreto completo.
- env-local-tracking-status.txt: git ls-files vacío para .env.local.
- .gitignore: líneas 1-4 ignoran .env* local.

## No cubierto

Historial Git con gitleaks, validez/scope del token, secretos de CI, artefactos ignorados.

## Recomendaciones

Rotar si el entorno se compartió, ejecutar gitleaks en CI, mantener env fuera de Git y documentar tratamiento de PII local.
