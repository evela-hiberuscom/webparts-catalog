# Mockup Spec - Inicia una solicitud

## Objetivo visual

Presentar un launcher claro y sobrio para procesos habituales, con jerarquía muy simple:

1. Cabecera con título, subtitulo y origen del catalogo.
2. Filtros por categoria como pills accesibles.
3. Grid de tarjetas con descripcion, prerequisitos y accion principal.
4. Estado vacio, parcial y error sin ruido visual.

## Decisiones de diseño

- Cabecera sobre fondo azul oscuro con acento violeta.
- Tarjetas blancas con borde suave y sombras muy ligeras.
- Boton principal en formato pill.
- Filtros por categoria en formato pill con estado activo evidente.
- Los prerequisitos se muestran en un bloque secundario con borde izquierdo de acento.

## Estados

- `loading`: mensaje corto de carga.
- `ready`: grid de solicitudes y filtro.
- `partialData`: grid con aviso superior.
- `empty`: bloque informativo con llamada a configurar el catalogo.
- `error`: mensaje seguro y no tecnico.

## Reglas de accesibilidad

- Todos los botones tienen foco visible.
- El filtro usa `aria-label` y `aria-pressed`.
- El grid usa tarjetas con titulo semantico.
- La tarjeta sin enlace no se presenta como accionable.
