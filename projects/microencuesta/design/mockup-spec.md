# Mockup Spec

## Objetivo UX

Permitir que un empleado responda una pregunta en menos de diez segundos y siga navegando sin friccion. La pieza debe convivir con otros web parts, ocupar poco espacio y ser interpretable incluso en columnas estrechas.

## Estructura

1. Eyebrow compacta con tono de participacion ligera.
2. Titulo `Microencuesta`.
3. Subtitulo configurable desde property pane.
4. Bloque de pregunta con texto principal y descripcion opcional.
5. Grupo de radios accesible para 2-5 opciones.
6. CTA primario de envio y CTA secundario de refresco.
7. Mensajes de estado para `loading`, `empty`, `error`, `partialData` y `success`.

## Apariencia

- tarjeta compacta con fondo claro, borde azul muy suave y radio medio
- jerarquia tipografica sobria, adaptada al host de SharePoint
- color de acento tomado de la identidad ya generada (`#1032CF`)
- mensajes positivos en verde suave y mensajes de error en rojo claro
- responsive: en anchos estrechos los botones pasan a columna

## Estados

- `loading`: spinner y copy corto
- `ready`: pregunta, opciones y acciones
- `empty`: mensaje de que no hay una pregunta activa
- `error`: mensaje de carga fallida y opcion de refresco
- `partialData`: banner informativo si faltan campos opcionales
- `success`: confirmacion y opcion elegida

## Accesibilidad

- `ChoiceGroup` de Fluent UI para radios
- foco visible en acciones y opciones
- textos sin depender solo del color
- mensajes con `role="status"` y ErrorBoundary con `MessageBar`
