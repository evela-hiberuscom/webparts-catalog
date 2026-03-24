# Mockup Spec - Barra de Avisos Urgentes

## Intent
Mostrar una alerta crítica sin obligar al usuario a escanear la página.

## Visual Direction
- Fondo principal claro con contenedor elevado sutil.
- Encabezado corto con kicker, título y subtítulo.
- Badges de `source` y `partial data` en la cabecera.
- Banners por severidad con borde redondeado de 20px y accent bar vertical.

## States
- `loading`: spinner + skeleton lineal.
- `ready`: uno o varios banners ordenados por severidad y prioridad.
- `empty`: mensaje breve, sin ruido visual.
- `error`: mensaje seguro con botón de reintento.

## Banner Anatomy
- Badge de severidad.
- Título fuerte en Montserrat.
- Mensaje opcional en Lato.
- CTA pill si existe `ctaUrl`.
- Botón de cerrar opcional si el web part se configura como dismissible.

## Color Rules
- Critical: navy/blue con texto blanco.
- Warning: fondo cálido claro y accent amber.
- Info: fondo surface azul suave.
- Partial data: badge violeta discreto.

## Responsive Rules
- En ancho estrecho el header pasa a columna.
- Los banners ocupan todo el ancho disponible.
- El CTA cae debajo del texto si no cabe en una línea.

