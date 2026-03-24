# Mockup Spec

## Objetivo
Representar una checklist operativa para offboarding, transferencia o cambio de rol dentro de SharePoint, con lectura rápida, estados explícitos y recursos relacionados seguros.

## Layout
- Cabecera con título, descripción y metadatos de contexto.
- Filtros de escenario y fase.
- Resumen de métricas: visibles, críticos, parciales y total.
- Lista secuencial de pasos con prioridad visual para críticos.
- Estado vacío, parcial y error claramente diferenciados.

## Interacción
- `Escenario` filtra por `offboarding`, `transfer`, `roleChange` o `generic`.
- `Fase` reduce el alcance sin ocultar el contexto.
- `Restablecer` vuelve a los filtros iniciales.
- `Recargar` reconsulta la fuente activa.

## Estados
- `loading`: skeleton y spinner.
- `ready`: lista normal con badges de escenario, fase y criticidad.
- `empty`: mensaje claro de ausencia de datos.
- `partialData`: advertencia visible sin bloquear el uso.
- `error`: mensaje seguro con opción de reintentar.

## Contenido por tarjeta
- Título del paso.
- Descripción opcional.
- Badge de escenario.
- Badge de fase.
- Badge de criticidad cuando aplique.
- Badge de parcialidad cuando falten datos relevantes.
- Enlace relacionado solo si es same-origin y seguro.

## Responsive
- En ancho reducido, apilar cabecera, filtros y acciones.
- Priorizar título, escenario y criticidad sobre detalles secundarios.

## Accessibility
- Mantener jerarquía semántica clara.
- Asegurar foco visible en acciones.
- Evitar enlaces no seguros o ambiguos.
