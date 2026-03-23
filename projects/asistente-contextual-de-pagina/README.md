# asistente-contextual-de-pagina

Web part SPFx para ofrecer ayuda contextual breve, plegable y segura según la página o sección donde trabaja el usuario.

## Qué resuelve

- muestra un bloque compacto de ayuda contextual sin romper el flujo de la página;
- permite expandir y contraer la ayuda con un botón accesible;
- soporta tres orígenes de datos: `SharePointList`, `JsonUrl` same-origin y `StaticConfig`;
- aplica fallback controlado entre ayuda `generic` o `empty`;
- deja estados visibles para `loading`, `ready`, `partialData`, `empty` y `error`.

## Diseño local

La especificación visual está en [design/mockup-spec.md](./design/mockup-spec.md) y la referencia estructural en [design/design-reference.json](./design/design-reference.json).

## Datos y provisioning

La inferencia funcional y el contrato de origen están en [provisioning/provisioning-definition.json](./provisioning/provisioning-definition.json).

## Desarrollo

```powershell
cd projects/asistente-contextual-de-pagina
npm install
npm run build
```

El paquete generado queda en `sharepoint/solution/asistente-contextual-de-pagina.sppkg`.
