import type {
  IOnboardingChecklistRepositoryResult,
  IOnboardingChecklistRequest
} from '../models/onboardingChecklistModels';
import {
  deriveServerRelativeListPath,
  normalizeOnboardingChecklistStep,
  normalizeSourceLabel,
  parseChecklistCollection,
  resolveSameOriginUrl,
  sortOnboardingChecklistSteps
} from '../utils/onboardingChecklistUtils';

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
    const serverRelativePath = deriveServerRelativeListPath(resolvedUrl, webUrl);
    return `${webUrl.replace(/\/$/, '')}/_api/web/GetList(@listUrl)/items?$select=Id,Title,Description,Phase,Variant,Mandatory,Order,RelatedUrl,RelatedLabel&@listUrl='${encodeURIComponent(serverRelativePath)}'`;
  }

  return `${webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('${value.replace(/'/g, "''")}')/items?$select=Id,Title,Description,Phase,Variant,Mandatory,Order,RelatedUrl,RelatedLabel`;
}

function loadFromCollection(
  request: IOnboardingChecklistRequest,
  rawPayload: unknown
): IOnboardingChecklistRepositoryResult {
  const records = parseChecklistCollection(rawPayload);
  const items = sortOnboardingChecklistSteps(
    records.map((item, index) => normalizeOnboardingChecklistStep(item, index, request.defaultPhase))
  );

  return {
    items,
    sourceLabel: normalizeSourceLabel(request.dataSourceType, request.listTitleOrUrl, request.jsonUrl),
    notes: [],
    hasPartialData: items.some((item) => item.partialData)
  };
}

function loadFromStaticConfig(request: IOnboardingChecklistRequest): IOnboardingChecklistRepositoryResult {
  const raw = request.staticConfigJson.trim();
  if (!raw) {
    return {
      items: [],
      sourceLabel: normalizeSourceLabel(request.dataSourceType, request.listTitleOrUrl, request.jsonUrl),
      notes: ['Configuracion local vacia.'],
      hasPartialData: false
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return loadFromCollection(request, parsed);
  } catch (error) {
    throw new Error(`StaticConfig JSON is invalid: ${(error as Error).message}`);
  }
}

async function loadFromSharePointList(fetcher: Fetcher, request: IOnboardingChecklistRequest): Promise<IOnboardingChecklistRepositoryResult> {
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

async function loadFromJsonUrl(fetcher: Fetcher, request: IOnboardingChecklistRequest): Promise<IOnboardingChecklistRepositoryResult> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is JsonUrl');
  }

  const url = resolveSameOriginUrl(request.jsonUrl, request.webUrl);
  const payload = await fetchJson(fetcher, url);
  return loadFromCollection(request, payload);
}

export class OnboardingChecklistRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async loadChecklist(request: IOnboardingChecklistRequest): Promise<IOnboardingChecklistRepositoryResult> {
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
