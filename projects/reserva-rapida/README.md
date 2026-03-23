# reserva-rapida

Web part SPFx para lanzar reservas de recursos frecuentes desde SharePoint Online. Está pensada para salas, puestos, parking o equipamiento y prioriza acceso rápido, filtros simples y estados explícitos de carga, vacío, parcial y error.

## Stack

- SharePoint Framework `1.22.2`
- React `17.0.1`
- Fluent UI `8.x`
- TypeScript estricto
- Jest

## Funcionalidad

- Fuente principal desde lista de SharePoint.
- Fuente alternativa desde `JsonUrl`, limitada a rutas relativas o URLs del mismo origen.
- Configuración estática JSON opcional con `resourcesJson`.
- Filtro por categoría y por sede.
- Enlaces de reserva validados antes de renderizar acción.
- Estados separados para `loading`, `error`, `empty`, `partialData` y `ready`.

## Seguridad y datos

- `JsonUrl` no acepta hosts arbitrarios.
- Si el enlace de reserva no es seguro o no es válido, la tarjeta se muestra sin acción.
- Si la fuente falla, la web part entra en `error`.
- Si la fuente devuelve cero elementos, la web part entra en `empty`.
- `resourcesJson` no actúa como demo automática; solo es contenido estático explícito.

## Configuración

- `dataSourceType`: `SharePointList`, `JsonUrl` o `StaticConfig`.
- `listTitleOrUrl`: título de lista o URL JSON relativa/del mismo origen, obligatoria para `SharePointList` y `JsonUrl`.
- `showAvailability`: muestra u oculta la disponibilidad resumida.
- `defaultCategory`: categoría inicial si existe.
- `resourcesJson`: JSON estático opcional para `StaticConfig`.

## Desarrollo

```bash
npm install
npm run build
```

El script `build` ejecuta pruebas y empaquetado de producción.

## Validación esperada

- Renderiza correctamente los estados `loading`, `empty`, `error`, `partialData` y `ready`.
- No mezcla datos demo con vacío real.
- La sede puede filtrarse desde la UI.
- La cobertura debe subir en componente, hook y repositorio.

## Versionado

| Versión | Fecha | Comentarios |
| ------- | ----- | ----------- |
| 0.0.1 | 2026-03-23 | Base del launcher de reservas con validación, filtros y estados reales. |

