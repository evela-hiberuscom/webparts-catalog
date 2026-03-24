import type {
  CorporateResourcesDataSourceType,
  ICorporateResourceItem,
  ICorporateResourcesRawSourceResult,
  ICorporateResourcesRequest
} from '../models/corporateResourcesSearchModels';
import {
  buildSearchApiUrl,
  buildSharePointItemsUrl,
  isSameOriginOrRelativeUrl,
  normalizeOptionalText,
  normalizeText,
  normalizeFeaturedFlag,
  resolveSameOriginUrl,
  splitKeywords
} from '../utils/corporateResourcesSearchUtils';

interface IFetchLikeResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchLikeResponse>;

interface IRawSearchResponse {
  PrimaryQueryResult?: {
    RelevantResults?: {
      Table?: {
        Rows?: {
          results?: Array<{
            Cells?: {
              results?: Array<{ Key?: string; Value?: unknown }>;
            };
          }>;
        };
      };
    };
  };
}

interface IRawItemRecord {
  [key: string]: unknown;
}

function isRecord(value: unknown): value is IRawItemRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readField(record: IRawItemRecord, name: string): unknown {
  const candidates = [name, name.toLowerCase(), name.toUpperCase()];
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(record, candidate)) {
      return record[candidate];
    }
  }

  return undefined;
}

function normalizeSearchApiResponse(payload: unknown): IRawItemRecord[] {
  if (!isRecord(payload)) {
    return [];
  }

  const searchPayload = payload as IRawSearchResponse;
  const rows = searchPayload.PrimaryQueryResult?.RelevantResults?.Table?.Rows?.results ?? [];

  return rows.map((row) => {
    const cells = row.Cells?.results ?? [];
    const entry: IRawItemRecord = {};

    for (const cell of cells) {
      if (typeof cell.Key === 'string' && cell.Key.trim()) {
        entry[cell.Key] = cell.Value;
      }
    }

    return entry;
  });
}

function normalizeCollection(payload: unknown): IRawItemRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidate =
    (Array.isArray(payload.value) && payload.value) ||
    (Array.isArray(payload.items) && payload.items) ||
    (isRecord(payload.d) && Array.isArray(payload.d.results) && payload.d.results) ||
    (Array.isArray((payload as { results?: unknown[] }).results) && (payload as { results: unknown[] }).results);

  return Array.isArray(candidate) ? candidate.filter(isRecord) : [];
}

function mapRecordToItem(record: IRawItemRecord, sourceType: CorporateResourcesDataSourceType, sourceLabel: string, index: number): ICorporateResourceItem {
  const title = normalizeOptionalText(readField(record, 'Title') ?? readField(record, 'title')) ?? `Resource ${index + 1}`;
  const resourceType = normalizeOptionalText(readField(record, 'ResourceType') ?? readField(record, 'resourceType'));
  const category = normalizeOptionalText(readField(record, 'Category') ?? readField(record, 'category'));
  const summary = normalizeOptionalText(readField(record, 'Summary') ?? readField(record, 'summary') ?? readField(record, 'Description') ?? readField(record, 'description'));
  const openUrl =
    normalizeOptionalText(readField(record, 'OpenUrl') ?? readField(record, 'openUrl') ?? readField(record, 'Path') ?? readField(record, 'FileRef')) ??
    undefined;
  const isFeatured = normalizeFeaturedFlag(readField(record, 'IsFeatured') ?? readField(record, 'isFeatured') ?? readField(record, 'Featured'));
  const keywords = splitKeywords(readField(record, 'Keywords') ?? readField(record, 'keywords'));

  return {
    id:
      normalizeOptionalText(readField(record, 'Id') ?? readField(record, 'ID') ?? readField(record, 'id')) ??
      `${sourceType.toLowerCase()}-${index + 1}`,
    title,
    resourceType,
    category,
    summary,
    openUrl,
    isExactMatch: false,
    isFeatured,
    sourceType,
    sourceLabel,
    keywords
  };
}

function collectFetchHeaders(): Record<string, string> {
  return {
    Accept: 'application/json;odata=nometadata'
  };
}

function collectJsonHeaders(): Record<string, string> {
  return {
    Accept: 'application/json'
  };
}

function createQueryMatcher(query: string): (item: ICorporateResourceItem) => boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return () => true;
  }

  return (item) => {
    const haystack = [
      item.title,
      item.resourceType ?? '',
      item.category ?? '',
      item.summary ?? '',
      item.keywords.join(' '),
      item.openUrl ?? ''
    ]
      .join(' ')
      .toLowerCase();

    return haystack.indexOf(normalized) >= 0;
  };
}

