# Mockup Spec - Asistente contextual de página

## Objetivo

Ayudar justo cuando el usuario lo necesita sin ensuciar la página, con un bloque compacto que pueda expandirse para ver el mensaje y los recursos relacionados.

## Inferencia funcional

- `useCases` deducidos:
  - orientar al usuario según la página, sección o contexto actual;
  - dar un siguiente paso claro cuando existe ayuda específica;
  - ofrecer una ayuda genérica si la row no trae un mapeo exacto;
  - ocultar la superficie con `empty` cuando la configuración pide no mostrar fallback.
- `dataSource` deducido:
  - `SharePointList` como origen principal;
  - `JsonUrl` same-origin para escenarios ligeros o de configuración externa segura;
  - `StaticConfig` como respaldo local.

## Estados

- `collapsed`: muestra un resumen compacto con el título o la ayuda seleccionada.
- `expanded`: muestra mensaje completo y enlaces relacionados.
- `loading`: informa de la carga del origen.
- `partialData`: muestra la ayuda pero avisa de faltas parciales.
- `empty`: muestra el mensaje seguro de ausencia de ayuda.
- `error`: muestra el error controlado sin exponer detalles técnicos.

## Reglas visuales

- usar la paleta Hiberus adaptada al host SharePoint;
- mantener el bloque en una tarjeta con borde y gradiente suave;
- mostrar la clave de contexto detectada como metadato secundario;
- usar botón pill para expandir/contraer y refrescar;
- no ocultar el estado vacío ni el de error.

## Responsive

- en pantallas amplias, header y acciones van en dos columnas;
- en pantallas medias, las acciones bajan debajo del título;
- en pantallas estrechas, todo queda en una columna con padding reducido.
