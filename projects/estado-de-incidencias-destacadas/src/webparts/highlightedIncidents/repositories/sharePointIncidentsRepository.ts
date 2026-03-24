import type {
  IHighlightedIncidentsRequest,
  IHighlightedIncidentsRepository,
  IIncidentSourceRecord
} from '../models/highlightedIncidentModels';

const incidentsSelectQuery =
  "?$select=Id,Title,Severity,Impact,Status,Workaround,ETA,DetailUrl,SourceName&$top=100";

function normalizeWebBaseUrl(webUrl: string): string {
  return webUrl.endsWith("/") ? webUrl : `${webUrl}/`;
}

function escapeODataLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function isPathLikeReference(value: string): boolean {
  return value.startsWith("/") || /^https?:\/\//i.test(value) || /[\\/]/.test(value) || /\.aspx([?#].*)?$/i.test(value);
}

function deriveServerRelativeListPath(pathname: string): string {
  const normalized = pathname
    .replace(/\/Forms\/[^/]+\.aspx$/i, "")
    .replace(/\/(AllItems|DispForm|EditForm|NewForm)\.aspx$/i, "")
    .replace(/\/$/, "");

  if (!normalized || normalized === "/") {
    throw new Error("IncidentsList URL must point to a SharePoint list or library.");
  }

  return normalized;
}

function buildGetListItemsEndpoint(webUrl: string, serverRelativeListPath: string): string {
  return `${webUrl}/_api/web/GetList('${escapeODataLiteral(serverRelativeListPath)}')/items${incidentsSelectQuery}`;
}

function resolveListEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const trimmed = listTitleOrUrl.trim();
  if (!trimmed) {
    throw new Error('IncidentsList requires a list title or URL.');
  }

  if (isPathLikeReference(trimmed)) {
    const resolved = new URL(trimmed, normalizeWebBaseUrl(webUrl));
    if (resolved.origin !== new URL(webUrl).origin) {
      throw new Error('IncidentsList URL must be same-origin.');
    }

    if (resolved.pathname.toLowerCase().indexOf('/_api/') !== -1) {
      return resolved.href;
    }

    return buildGetListItemsEndpoint(webUrl, deriveServerRelativeListPath(resolved.pathname));
  }

  return `${webUrl}/_api/web/lists/getbytitle('${escapeODataLiteral(trimmed)}')/items${incidentsSelectQuery}`;
}

async function parsePayload(response: Response): Promise<IIncidentSourceRecord[]> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error('La respuesta de incidencias no es JSON valido.');
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

  throw new Error('La respuesta de incidencias tiene un formato inesperado.');
}

export class SharePointIncidentsRepository implements IHighlightedIncidentsRepository {
  public async loadIncidents(request: IHighlightedIncidentsRequest): Promise<IIncidentSourceRecord[]> {
    const endpoint = resolveListEndpoint(request.webUrl, request.listTitleOrUrl);
    const response = await fetch(endpoint, {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`No se pudo leer la lista de incidencias (${response.status}).`);
    }

    const items = await parsePayload(response);
    return items.map((item) => ({
      ...item,
      sourceName: typeof item.SourceName === 'string' && item.SourceName.trim() ? item.SourceName : request.listTitleOrUrl
    }));
  }
}

export { resolveListEndpoint, deriveServerRelativeListPath };
