# RONDA 1 — AGENTE 8 — CI/CD, permisos y gobernanza

## Alcance

GitHub Actions, permisos, secretos, gates, publicación, branch protection y gobernanza.

## Hallazgos

- Confirmado: no hay .github/workflows versionados.
- Confirmado: no hay permisos YAML que auditar ni pull_request_target peligroso detectado localmente.
- Confirmado: no hay gates de SAST/SCA/secrets/build/test en CI local.
- No cubierto: branch protection, required checks, environments y secretos GitHub por no estar en repo.
- Confirmado: despliegue SPFx no muestra permisos API extra en package-solution.json.

## Recomendaciones

Crear workflow con permissions: contents: read, CI de build/test por proyecto, SCA/SBOM/secrets, branch protection y revisión de lockfiles.
