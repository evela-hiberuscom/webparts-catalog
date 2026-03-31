# Mis aprobaciones

Web part SPFx para centralizar aprobaciones pendientes del usuario actual y priorizarlas por vencimiento, fecha de creación u origen.

## Qué hace

- Lee aprobaciones desde `Approvals`, una lista de SharePoint o una URL JSON same-origin.
- Normaliza, ordena y limita los elementos visibles.
- Distingue vencidas, de hoy, próximas y sin fecha.
- Oculta completadas por defecto.
- Expone estados `loading`, `empty`, `partialData` y `error`.

## Arquitectura

- `models/`: contratos, tipos y snapshot de vista.
- `utils/`: normalización, ordenación, fechas y datos de fallback.
- `repositories/`: acceso a SharePoint o JSON remoto.
- `services/`: agregación y ordenación.
- `hooks/`: carga y refresco.
- `components/`: UI principal, resumen, lista, item y error boundary.

## Configuración

- `title`: título visible de la web part.
- `dataSourceType`: `Approvals`, `SharePointList` o `JsonUrl`.
- `sourceUrl`: origen JSON o API same-origin.
- `listTitleOrUrl`: título o URL de la lista de SharePoint.
- `showCompleted`: muestra u oculta completadas.
- `maxItems`: límite de elementos.
- `defaultSort`: `dueDate`, `createdDate` o `source`.

## Build

```powershell
npm run build
```

El script ejecuta:

```powershell
heft build --clean --production && heft test --production && heft package-solution --production
```

## Notas

- El web part usa `WebPartErrorBoundary`.
- Las cadenas de UI viven en `loc/`.
- `JsonUrl` solo admite rutas relativas o same-origin.
