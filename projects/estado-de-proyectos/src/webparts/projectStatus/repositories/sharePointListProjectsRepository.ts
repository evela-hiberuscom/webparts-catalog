import type { IProjectRecord, IProjectStatusRequest } from '../models/projectStatusTypes';
import { isSameOrigin } from './projectsRepository';
import type { IProjectsRepository } from './projectsRepository';

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function isAbsoluteOrRelativeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('/');
}

function deriveServerRelativePath(listTitleOrUrl: string, webUrl: string): string {
  const url = new URL(listTitleOrUrl, webUrl);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.toLowerCase().endsWith('/allitems.aspx')) {
    pathname = pathname.slice(0, -'/AllItems.aspx'.length);
  } else if (pathname.toLowerCase().endsWith('.aspx')) {
    pathname = pathname.slice(0, pathname.lastIndexOf('/'));
  }

  if (pathname.toLowerCase().endsWith('/forms')) {
    pathname = pathname.slice(0, -'/Forms'.length);
  }

  return pathname.replace(/\/$/, '');
}

function buildItemsEndpoint(request: IProjectStatusRequest): string {
  const listValue = request.listTitleOrUrl.trim();

  if (isAbsoluteOrRelativeUrl(listValue)) {
    if (!isSameOrigin(listValue, request.webUrl)) {
      throw new Error('SharePointList source URL must be same-origin.');
    }

    const serverRelativePath = deriveServerRelativePath(listValue, request.webUrl);
    return new URL(
      `/_api/web/GetList(@listUrl)/items?$select=Id,Title,Status,Owner,RelevantDate,OpenUrl,Category&$top=${Math.max(1, request.maxItems * 2)}&@listUrl='${encodeURIComponent(serverRelativePath)}'`,
      request.webUrl
    ).toString();
  }

  return new URL(
    `/_api/web/lists/getbytitle('${escapeODataString(listValue)}')/items?$select=Id,Title,Status,Owner,RelevantDate,OpenUrl,Category&$top=${Math.max(1, request.maxItems * 2)}`,
    request.webUrl
  ).toString();
}

export class SharePointListProjectsRepository implements IProjectsRepository {
  public constructor(private readonly fetcher: typeof fetch | undefined = globalThis.fetch) {}

  public async loadProjects(request: IProjectStatusRequest): Promise<IProjectRecord[]> {
    if (!request.listTitleOrUrl) {
      throw new Error('SharePointList source requires listTitleOrUrl.');
    }

    if (!this.fetcher) {
      throw new Error('Fetch API is not available in this environment.');
    }

    const endpoint = buildItemsEndpoint(request);

    const response = await this.fetcher(endpoint, {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint list returned ${response.status}.`);
    }

    const payload = (await response.json()) as { value?: unknown[] } | unknown[];
    const items: unknown[] = Array.isArray((payload as { value?: unknown[] }).value)
      ? ((payload as { value: unknown[] }).value ?? [])
      : Array.isArray(payload)
        ? payload
        : [];

    return items.map((item, index) => {
      const current = item as Record<string, unknown>;
      return {
        id: String(current.Id ?? current.id ?? `sp-${index}`),
        title: String(current.Title ?? current.title ?? `Proyecto ${index + 1}`),
        status: current.Status ? String(current.Status) : undefined,
        owner: current.Owner ? String(current.Owner) : undefined,
        relevantDate: current.RelevantDate ? String(current.RelevantDate) : undefined,
        openUrl: current.OpenUrl ? String(current.OpenUrl) : undefined,
        category: current.Category ? String(current.Category) : undefined,
        partial: false
      } satisfies IProjectRecord;
    });
  }

  public getSourceLabel(request: IProjectStatusRequest): string {
    return `Lista SharePoint: ${request.listTitleOrUrl}`;
  }
}
