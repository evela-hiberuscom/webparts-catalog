# cuenta-atras-a-eventos

SPFx web part para mostrar una cuenta atrás muy visible hacia un evento, campaña o release con fecha cerrada.

## Stack

- SharePoint Framework 1.22.2
- React 17
- Fluent UI 8
- `@paquete/spfx-common`

## Origen de datos

- `StaticConfig`
- `SharePointList`
- `JsonUrl`

Las fuentes remotas deben ser same-origin o relativas.

## Estados

- `loading`
- `ready`
- `partialData`
- `empty`
- `error`

## Notas funcionales

- Si la fecha objetivo aún no llega, se muestra la cuenta atrás con días, horas y minutos.
- Si la fecha ya pasó y `showCompleted=false`, el bloque se oculta como `empty`.
- Si el enlace de detalle no es seguro, no se renderiza como CTA.

## Build

```powershell
npm run build
```

El script ejecuta `heft build --clean --production`, `heft test --production` y `heft package-solution --production`.
