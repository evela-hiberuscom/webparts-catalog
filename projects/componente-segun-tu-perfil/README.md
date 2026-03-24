# Componente según tu perfil

Web part SPFx para resolver y renderizar una variante de contenido según tokens de perfil, con soporte para `SharePointList`, `JsonUrl` same-origin y `StaticConfig`.

## Datos clave
- `rowId`: `recqkzUHilH8lKoGy`
- `archetype`: `audience`
- `wave`: `3`
- `default source`: `SharePointList`
- `fallback`: `generic`

## Desarrollo
- `npm install`
- `npm run build`

## Contrato local
- El origen canónico es la lista `ProfileVariants`.
- `JsonUrl` solo admite orígenes same-origin o relativos.
- `StaticConfig` se usa para escenarios de demo o preview controlado.

## Estados
- `loading`
- `ready`
- `partialData`
- `empty`
- `error`

## Documentación interna
- `design/mockup-spec.md`
- `project-intelligence/project-intelligence.md`
- `provisioning/provisioning-definition.json`
