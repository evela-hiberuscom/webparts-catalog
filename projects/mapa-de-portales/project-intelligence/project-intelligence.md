# Project Intelligence

## Row Source
- `rowId`: `recw0vit4QRbwI96D`
- `name`: `Mapa de portales`
- `slug`: `mapa-de-portales`
- `waveNumber`: `6`
- `artifactType`: `SPFxWebPart`
- `archetype`: `general`

## Specification Review
- `suficiencia`: suficiente
- `gaps detectados`: no había contrato explícito para la muestra estática ni para el fallback cuando aparece una jerarquía cíclica.
- `supuestos`:
  - `listTitleOrUrl` actúa como título de lista o URL same-origin según el origen elegido.
  - La vista `tree` es preferente, pero un ciclo obliga a degradar a `grouped`.
  - Los nodos sin URL siguen siendo visibles como informativos.

## Inference Log
- `observado`: la row ya definía jerarquía, estados, criterios de aceptación y `maxDepth`.
- `inferido`: la muestra `StaticConfig` debe existir para que el web part sea usable sin configuración inicial.
- `inferido`: los ciclos no bloquean el render; fuerzan una degradación a vista agrupada.
- `pendiente de validar`: shape exacto de columnas SharePoint si el listado real usa nombres alternativos a `NodeType`, `ParentId` y `OpenUrl`.

## Risks
- Una lista real con más de 200 elementos necesitaría paginación adicional.
- La calidad de la jerarquía depende de la integridad de `parentId` y del tipo de nodo en la fuente real.

## Error History
- `ISSUE-006`: el scaffold se generó en una subcarpeta anidada y se movió al root real del proyecto.
- `ISSUE-018`: el repositorio usa `fetch` same-origin y no arrastra dependencias de `@microsoft/sp-http` a tests.
- `ISSUE-026`: el gate de cierre es `heft build --clean --production && heft test --production && heft package-solution --production`.
- `ISSUE-029`: las URLs de lista `.../Forms/AllItems.aspx` se normalizan antes de invocar `GetList(@listUrl)`.
