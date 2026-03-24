import type {
  IChecklistRepositoryResult,
  IOffboardingOrChangeChecklistRequest
} from '../models/offboardingOrChangeChecklistModels';
import {
  buildFallbackChecklistSteps,
  deriveServerRelativePath,
  normalizeChecklistStep,
  normalizeSourceLabel,
  parseChecklistCollection,
  resolveSameOriginUrl,
  sortChecklistSteps
} from '../utils/offboardingOrChangeChecklistUtils';

interface IFetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchResponseLike>;

function createRequestHeaders(): Record<string, string> {
  return {
    Accept: 'application/json'
  };
}

async function fetchJson(fetcher: Fetcher, url: string): Promise<unknown> {
  const response = await fetcher(url, { headers: createRequestHeaders() });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function buildSharePointListEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const value = listTitleOrUrl.trim();
  if (!value) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
    const resolvedUrl = resolveSameOriginUrl(value, webUrl);
    const serverRelativePath = deriveServerRelativePath(resolvedUrl, webUrl);
    return `${webUrl.replace(/\/$/, '')}/_api/web/GetList(@listUrl)/items?$select=Id,Title,Description,Scenario,Phase,Critical,Priority,RelatedUrl,RelatedLabel&@listUrl='${encodeURIComponent(serverRelativePath)}'`;
  }

  return `${webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('${value.replace(/'/g, "''")}')/items?$select=Id,Title,Description,Scenario,Phase,Critical,Priority,RelatedUrl,RelatedLabel`;
}

function loadFromStaticConfig(request: IOffboardingOrChangeChecklistRequest): IChecklistRepositoryResult {
  const raw = request.staticConfigJson.trim();
  if (!raw) {
    const fallback = buildFallbackChecklistSteps(request.defaultScenario, request.defaultPhase);
    return {
      items: fallback,
      sourceLabel: normalizeSourceLabel(request.dataSourceType, request.listTitleOrUrl, request.jsonUrl),
      notes: ['Configuracion local vacia; se usa una checklist inferida para el workbench.'],
      hasPartialData: true
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const records = parseChecklistCollection(parsed);
    const items = sortChecklistSteps(records.map((item, index) => normalizeChecklistStep(item, index, request.defaultPhase)));

    return {
      items,
      sourceLabel: normalizeSourceLabel(request.dataSourceType, request.listTitleOrUrl, request.jsonUrl),
      notes: [],
      hasPartialData: items.some((item) => item.partialData)
    };
  } catch (error) {
    throw new Error(`StaticConfig JSON is invalid: ${(error as Error).message}`);
  }
}

function loadFromCollection(
  request: IOffboardingOrChangeChecklistRequest,
  rawPayload: unknown
): IChecklistRepositoryResult {
  const records = parseChecklistCollection(rawPayload);
  const items = sortChecklistSteps(records.map((item, index) => normalizeChecklistStep(item, index, request.defaultPhase)));

  return {
    items,
    sourceLabel: normalizeSourceLabel(request.dataSourceType, request.listTitleOrUrl, request.jsonUrl),
    notes: [],
    hasPartialData: items.some((item) => item.partialData)
  };
}

async function loadFromSharePointList(fetcher: Fetcher, request: IOffboardingOrChangeChecklistRequest): Promise<IChecklistRepositoryResult> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is SharePointList');
  }

  if (!request.listTitleOrUrl.trim()) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  const endpoint = buildSharePointListEndpoint(request.webUrl, request.listTitleOrUrl);
  const payload = await fetchJson(fetcher, endpoint);
  return loadFromCollection(request, payload);
}

async function loadFromJsonUrl(fetcher: Fetcher, request: IOffboardingOrChangeChecklistRequest): Promise<IChecklistRepositoryResult> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is JsonUrl');
  }

  const url = resolveSameOriginUrl(request.jsonUrl, request.webUrl);
  const payload = await fetchJson(fetcher, url);
  return loadFromCollection(request, payload);
}

export class OffboardingOrChangeChecklistRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async loadChecklist(request: IOffboardingOrChangeChecklistRequest): Promise<IChecklistRepositoryResult> {
    switch (request.dataSourceType) {
      case 'JsonUrl':
        return loadFromJsonUrl(this.fetcher, request);
      case 'SharePointList':
        return loadFromSharePointList(this.fetcher, request);
      case 'StaticConfig':
      default:
        return loadFromStaticConfig(request);
    }
  }
}
