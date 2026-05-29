# Plan de hardening CI/CD y supply chain

## Objetivo

Pasar de auditoría manual local a controles reproducibles en PR sin introducir permisos excesivos.

## Workflow mínimo recomendado

- GitHub Actions con permissions: contents: read.
- Detectar proyectos modificados bajo projects/*.
- Ejecutar npm ci --ignore-scripts inicialmente en proyecto modificado.
- Ejecutar npm run build del proyecto si el entorno lo permite.
- Publicar logs/test results como artefacto.

## SAST

- Semgrep en CI si la organización lo aprueba.
- CodeQL JS/TS.
- Fortify solo si ya existe licencia/configuración.

## SCA/SBOM

- npm audit controlado con umbral High/Critical y allowlist temporal.
- CycloneDX npm para SBOM por proyecto o por release.
- Dependency review si GitHub Advanced Security está disponible.

## Secret scanning

- Gitleaks en PR con baseline y reglas allowlist para *Tokens funcionales.
- GitHub secret scanning si está disponible.
- Nunca imprimir valores completos en logs.

## Trivy / IaC

- Trivy fs cuando esté instalado; Docker/IaC actualmente no aplica porque no hay ficheros detectados.

## npm hardening

- Revisar rangos flotantes; pinning para SPFx/core y paquetes críticos.
- Validar lockfile en PR.
- Evaluar cooldown/minimum release age con Renovate/Dependabot.
- Mantener lifecycleScripts vigilados; hoy están vacíos.

## Publicación SPFx

- Site collection app catalog por defecto.
- No añadir webApiPermissionRequests sin ADR/aprobación.
- Artefactos .sppkg fuera de Git salvo política explícita.

## Branch protection

- PR obligatorio, review, status checks, bloquear pushes directos a main y CODEOWNERS si hay owners por oleada/proyecto.
