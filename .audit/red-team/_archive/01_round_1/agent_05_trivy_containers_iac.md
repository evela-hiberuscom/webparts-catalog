# RONDA 1 — AGENTE 5 — Trivy, contenedores, IaC y configuración

## Alcance

Trivy FS, Dockerfiles, compose, Kubernetes/Helm/Terraform/Bicep/ARM y configuración SPFx.

## Herramientas usadas

Inventario local. Trivy no disponible.

## Hallazgos

- No cubierto: Trivy no disponible, por tanto no se afirman CVEs/misconfigs de filesystem.
- Confirmado negativo: iac-and-container-files.json está vacío; no se detectó Docker/IaC local.
- Confirmado: 52 soluciones con skipFeatureDeployment=false, webApiPermissionRequests=[] e includeClientSideAssets=true.
- Falso positivo probable: parse errors de manifests se deben a JSONC con comentarios SPFx, no a manifests rotos.

## Recomendaciones

Integrar Trivy/SBOM en CI si el entorno lo permite; usar parser JSONC para manifests SPFx; no exigir escaneo Docker si no hay Dockerfiles.
