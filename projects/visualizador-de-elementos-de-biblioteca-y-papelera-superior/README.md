# visualizador-de-elementos-de-biblioteca-y-papelera-superior

Este proyecto tiene hoy una desviación funcional importante entre el producto que debería ser y el código que realmente existe.

## Objetivo funcional canónico

La intención válida del webpart, según la especificación original y la corrección actual del usuario, es esta:

- seleccionar una biblioteca concreta por título o ID;
- mostrar el `ItemCount` real de esa biblioteca;
- consultar la papelera de primer nivel del sitio;
- mostrar conteo de papelera, tamaño agregado cuando sea viable y ratio papelera/biblioteca;
- exponer acciones de refresco, apertura de biblioteca y apertura de papelera;
- degradar a `partialData` cuando falten tamaños o haya permisos parciales.

## Estado actual de implementación

El código fuente no implementa ese objetivo. Lo que hay hoy es un calculador de papelera de primer y segundo nivel del sitio:

- no resuelve ninguna biblioteca;
- no expone `libraryTitleOrId` ni `showSizeMetrics`;
- no calcula ratio papelera/biblioteca;
- no abre la biblioteca objetivo;
- sí consulta `/_api/web/RecycleBin` y `/_api/site/RecycleBin`;
- sí muestra KPIs por etapa, total agregado, estado de salud y refresco.

En otras palabras: el nombre del proyecto habla de biblioteca, pero la implementación actual es un `RecycleBinSpaceCalculator`.

## Cobertura actual frente al objetivo

| Capacidad esperada | Estado actual |
| --- | --- |
| Selección de biblioteca | No implementada |
| Conteo real de la biblioteca | No implementado |
| Conteo de papelera de primer nivel | Implementado |
| Tamaño agregado de papelera | Implementado para papelera; no comparado con biblioteca |
| Ratio papelera/biblioteca | No implementado |
| Abrir biblioteca | No implementado |
| Abrir papelera | Implementado |
| `partialData` por datos incompletos | Implementado |
| Health badge | Implementado |
| Papelera de segundo nivel | Implementada, pero fuera del objetivo canónico actual |

## Validación observada

- `npm run build` falla hoy en la fase de tests por una incoherencia entre el repositorio y su test unitario.
- `node --check src/webparts/recycleBinSpaceCalculator/loc/es-es.js` y `node --check src/webparts/recycleBinSpaceCalculator/loc/en-us.js` fallan por error de sintaxis en localización.

## Documentación relacionada

- `project-intelligence/project-intelligence.md`: resumen ejecutivo del desvío funcional y técnico.
- `project-intelligence/functional-technical-audit.md`: auditoría detallada con cobertura funcional, bugs y riesgos.
- `design/mockup-spec.md`: objetivo UX esperado del webpart de biblioteca.

## Build y validación

```powershell
npm install
npm run build
```

El script `build` ejecuta `heft build --clean --production`, `heft test --production` y `heft package-solution --production`.
