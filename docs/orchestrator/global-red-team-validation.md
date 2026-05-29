# Global Red-team Validation

Fecha final: 2026-05-29

## Alcance adversarial

Revision adversarial del catalogo completo: 79 proyectos SPFx independientes y 80 webparts fisicos bajo `projects/`.

## Findings

| Finding | Severidad practica | Mitigacion aplicada | Riesgo residual |
| --- | --- | --- | --- |
| Conteos inconsistentes entre catalogo y disco | Alta | Se corrigio el catalogo a 79 proyectos y 80 webparts fisicos; `WP-035` queda documentado como doble webpart en un proyecto. | Bajo si se mantiene `audit-webpart-completeness`. |
| CI asumía solo proyectos directos bajo `projects/` | Alta | Discovery por contrato positivo (`package.json` + `config/config.json`) y exclusion de `_governance`. | Bajo; vigilar nuevos patrones de carpetas. |
| Una solucion SPFx multi-webpart para governance habria reducido trazabilidad | Media | ADR-001 mantiene un proyecto SPFx independiente por iniciativa governance. | Medio por coste de mantenimiento y CI de 27 paquetes. |
| Duplicacion conceptual entre governance projects | Media | Modelos, contratos y guias compartidas viven en `_governance/docs/`. | Medio hasta que exista backend real y se decida si conviene paquete comun. |
| Warnings de Jest/Fluent UI ocultaban senales reales | Media | Setup comun de iconos y revalidacion selectiva; barrido final sin coincidencias. | Bajo. |
| Tests con warnings esperados podian normalizar fallos reales | Media | Se cambiaron a spies/aserciones acotadas en tests especificos. | Bajo. |
| Dependencias backend de governance pueden confundirse con produccion lista | Alta | Docs, red-team y resumen declaran mock-backed y backend requerido. | Medio hasta conectar APIs reales, permisos y licencias. |
| Riesgo de permisos/Graph/Purview no revisados en runtime | Alta | No se añadieron permisos ni operaciones destructivas cliente; backlog backend documenta requisitos. | Medio/alto hasta validacion tenant real. |
| Cobertura podria sobredeclararse | Media | Se documenta que no existe umbral global 100%; solo se declara build/test/package passed. | Bajo. |
| Artefactos temporales de `node_modules` podian contaminar Git y secret scan | Alta | Se eliminaron del disco y se sacaron del indice. | Bajo; repetir `check:secrets` en CI. |

## Resultado adversarial

No quedan findings criticos o altos sin mitigacion dentro del alcance frontend/build/catalogo. Los riesgos residuales relevantes son externos: backend real, permisos Microsoft 365, licenciamiento, despliegue de 27 paquetes y gobierno operacional.