async function fetchJson(fetcher: Fetcher, url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetcher(url, init);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

export class CorporateResourcesRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async load(request: ICorporateResourcesRequest): Promise<ICorporateResourcesRawSourceResult[]> {
    const types = request.dataSourceTypes.length > 0 ? request.dataSourceTypes : ['SearchAPI'];
    const results: ICorporateResourcesRawSourceResult[] = [];

    for (const sourceType of types) {
      if (sourceType === 'SearchAPI') {
        results.push(await this.loadFromSearchApi(request));
        continue;
      }

      if (sourceType === 'SharePointList') {
        results.push(await this.loadFromSharePointItems(request, false));
        continue;
      }

      if (sourceType === 'SharePointLibrary') {
        results.push(await this.loadFromSharePointItems(request, true));
        continue;
      }

      if (sourceType === 'JsonUrl') {
        results.push(await this.loadFromJsonUrl(request));
      }
    }

    return results;
  }

  private async loadFromSearchApi(request: ICorporateResourcesRequest): Promise<ICorporateResourcesRawSourceResult> {
    const query = normalizeText(request.query);
    if (!query) {
      return {
        items: [],
        sourceLabel: 'SearchAPI',
        hasPartialData: false
      };
    }

    const endpoint = buildSearchApiUrl(request.webUrl, query, request.maxItems, request.searchScopeUrl);
    const payload = await fetchJson(this.fetcher, endpoint, {
      headers: collectFetchHeaders(),
      credentials: 'same-origin'
    });
    const records = normalizeSearchApiResponse(payload);
    const items = records.map((record, index) => mapRecordToItem(record, 'SearchAPI', 'SearchAPI', index));

    return {
      items,
      sourceLabel: 'SearchAPI',
      hasPartialData: items.some((item) => !item.openUrl || !item.summary)
    };
  }

  private async loadFromSharePointItems(
    request: ICorporateResourcesRequest,
    libraryMode: boolean
  ): Promise<ICorporateResourcesRawSourceResult> {
    if (!normalizeText(request.listTitleOrUrl)) {
      return {
        items: [],
        sourceLabel: libraryMode ? 'SharePointLibrary' : 'SharePointList',
        hasPartialData: false
      };
    }

    const endpoint = buildSharePointItemsUrl(request.webUrl, request.listTitleOrUrl, request.maxItems, libraryMode);
    const payload = await fetchJson(this.fetcher, endpoint, {
      headers: collectFetchHeaders(),
      credentials: 'same-origin'
    });
    const records = normalizeCollection(payload);
    const matcher = createQueryMatcher(request.query);
    const sourceLabel = libraryMode ? 'SharePointLibrary' : 'SharePointList';
    const items = records
      .map((record, index) => {
        const mapped = mapRecordToItem(record, libraryMode ? 'SharePointLibrary' : 'SharePointList', sourceLabel, index);
        if (libraryMode && !mapped.openUrl) {
          const fileRef = normalizeOptionalText(readField(record, 'FileRef') ?? readField(record, 'Path'));
          if (fileRef) {
            mapped.openUrl = fileRef;
          }
        }
        return mapped;
      })
      .filter(matcher);

    return {
      items,
      sourceLabel,
      hasPartialData: items.some((item) => !item.openUrl || !item.summary || !item.category)
    };
  }

  private async loadFromJsonUrl(request: ICorporateResourcesRequest): Promise<ICorporateResourcesRawSourceResult> {
    const rawUrl = normalizeText(request.listTitleOrUrl);
    if (!rawUrl) {
      return {
        items: [],
        sourceLabel: 'JsonUrl',
        hasPartialData: false
      };
    }

    if (!isSameOriginOrRelativeUrl(rawUrl, request.webUrl)) {
      throw new Error('JsonUrl must be same-origin or relative');
    }

    const endpoint = resolveSameOriginUrl(rawUrl, request.webUrl);
    const payload = await fetchJson(this.fetcher, endpoint, {
      headers: collectJsonHeaders(),
      credentials: 'same-origin'
    });
    const records = normalizeCollection(payload);
    const matcher = createQueryMatcher(request.query);
    const items = records
      .map((record, index) => mapRecordToItem(record, 'JsonUrl', 'JsonUrl', index))
      .filter(matcher);

    return {
      items,
      sourceLabel: 'JsonUrl',
      hasPartialData: items.some((item) => !item.openUrl || !item.summary || !item.category)
    };
  }
}
