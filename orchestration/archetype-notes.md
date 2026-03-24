# Archetype Notes

## launcher
- Priorizar launcher simple, visual y de baja latencia.
- Tratar URLs ausentes como `partialData`, no como crash.
- Documentar siempre enlaces externos con apertura segura.

## audience
- Resolver fallback genérico cuando no hay coincidencia específica.
- No exponer atributos sensibles del usuario en UI.

## recents
- Ordenar por fecha descendente con `nulls` al final.
- Mantener comportamiento estable aunque falten tipo o enlace.

## summary
- Normalizar fuentes heterogéneas antes de renderizar.
- Excluir o degradar datos sin fecha según política documentada.

## analytics
- Priorizar lectura rápida: estado, tendencia, impacto y siguiente acción visible en primer pantallazo.
- Tratar feeds vacíos o fuentes incompletas como `empty` o `partialData` reales; no ocultarlos con muestras sintéticas salvo `StaticConfig` explícito.
- Mantener filtros y metadatos visibles también en `empty` y `partialData` para no dejar al usuario sin contexto.
- Resolver semáforos y severidades mediante mapeos tipados y testeados, nunca con strings mágicos dispersos por la UI.
- Restringir `JsonUrl` y orígenes remotos a same-origin o configuración aprobada; no abrir superficies analíticas a hosts arbitrarios.
- Si el contrato dice `listTitleOrUrl`, soportar título y URL same-origin de lista; no asumir siempre `getbytitle(...)`.
- Un payload malformado debe ir a `error`, no a `empty`.
- `unknown` es un estado de dominio válido; no convertirlo en `partialData` salvo falta de datos obligatorios.
- Las configuraciones de refresco automático deben cablearse hasta el hook y cubrirse con test explícito del temporizador.
- Si el proyecto promete registrar respuestas en SharePoint o en un endpoint same-origin, el repositorio debe ejecutar el POST real y fallar si la respuesta HTTP no es satisfactoria; `localStorage` solo sirve como apoyo local, no como sustituto silencioso.
- Si existe una regla como `oneResponsePerDay`, no escribir el guard local antes de confirmar el éxito remoto.

## shared-data-sources
- Cuando un contrato acepta `listTitleOrUrl`, normalizar las URLs de vista same-origin (`/Forms/AllItems.aspx`) a la raíz server-relative de la lista antes de usar `GetList(@listUrl)`.
- Mantener tests explícitos para `listTitleOrUrl` por título y por URL de vista real, no solo por ruta de lista ya limpia.

## provisioning
- Definir listas y columnas mínimas.
- No introducir permisos Graph ni APIs externas sin aprobación explícita.

## platform
- El gate estándar del repo para una solución SPFx generada por workers es `heft build --clean --production && heft test --production && heft package-solution --production`.
- No asumir que `heft test --clean --production && heft package-solution --production` es estable en Windows para cerrar una ola; validar siempre el `.sppkg` real.
