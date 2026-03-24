# Project Intelligence

## Row Source
- `rowId`: recKUTdRJitx5VvpA
- `name`: Checklist de onboarding
- `slug`: checklist-de-onboarding
- `waveNumber`: 5

## Specification Review
- suficiencia: suficiente para implementar un checklist real con lista, JSON o configuracion local.
- gaps detectados: no hay esquema cerrado de variantes; se deduce como cadena libre para no bloquear la UI ni la ingestión.
- supuestos: el orden canónico es fase ascendente, obligatorio antes que opcional y, como desempate, prioridad/titulo.

## Inference Log
- observado:
  - la row pide un checklist secuencial con badging de obligatorio, opcional y parcial.
  - la repositorio debe aceptar `SharePointList`, `JsonUrl` y `StaticConfig`.
  - la URL de lista puede llegar como vista `AllItems.aspx`.
- inferido:
  - `variant` se trata como etiqueta libre para no acotar la segmentacion de onboarding.
  - la vista por defecto debe mostrar una checklist legible en layout estrecho y timeline en ancho.
  - el contenido local de `staticConfigJson` puede actuar como ejemplo de arranque sin requerir provisioning manual inmediato.
- pendiente de validar:
  - si la tabla real usa campos alternativos para `Variant`, `Phase` o `Mandatory`.
  - si el sitio final necesita uno o mas listados adicionales para enlaces relacionados.

## Risks
- La variante viene sin enum cerrado, asi que futuras filas con valores nuevos deberan seguir tratandola como texto libre.
- Si la fuente real devuelve URLs cross-origin, el repositorio las rechazara por seguridad.
- La lista SharePoint puede venir con URL de vista; ya queda normalizada antes de construir `GetList(@listUrl)`.

## Error History
- `ISSUE-006`: el scaffold no puede dejar el proyecto anidado; este worker verifico el root real antes de implementar.
- `ISSUE-028`: no aplica a este checklist porque no existe persistencia de submit; se mantiene el criterio de no escribir estado local antes de exito remoto en workers que si persistan.
- `ISSUE-029`: aplicado en el repositorio para recortar `Forms/AllItems.aspx` a la raiz de lista.
