# Mockup spec - Conoce al equipo

## Objetivo visual

Presentar una cabecera clara, cálida y muy legible, seguida de una rejilla de tarjetas de miembros con jerarquía visual fuerte entre foto, nombre, rol, bio y acción.

## Layout

- Hero superior con título, descripción y metadatos de fuente.
- Grid adaptativo de tarjetas.
- En ancho reducido, una sola columna con prioridad para nombre, rol y acción.

## Estados

- `loading`: tarjetas esqueleto con avatar, línea de título y bloque de texto.
- `ready`: tarjetas completas con foto o iniciales.
- `empty`: mensaje informativo simple.
- `partialData`: aviso visible y tarjetas marcadas como parciales.
- `error`: mensaje seguro con reintento.

## Reglas

- No depender solo del color para indicar parcialidad.
- Mantener foco visible y enlaces accesibles.
- No usar imágenes remotas inseguras.
- Si falta foto, mostrar iniciales o avatar de Persona.
