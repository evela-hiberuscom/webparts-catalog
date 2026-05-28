# visualizador-de-elementos-de-biblioteca-y-papelera-superior

Solución SPFx con dos webparts operativos y alcances diferenciados:

1. `SiteStorageDiagnosticsWebPart`
   - Escanea sitios accesibles, bibliotecas de documentos, elementos recientes, papelera y uso de almacenamiento.
   - Permite guardar informes en una lista del sitio actual o descargar resultados en CSV sin persistir datos.
   - Aplica control de throttling, estado parcial cuando SharePoint no devuelve métricas y validación same-origin para la lista de informes.

2. `RecycleBinSpaceCalculatorWebPart`
   - Calcula elementos y tamaño agregado de papelera de primer y segundo nivel del sitio actual.
   - Muestra desglose por etapa, umbrales de aviso y refresco automático configurable.

## Decisión de alcance

El desarrollo vigente no selecciona una única biblioteca para calcular un ratio papelera/biblioteca. Esa idea queda fuera del alcance implementado y no se documenta como capacidad disponible. El nombre histórico del proyecto se mantiene por compatibilidad de carpeta/paquete, pero los manifiestos y la documentación funcional se alinean con los webparts reales incluidos.

## Build y validación

```powershell
npm install
npm run build
```

El script `build` ejecuta `heft build --clean --production`, `heft test --production` y `heft package-solution --production`.
