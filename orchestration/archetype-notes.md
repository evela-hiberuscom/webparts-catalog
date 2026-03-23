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

## provisioning
- Definir listas y columnas mínimas.
- No introducir permisos Graph ni APIs externas sin aprobación explícita.
