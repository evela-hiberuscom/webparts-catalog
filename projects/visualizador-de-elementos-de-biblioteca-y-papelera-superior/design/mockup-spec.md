# Mockup Spec

## Goal
Mostrar en una sola tarjeta la relación entre una biblioteca seleccionada y la papelera de primer nivel del sitio.

## Layout
- Cabecera compacta con título y estado.
- KPI de elementos de la biblioteca.
- KPI de elementos en papelera.
- KPI de tamaño agregado de papelera cuando exista.
- KPI de ratio papelera/biblioteca.
- Badge de salud.
- Acciones: refrescar, abrir biblioteca y abrir papelera.

## States
- `loading`: skeleton cards o placeholders equivalentes.
- `ready`: biblioteca, papelera, tamaño, ratio, salud y acciones.
- `empty`: sin datos relevantes o biblioteca sin residuos significativos.
- `partialData`: falta tamaño, faltan metadatos o el contexto no permite completar alguna métrica.
- `error`: mensaje seguro y acción de refresco.

## Notes
- La biblioteca objetivo es obligatoria para que la tarjeta tenga sentido funcional.
- La papelera de segundo nivel queda fuera del objetivo canónico actual.
- La relación biblioteca/papelera no es 1:1 automática; si se necesita exactitud por origen habrá que filtrar metadatos de papelera.
- El código actual del proyecto no implementa todavía este mockup: hoy renderiza una calculadora de papelera de nivel 1 + nivel 2.
