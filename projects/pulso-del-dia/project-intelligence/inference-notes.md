# Inference Notes

## Deductions
- `useCases`:
  - empleado que responde en segundos
  - people/manager que necesita una señal ligera del día
- `dataSource`:
  - `SharePointList` como contrato principal
  - `StaticConfig` como fallback de workbench cuando no existe configuración de lista
- `provisioning`:
  - una lista `DailyPulse`
  - columnas para prompt, opciones, tipo de item, respuesta y auditoría básica de envío

## Behavioral decisions
- `oneResponsePerDay` bloquea envíos duplicados en el mismo día.
- Un prompt sin opciones útiles se considera `partialData`.
- Un payload malformado debe ser `error`, no `empty`.

## Validation notes
- El proyecto mantiene estados `loading`, `ready`, `partialData`, `empty`, `error`.
- La selección y el submit viven en hook/service; la UI no contiene reglas de negocio.

