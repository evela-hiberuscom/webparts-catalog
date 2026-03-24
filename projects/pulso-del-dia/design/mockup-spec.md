# Mockup Spec - Pulso del día

## Objective
- Capturar una señal diaria mínima del usuario sin sacar al contenido de SharePoint del foco.

## Visual Direction
- Base clara con superficie blanca y halo azul/violeta suave.
- Tipografía sobria, peso alto en titular y cuerpo legible en una sola pantalla.
- Opciones como pills/cards interactivos con foco visible y estados claros.
- Acento Hiberus contenido, sin competir con el host de Microsoft 365.

## Layout
- Cabecera compacta con título, subtítulo, fuente y fecha.
- Panel principal con la pregunta diaria y 3-5 opciones.
- CTA primario para registrar respuesta.
- Mensajes diferenciados para carga, vacío, error, parcial y confirmación.

## States
- `loading`: spinner y tarjeta vacía.
- `ready`: prompt, opciones y CTA activo.
- `partialData`: banner de aviso y render usable con contexto visible.
- `empty`: mensaje neutro indicando que no hay pulso activo.
- `error`: mensaje seguro con reintento.

## Interaction
- Una sola opción seleccionable antes de enviar.
- El submit queda bloqueado si ya existe respuesta del día.
- La confirmación debe ser inmediata y legible.

## Accessibility
- Opciones navegables por teclado.
- El estado seleccionado debe ser explícito.
- El color no es el único indicador de disponibilidad o severidad.

