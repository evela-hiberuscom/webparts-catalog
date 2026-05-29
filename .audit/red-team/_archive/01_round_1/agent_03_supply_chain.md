# RONDA 1 — AGENTE 3 — Dependencias, supply chain y SBOM

## Alcance

Package managers, lockfiles, rangos, lifecycle scripts, SBOM y automatización de dependencias.

## Evidencia

- package-manifest-summary.json: 54 package manifests.
- dependency-aggregate-summary.json: 207 ocurrencias de rangos flotantes; lifecycleScripts=[].
- lockfile-summary.json: 52 package-lock.json v3; versionSkewCount=139.
- tool-availability.txt: cyclonedx/cdxgen/dependency-check/trivy no disponibles.

## Hallazgos

- Confirmado: 52 lockfiles independientes para proyectos SPFx.
- Confirmado: rangos flotantes repetidos, incluidos @fluentui/react, typescript y css-loader.
- Confirmado positivo: no hay lifecycle scripts peligrosos declarados.
- Confirmado: no hay SBOM, Dependabot ni Renovate detectados.
- Sospecha razonable R2: 17 lockfiles pueden estar desincronizados con @paquete/spfx-common.
- No cubierto: CVEs; npm audit no se ejecutó para no consultar registry externo.

## Recomendaciones

Validar npm ci por proyecto, añadir Dependabot/SBOM/SCA, pinning controlado y revisión de lockfile en PR.
