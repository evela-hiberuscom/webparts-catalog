# Mockup Spec

## Goal
Mostrar en una sola tarjeta el espacio consumido por la papelera de primer y segundo nivel del sitio.

## Layout
- Cabecera compacta con título y estado.
- KPI principal de total agregado.
- KPI secundarios por nivel.
- Badge de salud.
- Acciones: refrescar y abrir papelera.

## States
- `loading`: skeleton cards.
- `ready`: total, nivel 1, nivel 2, salud y acciones.
- `empty`: sin datos relevantes.
- `partialData`: falta el tamaño de una etapa o el contexto no permite leerla.
- `error`: mensaje seguro y acción de refresco.

## Notes
- No debe representar una comparativa con biblioteca activa.
- Si la segunda etapa no es accesible, la UI debe indicarlo como limitación técnica explícita.
