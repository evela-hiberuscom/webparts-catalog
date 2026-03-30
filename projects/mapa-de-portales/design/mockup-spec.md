# Mockup Spec

## Goal
Ayudar al usuario a orientarse dentro de la intranet leyendo la jerarquía de hubs, sites y áreas de un vistazo.

## Visual Direction
- Tarjeta contenedora con fondo claro y gradiente azul muy suave, alineado con la identidad compartida del repo.
- Cabecera compacta con métricas de raíces y nodos para dar contexto sin invadir la página.
- Vista árbol como patrón principal, con degradación a agrupada cuando la jerarquía es defectuosa.
- Vista tarjetas como alternativa rápida para zonas estrechas o exploración superficial.

## States
- `loading`: shimmer vertical con proporción de árbol.
- `ready`: cabecera, selector de vista y estructura navegable.
- `partialData`: `MessageBar` warning con causas concretas y estructura todavía usable.
- `empty`: panel seguro y corto sin ruido visual.
- `error`: `MessageBar` error sin exponer detalles técnicos.

## Accessibility
- La estructura árbol usa `role="tree"` y `role="treeitem"` con niveles explícitos.
- Los toggles de expansión son botones reales.
- Los nodos sin enlace válido siguen teniendo texto visible y no dependen del color para comunicar su estado.

## Implementation Notes
- La vista agrupada debe actuar como fallback automático cuando se detecten ciclos.
- Normalizar siempre URLs SharePoint de lista para soportar entradas pegadas desde `AllItems.aspx`.
- No introducir iframes, CDNs ni dependencias externas.
