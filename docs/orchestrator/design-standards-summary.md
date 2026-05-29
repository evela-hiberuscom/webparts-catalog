# Design Standards Summary

Fecha: 2026-05-28

## Arquitectura esperada

- SPFx 1.22.2, React 17, Fluent UI v8 y TypeScript estricto.
- Componentes pequeños y tipados; lógica reutilizable en hooks; reglas de aplicación en services; acceso SharePoint/Graph/API en repositories.
- Webparts governance como proyectos SPFx independientes; reutilización mediante contratos documentales en `_governance/docs/shared-*` hasta estabilizar backend.

## Estructura esperada de proyectos

- `package.json`, `package-lock.json`, `config/config.json`, `config/rig.json`, `config/typescript.json`, `src/webparts/<webpartName>/`, `README.md` y documentación propia.
- `docs/validation/` se usa para evidencias de esta orquestación.
- `docs/red-team/` se usa para auditorías adversariales por proyecto.

## Estilo de código y componentes

- Fluent UI v8 y theme del tenant cuando sea posible.
- Estados visibles: carga, vacío, error, sin permisos, éxito, datos parciales y reintento.
- ErrorBoundary raíz con MessageBar y strings localizados.
- Sin literales UI hardcodeados fuera de loc.

## Servicios, mocks y datos

- Repositorios/adaptadores encapsulan SharePoint, Graph, REST o mocks.
- Los mocks deben representar escenarios realistas y declarar dependencia backend cuando aplique.
- No se usan mocks para ocultar fallos de integración ni operaciones destructivas.

## Testing, seguridad y documentación

- Tests reales de reglas, servicios, hooks y componentes cuando el arnés lo permite.
- Cobertura objetivo 100%; si no existe arnés dedicado, se registra excepción técnica sin declarar porcentaje verificado.
- Mínimo privilegio, sin secretos, sin permisos nuevos ni dominios externos sin ADR/revisión.
- READMEs y docs deben explicar instalación, build, tests, datos mock, backend pendiente, limitaciones y aceptación.

## UX/UI

- Claridad sobre densidad visual; webparts deben convivir con SharePoint y degradar en anchos reducidos.
- Accesibilidad: contraste, foco visible, teclado, semántica y no depender solo de color.
- Branding personal del proyecto solo si no contradice SPFx, SharePoint, Fluent UI o accesibilidad.

## Naming y commits

- Slugs kebab-case para proyectos; clases WebPart PascalCase.
- Commits recomendados por prompt: `fix(<project-name>): validate build lint tests and docs`, pero no se harán commits automáticos sin permiso explícito.
