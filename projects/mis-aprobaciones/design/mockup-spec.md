# Mockup Spec - Mis aprobaciones

## Objetivo

Mostrar de forma clara qué aprobaciones requieren acción inmediata y permitir abrir el detalle sin romper el flujo del usuario.

## Estructura

- Encabezado con título y descripción opcional.
- Resumen compacto con contadores.
- Lista vertical de aprobaciones ordenadas por prioridad temporal.
- Banner discreto para datos parciales.
- Mensaje de estado vacío o de error cuando corresponda.

## Estados

- `loading`: spinner y mensaje de carga.
- `ready`: resumen + lista de tarjetas.
- `empty`: aviso de que no hay aprobaciones visibles.
- `partialData`: banner de aviso y lista utilizable.
- `error`: mensaje seguro con acción de reintento.

## Tarjeta de aprobación

- Título de la aprobación.
- Solicitante.
- Origen.
- Fecha límite.
- Estado visible.
- Botón para abrir el detalle si existe URL segura.

## Reglas visuales

- Mantener legibilidad y densidad media.
- Prioridad visual alta para vencidas.
- Foco visible y navegación por teclado.
- No usar elementos decorativos sin función.
