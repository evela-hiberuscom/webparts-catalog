# Microencuesta

Web part SPFx para lanzar una pregunta corta de una sola respuesta con el menor rozamiento posible dentro de una pagina de SharePoint. La solucion soporta tres modos de origen:

- `SharePointList`: lee la pregunta activa desde una lista y registra respuestas en una lista separada.
- `ApiEndpoint`: consume un endpoint JSON same-origin para carga y envio.
- `StaticConfig`: usa configuracion del property pane y persiste la respuesta en `localStorage` para demos o validacion funcional.

## Stack

- SPFx `1.22.2`
- React `17`
- Fluent UI `8`
- TypeScript estricto
- Jest
- `@paquete/spfx-common`

## Arquitectura

- `models/`: contratos de encuesta, usuario, carga y submit.
- `utils/`: parseo de opciones, normalizacion de URLs y claves locales.
- `repositories/`: acceso a SharePoint, API same-origin y almacenamiento local.
- `services/`: reglas de negocio para validacion y una sola respuesta por usuario.
- `hooks/`: carga, submit, refresh y estados de UI.
- `components/`: surface visual, grupo de opciones, mensajes de estado y error boundary.

## Configuracion

### SharePointList

- `listTitleOrUrl`: titulo de la lista de preguntas o URL de vista/lista. Si llega una URL `Forms/AllItems.aspx`, el repositorio la normaliza antes de consultar la API REST.
- `responsesListTitleOrUrl`: titulo o URL de la lista de respuestas. Si no se informa y `listTitleOrUrl` es un titulo, se infiere como `<QuestionListTitle> Responses`.
- `oneResponsePerUser`: evita reenvios buscando coincidencias por email o login del usuario.

La lista de preguntas espera estos campos:

- `Title`: texto de la pregunta activa.
- `PollOptions`: opciones separadas por `;`, salto de linea o JSON array.
- `IsActive`: booleano para marcar la pregunta activa.
- `PollDescription` o `Description`: texto auxiliar opcional.
- `ThankYouMessage` o `ClosingMessage`: mensaje opcional tras el envio.

La lista de respuestas espera estos campos:

- `Title`
- `PollQuestionId`
- `QuestionLabel`
- `SelectedOption`
- `SubmittedByEmail`
- `SubmittedByDisplayName`
- `SubmittedByLoginName`

### ApiEndpoint

- `apiEndpointUrl`: URL same-origin.
- `GET`: debe devolver `question`, y opcionalmente `alreadySubmitted`, `selectedOption`, `submittedAt`.
- `POST`: recibe `{ questionId, selectedOption, submittedBy, submittedByDisplayName }`.

### StaticConfig

- `questionText`
- `optionsCsv`
- `oneResponsePerUser`

Este modo persiste la respuesta por pregunta y usuario en `localStorage`.

## Validacion

```powershell
npm install
npm run build
```

La cadena `build` ejecuta:

```powershell
heft build --clean --production
heft test --production
heft package-solution --production
```

## Entregables

- paquete generado: `sharepoint/solution/microencuesta.sppkg`
- mocks y tests de utilidades, repositorio, servicio, hook y componente
- docs de mockup, provisioning e inteligencia de proyecto
