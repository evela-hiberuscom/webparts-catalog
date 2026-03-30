# Inicia una solicitud

Web part SPFx para lanzar accesos rápidos a procesos corporativos habituales.

## Entrada de datos

- `dataSourceType`: `SharePointList`, `JsonUrl` o `StaticConfig`
- `listTitleOrUrl`: título de lista o URL same-origin del origen JSON/lista
- `defaultCategory`: filtro inicial opcional
- `showPrerequisites`: muestra u oculta los prerequisitos

## Pipeline

```powershell
npm run build
```

Ese script ejecuta:

1. `heft build --clean --production`
2. `heft test --production`
3. `heft package-solution --production`

## Notas de implementación

- La lógica de resolución del catálogo vive en `repositories/` y `services/`.
- La normalización de `listTitleOrUrl` cubre URLs de `AllItems.aspx` y títulos de lista.
- Si falta un enlace principal, la tarjeta sigue visible pero no es accionable.
- Si faltan descripción o prerequisitos, el estado se marca como `partialData`.
