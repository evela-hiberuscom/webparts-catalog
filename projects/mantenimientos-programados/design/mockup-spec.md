# Mockup spec - Mantenimientos programados

## Objetivo visual

Transmitir control operativo y anticipacion. La pieza debe avisar sin generar alarma innecesaria y priorizar lo que esta en curso o va a ocurrir pronto.

## Estructura

- Hero superior con contexto y origen.
- Barra de filtro con toggle de completados y resumen numerico.
- Timeline vertical de tarjetas compactas.

## Estados

- `loading`: skeleton cards alineadas con la timeline.
- `ready`: tarjetas con badges de estado e impacto.
- `empty`: mensaje discreto con posibilidad de reintento.
- `partialData`: banner de advertencia suave y badges `Parcial`.
- `error`: mensaje seguro con reintento.

## Reglas

- El estado temporal nunca depende solo del color; siempre lleva texto.
- La timeline debe seguir siendo legible en una columna.
- Las acciones de detalle se muestran solo si hay URL segura.
