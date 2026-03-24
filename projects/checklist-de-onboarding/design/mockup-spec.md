# Mockup Spec - Checklist de onboarding

## Intencion
Mostrar una lista secuencial de pasos de incorporacion que ayude a entender el progreso real del onboarding sin ruido visual.

## Estructura
- Cabecera con titulo, descripcion y metadatos de contexto.
- Filtros por `Variante` y `Fase`.
- Lista secuencial de tarjetas o timeline segun ancho disponible.
- Estados claros para `loading`, `ready`, `empty`, `partialData` y `error`.

## Jerarquia visual
- Prioridad 1: pasos obligatorios.
- Prioridad 2: fase actual.
- Prioridad 3: pasos restantes.

## Modelo de tarjeta
- Titulo del paso.
- Descripcion opcional.
- Badges de fase, variante, obligatoriedad y parcialidad.
- Enlace relacionado solo cuando exista y sea seguro.

## Layout responsive
- En ancho amplio: lista con sensacion de timeline y rail lateral.
- En ancho estrecho: lista simple, priorizando titulo, fase y obligatoriedad.

## Reglas de accesibilidad
- Titulo de seccion claro.
- Badges con texto, no solo color.
- Enlaces con objetivo explicito.
- Estados vacio y error con mensaje utilizable.

## Notas de implementacion
- La fuente de datos puede ser lista SharePoint, JSON same-origin o configuracion local.
- Las URL de lista se normalizan desde vistas `AllItems.aspx` a la raiz de la lista.
- El proyecto es de solo lectura sobre su checklist; no persiste respuesta de usuario.
