# Mockup Spec

## Objective
- Mostrar incidencias activas o monitorizadas de forma compacta, legible y orientada a acción.

## Layout
- Cabecera con título, subtítulo y chips de estado.
- Aviso de datos parciales cuando falten campos relevantes.
- Grid de cards responsivo.
- Pie con resumen de resolución y configuración activa.

## Visual rules
- Fondo claro con acento Hiberus en azul y violeta.
- Cards blancas con borde suave y badge pill.
- Severidad visible como texto, no solo como color.
- CTA de detalle como link claro y accesible.

## States
- `loading`: shimmer de cards.
- `ready`: cards con severidad, impacto, workaround, ETA y enlace.
- `empty`: mensaje sin incidencias destacadas.
- `partialData`: banner de aviso y cards con campos ausentes.
- `error`: mensaje de error y acción de reintento.

## Responsive behavior
- Desktop: grid auto-fit con mínimo de 260px.
- Narrow: stack vertical con badges alineados al inicio.

## Accessibility
- Headings semánticos.
- Badges con texto.
- Links con atributos seguros.
- Contraste AA para texto principal.
