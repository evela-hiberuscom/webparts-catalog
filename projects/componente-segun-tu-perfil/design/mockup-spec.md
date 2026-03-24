# Mockup Spec - Componente segun tu perfil

## Objetivo
Renderizar una variante de contenido, acceso o mensaje según tokens de perfil, con fallback genérico y estados explícitos.

## Estructura visual
- Cabecera con título, descripción y etiqueta del origen.
- Columna lateral con tokens de perfil, modo de audiencia y fallback.
- Panel principal con la variante resuelta, accent line violeta y CTAs pill.
- Estados visibles para `loading`, `empty`, `partialData` y `error`.

## Comportamiento
- Si hay match específico, se muestra la variante personalizada.
- Si no hay match y existe genérica, se muestra fallback genérico y se marca como `partialData`.
- Si la fuente está vacía o ausente, se muestra `empty`.
- Si la fuente falla o el JSON es inválido, se muestra `error`.

## Tokens de referencia
- `primary`: `#1032CF`
- `accent`: `#5B53FF`
- `surface`: `#F7F8FD`
- `text`: `#111111`
- `heading font`: `Montserrat`
- `body font`: `Lato`

## Mockup textual
1. Hero compacto con linea accent y badge de origen.
2. Tarjeta de contexto con chips de tokens.
3. Tarjeta principal con titulo de variante, resumen, cuerpo, tags y CTA.
4. Mensaje de estado en flujo claro cuando no hay datos o el origen falla.

## Reglas
- No ocultar el estado real con muestras sintéticas.
- No mostrar atributos sensibles innecesarios.
- Mantener diseño responsive dentro del ancho del web part.
