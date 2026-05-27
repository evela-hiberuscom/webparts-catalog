# Project Intelligence

## Row Source
- `rowId`: `recH4dtMmWDWA8VzV`
- `name`: `Visualizador de elementos de biblioteca y papelera superior`
- `slug`: `visualizador-de-elementos-de-biblioteca-y-papelera-superior`
- `waveNumber`: `12`

## Canonical Functional Target

La corrección vigente del usuario devuelve este proyecto a su intención funcional original:

- seleccionar una biblioteca concreta por título o ID;
- mostrar el `ItemCount` real de esa biblioteca;
- consultar la papelera de primer nivel del sitio;
- mostrar conteo de papelera, tamaño agregado cuando sea viable y ratio papelera/biblioteca;
- ofrecer acciones de refresco, apertura de biblioteca y apertura de papelera;
- degradar con `partialData` cuando falten tamaños, haya permisos parciales o la papelera no exponga todos los metadatos necesarios.

## Current Implementation Observed

La implementación real no responde a ese objetivo. El proyecto desplegado en `src/webparts/recycleBinSpaceCalculator/` hace esto:

- consulta la papelera de primer nivel;
- consulta la papelera de segundo nivel;
- agrega tamaño y conteo por etapa;
- calcula un total agregado de papelera;
- muestra health badge, refresco manual y apertura de la papelera.

No hace esto:

- no resuelve biblioteca objetivo;
- no muestra `ItemCount` de biblioteca;
- no calcula ratio papelera/biblioteca;
- no abre la biblioteca;
- no filtra la papelera por relación con una biblioteca concreta.

## Divergence Summary

| Área | Objetivo canónico | Implementación actual | Estado |
| --- | --- | --- | --- |
| Origen principal | Biblioteca + papelera nivel 1 | Papelera nivel 1 + nivel 2 | Desalineado |
| Configuración | `libraryTitleOrId`, `showSizeMetrics` | `showStageBreakdown`, umbrales y refresco | Desalineado |
| KPIs | Biblioteca, papelera, tamaño, ratio | Papelera nivel 1, nivel 2 y total | Desalineado |
| Acciones | Abrir biblioteca y papelera | Solo abrir papelera | Desalineado |
| Estado parcial | Sí | Sí | Parcialmente alineado |
| Salud | Comparativa biblioteca vs papelera | Salud interna de papelera | Desalineado |

## Key Findings

1. El proyecto está implementado sobre una especificación equivocada. La desviación afecta a arquitectura, contratos, UI, tests, manifiestos y documentación.
2. La localización tiene un error de sintaxis confirmado en `es-es.js` y `en-us.js`.
3. `npm run build` falla hoy porque el test del repositorio espera headers `Accept` que el repositorio no envía.
4. La documentación local del proyecto había heredado la reinterpretación errónea y por eso describía un calculador de papelera en lugar del webpart de biblioteca.
5. La implementación actual tampoco cumple varias expectativas técnicas del diseño original: sin `LibraryRepository`, sin ratio, sin reintentos, sin cache, sin telemetría y sin apertura de biblioteca.

## Risks

- riesgo funcional crítico: cualquier lector del proyecto puede creer que el producto está terminado cuando en realidad implementa otro caso de uso;
- riesgo técnico: la futura corrección no será un ajuste menor, sino una reorientación del servicio, del repositorio y del modelo de vista;
- riesgo SharePoint: la papelera es ámbito sitio y no garantiza relación exacta con una biblioteca sin filtrado adicional por origen;
- riesgo de calidad: el pipeline ya falla y la localización puede romper el runtime incluso antes de corregir el producto.

## Updated Working Position

- El objetivo válido vuelve a ser `biblioteca seleccionada + papelera de primer nivel`.
- La segunda etapa de papelera deja de ser requisito principal del producto.
- La implementación actual debe tratarse como un prototipo desviado, no como la V1 correcta del webpart.

## Error History

- 2026-03-24: la orquestación redefinió este proyecto como calculador de papelera de nivel 1 + nivel 2.
- 2026-05-27: nueva corrección del usuario; se restablece el objetivo de webpart de biblioteca y se documenta la divergencia con el código existente.
