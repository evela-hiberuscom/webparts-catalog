# Font strategy

Este proyecto no carga fuentes desde CDN externas.

La estrategia prevista es:
- `Montserrat` para títulos
- `Lato` para cuerpo
- alojamiento local en `src/assets/fonts/`
- uso de `@font-face` cuando se incorporen los ficheros `.woff2`

Hasta entonces, el CSS usa fallbacks seguros del sistema.
