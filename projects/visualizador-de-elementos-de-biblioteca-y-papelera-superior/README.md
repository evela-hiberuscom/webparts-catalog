# visualizador-de-elementos-de-biblioteca-y-papelera-superior

Web Part SPFx para calcular el espacio ocupado por los elementos de la papelera de primer y segundo nivel de un sitio SharePoint Online.

## Qué hace

- Consulta la papelera de primer nivel del sitio.
- Consulta la papelera de segundo nivel del sitio.
- Agrega el número de elementos y el tamaño ocupado por cada etapa.
- Calcula el total combinado y marca `partialData` si una etapa no es accesible o no devuelve tamaño.
- Expone un enlace a la papelera del sitio para facilitar la revisión manual.

## Arquitectura

- `models/`: contratos y tipos de la vista, estado y métricas.
- `utils/`: normalización, agregación, formato y evaluación de salud.
- `repositories/`: acceso a las dos etapas de la papelera.
- `services/`: orquestación de carga y construcción del view model.
- `hooks/`: estado de carga, refresco y auto-refresh.
- `components/`: UI principal y piezas de presentación.

## Build y validación

```powershell
npm install
npm run build
```

El script `build` ejecuta `heft build --clean --production`, `heft test --production` y `heft package-solution --production`.

## Notas operativas

- Si la segunda etapa no expone un dato directo, la UI degrada a `partialData` sin cambiar el objetivo funcional.
- La solución está alineada con `project-intelligence/`, `design/` y `provisioning/` dentro del propio proyecto.
