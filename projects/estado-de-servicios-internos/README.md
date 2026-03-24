# estado-de-servicios-internos

Web part SPFx para consultar el estado operativo de servicios internos desde una lista de SharePoint, una URL JSON del mismo origen o una configuración estática local.

## Qué resuelve

- muestra el estado de cada servicio con prioridad visual por criticidad;
- marca servicios obsoletos cuando superan el umbral configurado;
- permite refresco manual;
- mantiene estados separados para `loading`, `empty`, `partialData`, `ready` y `error`;
- usa el sistema visual del repo y tipografías self-hosted ya definidas en `style-guide/`.

## Diseño local

La especificación visual se documenta en [design/mockup-spec.md](./design/mockup-spec.md) y la referencia estructural en [design/design-reference.json](./design/design-reference.json).

## Datos y provisioning

La definición de origen y criterios de aceptación está en [provisioning/provisioning-definition.json](./provisioning/provisioning-definition.json).

## Desarrollo

```powershell
cd projects/estado-de-servicios-internos
npm install
npm run build
```

El paquete generado queda en `sharepoint/solution/estado-de-servicios-internos.sppkg`.
