import type {
  IHighlightedIncidentsRequest,
  IHighlightedIncidentsRepository,
  IIncidentSourceRecord
} from '../models/highlightedIncidentModels';

function resolveSameOriginUrl(webUrl: string, sourceUrl: string): string {
  const trimmed = sourceUrl.trim();
  if (!trimmed) {
    throw new Error('JSON source URL is required.');
  }

  const url = new URL(trimmed, webUrl.endsWith('/') ? webUrl : `${webUrl}/`);
  if (url.origin !== new URL(webUrl).origin) {
    throw new Error('JSON source URL must be same-origin.');
  }

  return url.href;
}

async function parsePayload(response: Response): Promise<IIncidentSourceRecord[]> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error('La respuesta del JSON de incidencias no es valida.');
  }

  if (Array.isArray(payload)) {
    return payload as IIncidentSourceRecord[];
  }

  const payloadRecord = payload as { value?: unknown; items?: unknown };

  if (Array.isArray(payloadRecord.value)) {
    return payloadRecord.value as IIncidentSourceRecord[];
  }

  if (Array.isArray(payloadRecord.items)) {
    return payloadRecord.items as IIncidentSourceRecord[];
  }

  throw new Error('La respuesta del JSON de incidencias tiene un formato inesperado.');
}

export class JsonIncidentsRepository implements IHighlightedIncidentsRepository {
  public async loadIncidents(request: IHighlightedIncidentsRequest): Promise<IIncidentSourceRecord[]> {
    const endpoint = resolveSameOriginUrl(request.webUrl, request.listTitleOrUrl);
    const response = await fetch(endpoint, {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`No se pudo leer el JSON de incidencias (${response.status}).`);
    }

    const items = await parsePayload(response);
    return items.map((item, index) => ({
      ...item,
      sourceName:
        typeof item.sourceName === 'string' && item.sourceName.trim()
          ? item.sourceName
          : new URL(endpoint).pathname.split('/').filter(Boolean).pop() ?? `json-${index + 1}`
    }));
  }
}

export { resolveSameOriginUrl };
