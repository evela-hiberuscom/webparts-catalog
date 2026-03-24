import type { IQuickAction, IQuickActionsRepositoryResult, IQuickActionsRequest } from '../models/quickActionsModels';
import {
  buildFallbackQuickActions,
  type IQuickActionsSourceRecord,
  normalizeCollection,
  normalizeQuickAction,
  normalizeNumber,
  normalizeText
} from '../utils/quickActionsUtils';

interface IHttpClientLike {
  get(url: string, options?: unknown): Promise<{
    ok: boolean;
    status: number;
    json(): Promise<unknown>;
  }>;
}

function isSameOriginOrRelativeUrl(value: string, webUrl: string): boolean {
  const trimmed = normalizeText(value);
  if (!trimmed) {
    return false;
  }

  try {
    const resolved = new URL(trimmed, webUrl);
    return resolved.origin === new URL(webUrl).origin;
  } catch {
    return false;
  }
}

function resolveSameOriginUrl(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('JsonUrl must be same-origin or relative.');
  }

  return resolved.toString();
}

function deriveListRootPath(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  let pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lowerPath = pathName.toLowerCase();

  if (lowerPath.endsWith('/forms/allitems.aspx')) {
    pathName = pathName.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/allitems.aspx')) {
    pathName = pathName.slice(0, -'/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/forms')) {
    pathName = pathName.slice(0, -'/Forms'.length);
  }

  return pathName || '/';
}

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}

function parseRecords(raw: unknown): IQuickActionsSourceRecord[] {
  return normalizeCollection(raw);
}

function mapRecordToAction(record: IQuickActionsSourceRecord, index: number, defaultCategory: string): IQuickAction | undefined {
  return normalizeQuickAction(
    {
      id: normalizeText(record.Id ?? record.id),
      title: normalizeText(record.Title ?? record.title),
      description: normalizeText(record.Description ?? record.description),
      category: normalizeText(record.Category ?? record.category),
      icon: normalizeText(record.Icon ?? record.icon ?? record.IconName ?? record.iconName),
      priority: normalizeNumber(record.Priority ?? record.priority),
      openUrl: normalizeText(record.OpenUrl ?? record.openUrl ?? record.Url ?? record.url)
    },
    index,
    defaultCategory
  );
}

function loadFromStaticConfig(request: IQuickActionsRequest): IQuickActionsRepositoryResult {
  const raw = request.staticActionsJson.trim();
  if (!raw) {
    return {
      items: buildFallbackQuickActions(),
      sourceLabel: 'Built-in sample catalog',
      hasPartialData: false,
      notes: ['staticActionsJson vacío; se usa un catálogo de ejemplo para el workbench.']
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const records = normalizeCollection(parsed);
    const items = records
      .map((record, index) => mapRecordToAction(record, index, request.defaultCategory))
      .filter((value): value is IQuickAction => Boolean(value));

    if (!items.length) {
      return {
        items: buildFallbackQuickActions(),
        sourceLabel: 'Built-in sample catalog',
        hasPartialData: true,
        notes: ['staticActionsJson no devolvió acciones válidas; se usa un catálogo de ejemplo.']
      };
    }

    return {
      items,
      sourceLabel: 'StaticConfig',
      hasPartialData: items.some((item) => !item.openUrl),
      notes: []
    };
  } catch (error) {
    return {
      items: buildFallbackQuickActions(),
      sourceLabel: 'Built-in sample catalog',
      hasPartialData: true,
      notes: [`staticActionsJson inválido: ${(error as Error).message}`]
    };
  }
}

async function loadJson(fetchJson: (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>, request: IQuickActionsRequest): Promise<IQuickActionsRepositoryResult> {
  if (!normalizeText(request.jsonUrl)) {
    throw new Error('jsonUrl is required when sourceType is JsonUrl');
  }

  const resolvedUrl = resolveSameOriginUrl(request.jsonUrl, request.webUrl);
  const response = await fetchJson(resolvedUrl, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`JsonUrl request failed (${response.status}).`);
  }

  const records = parseRecords(await response.json());
  const items = records
    .map((record, index) => mapRecordToAction(record, index, request.defaultCategory))
    .filter((value): value is IQuickAction => Boolean(value));

  return {
    items,
    sourceLabel: 'JsonUrl',
    hasPartialData: items.some((item) => !item.openUrl),
    notes: items.length ? [] : ['JsonUrl no devolvió acciones válidas.']
  };
}

async function loadSharePointList(spHttpClient: IHttpClientLike, request: IQuickActionsRequest): Promise<IQuickActionsRepositoryResult> {
  const value = normalizeText(request.listTitleOrUrl);
  if (!value) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  let endpoint: string;
  let sourceLabel: string;
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
    if (!isSameOriginOrRelativeUrl(value, request.webUrl)) {
      throw new Error('listTitleOrUrl must be same-origin or relative.');
    }

    const listPath = deriveListRootPath(value, request.webUrl);
    endpoint = `${request.webUrl.replace(/\/$/, '')}/_api/web/GetList(@listUrl)/items?$select=Id,Title,Description,Category,Icon,IconName,Priority,OpenUrl&@listUrl='${encodeURIComponent(listPath)}'`;
    sourceLabel = 'SharePointListUrl';
  } else {
    endpoint = `${request.webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('${escapeODataValue(value)}')/items?$select=Id,Title,Description,Category,Icon,IconName,Priority,OpenUrl`;
    sourceLabel = 'SharePointListTitle';
  }

  const response = await spHttpClient.get(endpoint, {
    headers: {
      Accept: 'application/json;odata=nometadata'
    }
  });

  if (!response.ok) {
    throw new Error(`SharePoint list request failed (${response.status}).`);
  }

  const records = parseRecords(await response.json());
  const items = records
    .map((record, index) => mapRecordToAction(record, index, request.defaultCategory))
    .filter((value): value is IQuickAction => Boolean(value));

  return {
    items,
    sourceLabel,
    hasPartialData: items.some((item) => !item.openUrl),
    notes: items.length ? [] : ['La lista no devolvió acciones válidas.']
  };
}

export class QuickActionsRepository {
  public constructor(private readonly spHttpClient: IHttpClientLike, private readonly fetchJson: (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>) {}

  public async load(request: IQuickActionsRequest): Promise<IQuickActionsRepositoryResult> {
    switch (request.dataSourceType) {
      case 'JsonUrl':
        return loadJson(this.fetchJson, request);
      case 'SharePointList':
        return loadSharePointList(this.spHttpClient, request);
      case 'StaticConfig':
      default:
        return loadFromStaticConfig(request);
    }
  }
}
