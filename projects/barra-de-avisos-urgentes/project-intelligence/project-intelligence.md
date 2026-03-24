# Project Intelligence

## Row Source
- `rowId`: `recOGlnVLuk3SOqg5`
- `name`: `Barra de avisos urgentes`
- `slug`: `barra-de-avisos-urgentes`
- `waveNumber`: `3`

## Specification Review
- `suficiencia`: media-alta. La row define objetivo, estados, reglas de vigencia, data source y criterios de aceptación, pero no fija el esquema físico de `AlertsList`.
- `gaps detectados`: falta el contrato exacto de columnas internas, la política de expiración para avisos sin `endAt` y la estructura concreta para `StaticConfig`.
- `supuestos`: `AlertsList` expone `Title`, `Severity`, `Message`, `StartAt`, `EndAt`, `CtaUrl` y `Priority`; `listTitleOrUrl` puede ser título o URL same-origin; `StaticConfig` acepta array directo o `{ items: [] }`.

## Inference Log
- `observado`: la row pide mostrar avisos críticos o urgentes en banner, priorizar severidad/prioridad y ocultar avisos expirados.
- `inferido`: los avisos sin `startAt` o `endAt` se consideran `partialData`; `ctaUrl` es opcional pero, si existe, debe ser same-origin o relativa.
- `inferido`: `JsonUrl` no puede apuntar a hosts arbitrarios; se limita a same-origin para no abrir superficie externa.
- `inferido`: cuando el origen es un objeto malformado, la carga debe ir a `error` y no a `empty`.
- `inferido`: un aviso sin `title` es inválido y se descarta antes de renderizar.
- `pendiente de validar`: si el tenant necesita `startAt`/`endAt` con otro nombre interno, habrá que mapearlo en el repositorio sin cambiar el contrato de UI.

## Deduced Source Schema
- `AlertsList` should expose:
  - `Title` - required text
  - `Severity` - `critical|warning|info|unknown`
  - `Message` - optional text
  - `StartAt` - optional ISO date or SharePoint date
  - `EndAt` - optional ISO date or SharePoint date
  - `CtaUrl` - optional same-origin or relative URL
  - `Priority` - optional numeric sort key

## Error History
- No blocking execution issues local to this project after the scaffold.
- Reusable implementation note: `JsonUrl` and `CtaUrl` must be same-origin or relative to avoid unsafe external navigation.

## Local Notes
- The project now implements:
  - repository + service + hook split
  - loading, ready, empty and error states
  - dismissible banners
  - partial-data badge when fields are incomplete
- The build target remains SPFx 1.22.2 with React 17.

