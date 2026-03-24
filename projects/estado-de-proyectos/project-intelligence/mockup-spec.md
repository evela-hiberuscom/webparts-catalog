# Mockup y Spec Local

## Objetivo

Permitir que un stakeholder vea de un vistazo si las iniciativas están sanas, en ámbar, en rojo o sin datos suficientes.

## Estructura visual

1. Cabecera con título, subtítulo y resumen de la fuente.
2. Barra de filtros con estado inicial, recarga manual y selector del origen.
3. Lista de tarjetas en grid responsive.
4. Aviso de datos parciales cuando falten responsable, fecha o enlace.
5. Estados dedicados para carga, vacío y error.

## Deducciones aplicadas

- Si la fila no especifica un listado concreto, la web part arranca con `ProjectsList` como valor editable.
- Si la fuente es `JsonUrl`, la URL debe ser same-origin y el origen falla explícitamente si no existe.
- `Planner` se mantiene como contrato previsto pero deshabilitado, porque este proyecto no incorpora permisos Graph.

## Copy local

- Título: `Estado de proyectos`
- Subtítulo: `Seguimiento compacto de iniciativas, riesgos y próximas revisiones.`
- Vacío: `No hay proyectos visibles.`
- Error: `No se ha podido cargar el estado de proyectos.`

## Estado visual

- Verde: iniciativa saludable.
- Ámbar: atención próxima o riesgo menor.
- Rojo: problema o bloqueo.
- Desconocido: falta de datos suficientes.
