# Mantenimientos programados

Web part SPFx para comunicar ventanas de mantenimiento planificadas, servicios afectados e impacto previsto.

## Stack

- SharePoint Framework 1.22.2
- React 17
- Fluent UI v8
- TypeScript estricto
- `@paquete/spfx-common`

## Arquitectura

- `models/`: contratos de mantenimiento y view model
- `utils/`: parsing de fechas, clasificacion temporal, ordenacion y normalizacion
- `repositories/`: lectura segura desde SharePoint list o JSON same-origin
- `services/`: composicion del view model final
- `hooks/`: carga, retry y filtro local de completados
- `components/`: timeline/lista, item, filtro y `WebPartErrorBoundary`

## Configuracion

- `dataSourceType`: `SharePointList` o `JsonUrl`
- `listTitleOrUrl`: titulo o URL same-origin de la lista
- `jsonUrl`: feed JSON same-origin
- `hideCompleted`: oculta mantenimientos completados por defecto
- `maxItems`: limita el volumen visible

## Notas de seguridad y calidad

- `JsonUrl` solo acepta same-origin.
- `listTitleOrUrl` normaliza URLs de vista tipo `/Forms/AllItems.aspx`.
- El repositorio evita runtime imports de `@microsoft/sp-http` para no romper Jest.
- El gate del proyecto es `heft build --clean --production && heft test --production && heft package-solution --production`.

## Comandos

- `npm run build`
- `npm run start`
- `npm run clean`
