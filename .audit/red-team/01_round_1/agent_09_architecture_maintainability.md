# RONDA 1 — AGENTE 9 — Arquitectura, mantenibilidad y diseño

## Mapa de arquitectura inferido

Patrón dominante: WebPart -> componente -> hook -> service -> repository -> SharePoint/API/localStorage, con models/utils por proyecto. packages/spfx-common aporta utilidades compartidas como createSafeExternalLink y classifyAsyncState.

## Riesgos

- Confirmado: arquitectura homogénea pero repetida 52 veces, con alto coste de coherencia.
- Confirmado: repositorios/componentes grandes concentran transporte, parsing, cache y reglas.
- Confirmado: spfx-common es útil pero no todos los proyectos consumen helpers seguros de navegación.
- Sospecha razonable: visualizador-de-elementos-de-biblioteca-y-papelera-superior mezcla o deriva de dominio funcional.

## Cambios pequeños de alto valor

- Reutilizar helper seguro de enlaces.
- Estandarizar error handling y estados async.
- Extraer helpers puros de repos grandes.
- Completar localización visible.

## Cambios grandes que requieren decisión

- Orquestación raíz para 52 proyectos.
- Estrategia única de datos/cache/persistencia.
- Redefinición de alcance de visualizador si el owner confirma drift.
