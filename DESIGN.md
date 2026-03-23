# DESIGN.md

## Propósito

Este archivo es la **fuente canónica de diseño y UX** del repositorio.

No sustituye a `AGENTS.md`. Lo complementa.

Aplica a:

- Web Parts
- Application Customizers
- Form Customizers
- ListView Command Sets

## Modelo de dos capas

### 1. Capa personal del proyecto

Aquí viven las reglas del cliente o del producto, por ejemplo:

- branding
- tono visual
- prioridad entre claridad, densidad o rapidez
- lenguaje y copy
- jerarquía de acciones
- patrones propios del negocio
- iconografía autorizada
- reglas editoriales o legales del cliente
- preferencias sobre tablas, tarjetas, paneles y dashboards

### 2. Capa gate

Esta capa impide que las reglas del cliente contradigan restricciones reales de:

- SPFx
- SharePoint Online
- React
- Fluent UI
- accesibilidad
- rendimiento
- contexto del host

## Precedencia obligatoria

Sigue siempre este orden:

1. capa gate de `DESIGN.md`
2. restricciones reales del proyecto y del stack
3. capa personal del proyecto
4. preferencias cosméticas del agente o del desarrollador

Si una petición del cliente choca con la capa gate:

- no la implementes tal cual,
- explica el conflicto,
- propón una alternativa compatible.

## Reglas de diseño obligatorias

- Diseña para el **host real de SharePoint**, no como si fuese una SPA libre sin restricciones.
- Prioriza claridad, consistencia, accesibilidad y mantenibilidad.
- Usa Fluent UI y theming del entorno cuando resuelva el caso de forma correcta.
- No introduzcas una identidad visual que pelee con Microsoft 365 sin una justificación fuerte.
- Diseña todos los estados: carga, vacío, error, sin permisos, éxito, confirmación, datos parciales y reintento.
- No dependas del color como único indicador.
- Mantén navegación por teclado, foco visible y semántica correcta.
- El diseño responsive debe preservar usabilidad, no solo "encajar".
- Los formularios deben minimizar fricción, mostrar validación clara y pedir solo datos necesarios.

## Reglas por tipo de extensión

### Web Parts

- Deben convivir bien con otras piezas de la página.
- No deben consumir más protagonismo ni espacio del necesario.
- Deben degradar bien en anchos reducidos y estados sin configurar.

### Application Customizers

- Deben integrarse sin parecer un parche visual.
- Deben minimizar trabajo en arranque y no bloquear navegación.

### Form Customizers

- Deben priorizar claridad, seguridad y validación comprensible.
- Deben separar visualmente bloques de información y errores.

### ListView Command Sets

- Deben ser ligeros y orientados a acción.
- No deben abrir flujos pesados para tareas pequeñas sin una razón clara.

## Copy y lenguaje

- Usa texto claro, breve y consistente.
- Evita jerga interna si no aporta.
- Diseña pensando en localización desde el inicio.
- No disperses cadenas mágicas por los componentes.

## Qué no debe hacer el agente en UI/UX

- No rediseñar el sistema visual entero por preferencia personal.
- No usar modales para procesos largos si hay patrones mejores.
- No introducir dashboards recargados sin necesidad.
- No esconder acciones críticas en menús ambiguos.
- No romper contraste, accesibilidad ni coherencia del tenant por branding.

## Relación con AGENTS.md

- Si una tarea afecta a UI o UX, consulta `DESIGN.md` y `AGENTS.md` juntos.
- `DESIGN.md` manda en reglas de diseño y experiencia, pero nunca anula restricciones técnicas o de seguridad de `AGENTS.md`.
