# Cumpleaños y aniversarios

Web part SPFx para destacar cumpleaños y aniversarios laborales próximos o del día. La solución soporta fuentes `Directory`, `SharePointList` y `JsonUrl`, con normalización same-origin, estados `loading`, `ready`, `empty`, `partialData` y `error`, y render accesible con cards ligeras.

## Key points
- SPFx 1.22.2
- React 17.0.1
- Fluent UI v8
- `@paquete/spfx-common` para utilidades compartidas

## Data contract
- `dataSourceTypesCsv`: prioridad de orígenes
- `directoryJsonUrl`: feed JSON same-origin para el modo Directory
- `listTitleOrUrl`: título o URL de vista same-origin para listas de SharePoint
- `jsonUrl`: feed JSON same-origin alternativo
- `showBirthdays`, `showAnniversaries`, `daysAhead`

## Build
```powershell
npm run build
```

## Notes
- Las URLs de vista `.../Forms/AllItems.aspx` se normalizan antes de consultar SharePoint.
- Los registros parciales se conservan con badge y mensaje explicativo.
