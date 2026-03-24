# analizador-de-tamano-y-volumen-de-documentos-historicos

SPFx web part para diagnosticar el almacenamiento histórico de bibliotecas de documentos de SharePoint Online.

## Scope

- Selección de biblioteca entre las bibliotecas del sitio.
- `quickScan` y `deepScan`.
- Objetivo de exactitud.
- Cálculo de tamaño actual, coste histórico, ratio, cobertura y duración.
- Estados `loading`, `ready`, `empty`, `partialData`, `throttled` y `error`.
- Exportación JSON y acceso seguro a la biblioteca analizada.

## Build

```powershell
npm run build
```

## Notes

- El proyecto consume `@paquete/spfx-common` para utilidades compartidas.
- `skipFeatureDeployment` se mantiene en `false`.
- Si SharePoint limita el crawl profundo, el resultado degrada explícitamente a `partialData` o `throttled` sin reinterpretar el alcance.
