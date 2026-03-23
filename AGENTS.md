# AGENTS.md

## Propósito

Este archivo es la **fuente canónica técnica** del repositorio para agentes y asistentes de desarrollo.

Aplica a soluciones **SPFx para SharePoint Online** con:

- React
- Fluent UI compatible con la versión real del proyecto
- PnPjs
- hooks
- contexts
- Jest
- TypeScript estricto

Este estándar cubre:

- Web Parts
- Application Customizers
- Form Customizers
- ListView Command Sets

## Relación con otros documentos

Usa este orden de lectura:

1. `AGENTS.md` para arquitectura, proceso, testing, seguridad, permisos, datos, estructura y validación.
2. `DESIGN.md` para UI, UX, formularios, estados, patrones visuales y reglas de diseño en dos capas.

### Precedencia obligatoria

Cadena de resolución única (de mayor a menor prioridad):

1. **Seguridad y restricciones de plataforma** — `AGENTS.md` (SPFx, SharePoint, React, permisos, CSP). Nunca se anula.
2. **Capa gate de diseño** — `DESIGN.md` (accesibilidad, restricciones del host, Fluent UI).
3. **Capa personal del proyecto** — `DESIGN.md` (branding, tono, preferencias del cliente).
4. **Preferencias cosméticas** del agente o del desarrollador.

Reglas de asignación:

- Si el cambio afecta a **arquitectura, repositorios, servicios, hooks, contexts, permisos, build, testing, seguridad o estructura**, manda `AGENTS.md`.
- Si el cambio afecta a **UI, UX, layout, estados, copy visual o patrones de interacción**, consulta `DESIGN.md` y aplícalo junto con este archivo.
- **Formularios**: la lógica de validación (esquemas Zod, sanitización, reglas de negocio) la rige `AGENTS.md`. La presentación de errores, layout de campos y flujo visual lo rige `DESIGN.md`.
- **Accesibilidad**: la validación técnica (axe, roles ARIA, estructura DOM) se comprueba desde `AGENTS.md`. Las reglas de diseño accesible (contraste, foco visible, semántica visual) las define `DESIGN.md`.
- Nunca contradigas la compatibilidad real de **SPFx, React, Fluent UI o SharePoint Online**.

## Flujo obligatorio del agente

Sigue siempre este orden:

1. Analizar el código existente, la estructura del repo, la versión de SPFx, los manifiestos y los scripts reales.
2. Proponer un plan breve.
3. Ejecutar cambios pequeños y verificables.
4. Validar con los scripts reales del repositorio.
5. Explicar qué se cambió, por qué y qué riesgos quedan abiertos.

No inventes scripts, convenciones, arquitectura ni dependencias si el repositorio ya define una forma estable de trabajar.

## Modos operativos

### Modo consultivo

Es el modo por defecto.

- Analiza y propone antes de modificar.
- Pide confirmación antes de tocar arquitectura, dependencias, permisos, manifiestos, despliegue, pipelines, contratos públicos o patrones transversales.

### Modo yolo

Solo si el usuario lo pide explícitamente.

- Puede ejecutar tras proponer.
- Aun así, debe detenerse y pedir confirmación si el cambio toca permisos, secretos, `package-solution.json`, dominios externos, CSP, despliegue, dependencias nuevas, identidad visual global, sistema de diseño, reglas de la capa gate de `DESIGN.md` o decisiones difíciles de revertir.

## Baseline técnico

- Objetivo: la **última versión de SPFx ya validada por el proyecto**. Si el proyecto no tiene versión fijada, usa la última estable para SharePoint Online.
- Usa la **versión exacta de React compatible con la versión de SPFx del proyecto**.
- Usa **la versión más reciente de Fluent UI que sea realmente compatible** con la combinación de SPFx y React del proyecto.
- Usa **PnPjs** para acceso a SharePoint y Graph cuando mejore claridad, tipado y mantenibilidad.
- Usa **Zod solo para validación y sanitización de formularios** en los límites de entrada.
- Mantén **TypeScript estricto**.
- No introduzcas nuevas librerías sin justificar valor, impacto en bundle, mantenimiento y compatibilidad.

## Arquitectura por capas

Mantén esta separación de responsabilidades:

