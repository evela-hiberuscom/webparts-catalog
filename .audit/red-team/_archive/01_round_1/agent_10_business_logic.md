# RONDA 1 — AGENTE 10 — Lógica de negocio y flujos críticos

## Flujos críticos inferidos

- microencuesta: cargar pregunta, detectar respuesta previa, evitar doble envío, persistir por StaticConfig/API/SharePoint.
- pulso-del-dia: resolver prompt diario, evitar reenvío, persistir local y remoto.
- analizador/visualizador: escanear bibliotecas/sitio, tolerar throttling, persistir reportes.
- asistente-contextual: match exacto y fallback genérico.

## Hallazgos

- Confirmado: microencuesta aplica same-origin para ApiEndpoint y soporta SharePointList.
- Confirmado: StaticConfig persiste en localStorage, no debe considerarse control de seguridad.
- Confirmado: pulso-del-dia persiste respuesta en localStorage incluso en flujos remotos, como apoyo de UX.
- Sospecha: identidad incompleta puede debilitar unicidad de respuesta en microencuesta.
- Sospecha: mis-accesos-recientes JsonUrl configurable puede saltarse política same-origin aplicada por otros proyectos.

## Recomendaciones

Definir reglas de identidad/unicidad, documentar localStorage, probar fallos backend y centralizar validación de URLs configurables.