- `components/`: interfaz y composición visual.
- `hooks/`: lógica reutilizable de UI y estado.
- `contexts/`: estado transversal mínimo y dependencias compartidas.
- `services/`: casos de uso y orquestación de reglas de aplicación.
- `repositories/`: acceso a SharePoint, Graph y APIs autorizadas.
- `models/`: tipos, contratos, DTOs y mapeos.
- `utils/`: helpers puros.

### Reglas obligatorias

- No metas lógica de negocio dentro de componentes React ni dentro de clases SPFx cuando pueda vivir en servicios, hooks o utilidades puras.
- No conviertas Context en un almacén global monolítico.
- No mezcles UI, acceso a datos y reglas de negocio en el mismo archivo.
- Toda llamada a SharePoint, Graph o REST debe pasar por repositorios o adaptadores equivalentes.
- Los hooks personalizados son el mecanismo preferido para reutilizar lógica de estado y carga.
- Los hooks consumen services (nunca al revés). Un hook puede llamar a un service, pero un service nunca debe usar hooks ni estado React.
- Si una lógica puede expresarse como función pura, sáquela fuera de React y cúbrala con tests unitarios.

## React y Fluent UI

- Diseña componentes pequeños, cohesionados y tipados.
- Evita `useEffect` innecesarios y estado duplicado.
- No rompas las Rules of Hooks.
- No fuerces componentes o patrones visuales ajenos al ecosistema si Fluent UI ya resuelve el caso de forma accesible y mantenible.
- No persigas "latest" si rompe la compatibilidad real del stack.

## Datos, SharePoint y rendimiento

- Diseña pensando en **throttling, listas grandes, indexación, paginación y selección mínima de campos**.
- Evita patrones N+1 y ráfagas de llamadas en paralelo sin control.
- Usa batching solo si mejora de verdad el coste de red sin degradar claridad o control de errores.
- No descargues más datos de los necesarios.
- Trata los límites de SharePoint como requisitos de arquitectura, no como casos raros.

## Seguridad y gobernanza

- Mínimo privilegio siempre.
- Prohibido guardar secretos, credenciales o tokens en cliente, código, mocks o configuración versionada.
- Usa **site collection app catalog** como opción por defecto.
- No modifiques `webApiPermissionRequests` ni `package-solution.json` sin explicar impacto y necesidad.
- No añadas dominios externos, CDNs, scripts remotos o iframes sin revisión de CSP, seguridad y mantenimiento.
- No introduzcas librerías abandonadas o de procedencia dudosa.

## Calidad y tests

El trabajo no está terminado si el repo dispone de mecanismos para validar y no se comprueban:

- build
- lint
- typecheck
- tests
- cobertura
- revisión básica de accesibilidad
- impacto en permisos, bundle y despliegue

### Política de testing

- Objetivo: **100% de cobertura en lógica y componentes**.
- Stack base: **Jest**.
- E2E: recomendable, no obligatorio.
- Testea funciones puras, hooks, comportamiento de componentes, validación, sanitización, estados vacíos, errores y ramas relevantes.

## Convenciones de código

- Usa ESLint y Prettier.
- Usa comentarios solo cuando aporten intención, restricciones o contexto no obvio.
- Usa TSDoc o JSDoc en APIs públicas, servicios y piezas reutilizables complejas.
- Evita `any` salvo justificación excepcional.
- No cierres una tarea con logs de depuración, TODOs ambiguos o deuda técnica silenciosa.

## Reglas de cambio

Antes de crear carpetas, abstracciones o patrones nuevos:

- lee la estructura existente,
- reutiliza patrones razonables del repo,
- evita refactors globales no pedidos,
- actualiza tests y documentación afectados.

## Formato esperado de respuesta del agente

Responde con esta secuencia cuando trabajes en el repo:

1. análisis breve,
2. plan,
3. cambios realizados o propuestos,
4. validación,
5. riesgos o siguientes pasos.

## Compatibilidad con Codex

Este archivo está diseñado para funcionar bien con Codex:

- `AGENTS.md` es el punto de entrada principal.
- `DESIGN.md` se trata como documento complementario especializado.
- Mantén aquí las reglas duraderas del repositorio.
- Mantén los archivos de entrada de otras herramientas como wrappers ligeros, no como copias completas.
