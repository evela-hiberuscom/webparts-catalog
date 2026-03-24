import type { IKpiCatalogConfig, IKpiMiniCardInput, IKpiRepositoryResult } from '../models/kpiModels';

interface IFetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchResponseLike>;

function parseBoolean(input: boolean | string | undefined, fallback: boolean): boolean {
  if (typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    return input.toLowerCase() === 'true';
  }

  return fallback;
}

function parseNumber(input: number | string | undefined): number | undefined {
  if (input === undefined || input === '') {
    return undefined;
  }

  const value = Number(input);
  return Number.isFinite(value) ? value : undefined;
}

function ensureText(input: unknown, fallback: string): string {
  return typeof input === 'string' && input.trim() ? input.trim() : fallback;
}

function normalizeOptionalText(input: unknown): string | undefined {
  if (typeof input !== 'string') {
    return undefined;
  }

  const value = input.trim();
  return value ? value.toLowerCase() : undefined;
}

function pickText(source: Record<string, unknown>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function pickOptionalText(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().toLowerCase();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value).toLowerCase();
    }
  }

  return undefined;
}

function pickRawValue(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }

  return undefined;
}

function normalizeInput(input: IKpiMiniCardInput, index: number): IKpiMiniCardInput {
  return {
    id: ensureText(input.id, `kpi-${index + 1}`),
    label: ensureText(input.label, `KPI ${index + 1}`),
    value: input.value,
    unit: ensureText(input.unit, ''),
    state: normalizeOptionalText(input.state) as 'ok' | 'warning' | 'critical' | 'unknown' | 'partial' | undefined,
    trend: ensureText(input.trend, 'unknown').toLowerCase(),
    comparison: ensureText(input.comparison, ''),
    comparisonLabel: ensureText(input.comparisonLabel, ''),
    openUrl: ensureText(input.openUrl, ''),
    openInNewTab: parseBoolean(input.openInNewTab, false),
    priority: parseNumber(input.priority),
    threshold: parseNumber(input.threshold),
    thresholdDirection: ensureText(input.thresholdDirection, 'above').toLowerCase() as 'above' | 'below',
    badge: normalizeOptionalText(input.badge) as 'ok' | 'warning' | 'critical' | 'unknown' | 'partial' | undefined,
    description: ensureText(input.description, '')
  };
}

function coerceRawItem(raw: unknown, index: number): IKpiMiniCardInput {
  if (!raw || typeof raw !== 'object') {
    return normalizeInput({}, index);
  }

  const source = raw as Record<string, unknown>;

  return normalizeInput(
    {
      id: pickText(source, ['id', 'ID', 'Id', 'key', 'Key'], `kpi-${index + 1}`),
      label: pickText(source, ['label', 'Label', 'title', 'Title', 'name', 'Name'], `KPI ${index + 1}`),
      value: pickRawValue(source, ['value', 'Value']) as number | string | undefined,
      unit: pickText(source, ['unit', 'Unit'], ''),
      state: pickOptionalText(source, ['state', 'State']) as 'ok' | 'warning' | 'critical' | 'unknown' | 'partial' | undefined,
      trend: pickText(source, ['trend', 'Trend'], 'unknown'),
      comparison: pickText(source, ['comparison', 'Comparison'], ''),
      comparisonLabel: pickText(source, ['comparisonLabel', 'ComparisonLabel'], ''),
      openUrl: pickText(source, ['openUrl', 'OpenUrl', 'url', 'Url', 'link', 'Link'], ''),
      openInNewTab: parseBoolean(pickRawValue(source, ['openInNewTab', 'OpenInNewTab']) as boolean | string | undefined, false),
      priority: pickRawValue(source, ['priority', 'Priority']) as number | string | undefined,
      threshold: pickRawValue(source, ['threshold', 'Threshold']) as number | string | undefined,
      thresholdDirection: pickText(source, ['thresholdDirection', 'ThresholdDirection'], 'above') as 'above' | 'below',
      badge: pickOptionalText(source, ['badge', 'Badge']) as 'ok' | 'warning' | 'critical' | 'unknown' | 'partial' | undefined,
      description: pickText(source, ['description', 'Description'], '')
    },
    index
  );
}

function parseCollection(raw: unknown): IKpiMiniCardInput[] {
  if (Array.isArray(raw)) {
    return raw.map((item, index) => coerceRawItem(item, index));
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown[] }).items)) {
    return ((raw as { items?: unknown[] }).items ?? []).map((item, index) => coerceRawItem(item, index));
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as { value?: unknown[] }).value)) {
    return ((raw as { value?: unknown[] }).value ?? []).map((item, index) => coerceRawItem(item, index));
  }

  if (raw && typeof raw === 'object') {
    const payload = raw as { d?: { results?: unknown[] }; results?: unknown[] };
    if (Array.isArray(payload.results)) {
      return payload.results.map((item, index) => coerceRawItem(item, index));
    }

    if (payload.d && Array.isArray(payload.d.results)) {
      return payload.d.results.map((item, index) => coerceRawItem(item, index));
    }
  }

  throw new Error('Expected an array payload or a payload with items/value/results collections');
}

function isExplicitEmptyValue(input: unknown): boolean {
  return input === undefined || input === '';
}

function extractPartialFlags(items: IKpiMiniCardInput[]): boolean {
  return items.some((item) => !item.comparison || isExplicitEmptyValue(item.value) || !item.openUrl || item.trend === 'unknown');
}

function createRequestHeaders(): Record<string, string> {
  return {
    Accept: 'application/json'
  };
}

function escapeODataTitle(value: string): string {
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

async function fetchJson(fetcher: Fetcher, url: string): Promise<unknown> {
  const response = await fetcher(url, { headers: createRequestHeaders() });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function resolveSameOriginUrl(rawUrl: string, baseUrl: string, contextLabel: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error(`${contextLabel} is required`);
  }

  const base = new URL(baseUrl);
  const resolved = new URL(trimmed, base);

  if (resolved.origin !== base.origin) {
    throw new Error(`${contextLabel} must be same-origin or relative`);
  }

  return resolved.toString();
}

async function loadFromSharePointList(fetcher: Fetcher, config: IKpiCatalogConfig): Promise<IKpiRepositoryResult> {
  if (!config.webUrl) {
    throw new Error('webUrl is required when sourceType is SharePointList');
  }

  if (!config.listTitleOrUrl) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  const listTitleOrUrl = config.listTitleOrUrl.trim();
  let url: string;

  if (isAbsoluteOrRelativeUrl(listTitleOrUrl)) {
    const resolvedUrl = resolveSameOriginUrl(listTitleOrUrl, config.webUrl, 'listTitleOrUrl');
    const serverRelativePath = deriveServerRelativePath(resolvedUrl, config.webUrl);
    url = `${config.webUrl.replace(/\/$/, '')}/_api/web/GetList(@listUrl)/items?$top=100&@listUrl='${encodeURIComponent(serverRelativePath)}'`;
  } else {
    const listTitle = escapeODataTitle(listTitleOrUrl);
    url = `${config.webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('${listTitle}')/items?$top=100`;
  }

  const payload = await fetchJson(fetcher, url);
  const inputs = parseCollection(payload);

  return {
    inputs,
    sourceLabel: `SharePoint list: ${config.listTitleOrUrl}`,
    hasPartialData: extractPartialFlags(inputs),
    notes: []
  };
}

async function loadFromJsonUrl(fetcher: Fetcher, config: IKpiCatalogConfig): Promise<IKpiRepositoryResult> {
  if (!config.webUrl) {
    throw new Error('webUrl is required when sourceType is JsonUrl');
  }

  const url = resolveSameOriginUrl(config.jsonUrl ?? '', config.webUrl, 'jsonUrl');
  const payload = await fetchJson(fetcher, url);
  const inputs = parseCollection(payload);

  return {
    inputs,
    sourceLabel: 'JSON URL (same-origin)',
    hasPartialData: extractPartialFlags(inputs),
    notes: []
  };
}

async function loadFromApiEndpoint(fetcher: Fetcher, config: IKpiCatalogConfig): Promise<IKpiRepositoryResult> {
  if (!config.webUrl) {
    throw new Error('webUrl is required when sourceType is ApiEndpoint');
  }

  const url = resolveSameOriginUrl(config.apiEndpointUrl ?? '', config.webUrl, 'apiEndpointUrl');
  const payload = await fetchJson(fetcher, url);
  const inputs = parseCollection(payload);

  return {
    inputs,
    sourceLabel: 'API endpoint (same-origin)',
    hasPartialData: extractPartialFlags(inputs),
    notes: []
  };
}

function loadFromStaticConfig(config: IKpiCatalogConfig): IKpiRepositoryResult {
  const raw = (config.kpiCardsJson ?? '').trim();
  const notes: string[] = [];

  if (!raw) {
    notes.push('kpiCardsJson is empty; the StaticConfig source is intentionally empty.');
    return {
      inputs: [],
      sourceLabel: 'Static configuration (empty)',
      hasPartialData: false,
      notes
    };
  }

  try {
    const payload = JSON.parse(raw) as unknown;
    const inputs = parseCollection(payload);

    if (inputs.length === 0) {
      notes.push('kpiCardsJson parsed successfully but produced no items.');
      return {
        inputs: [],
        sourceLabel: 'Static configuration (empty)',
        hasPartialData: false,
        notes
      };
    }

    return {
      inputs,
      sourceLabel: 'Static configuration',
      hasPartialData: extractPartialFlags(inputs),
      notes
    };
  } catch (error) {
    const message = (error as Error).message;
    notes.push(`Failed to parse kpiCardsJson: ${message}`);
    return {
      inputs: [],
      sourceLabel: 'Static configuration (invalid)',
      hasPartialData: false,
      errorMessage: message,
      notes
    };
  }
}

export class KpiCatalogRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async load(config: IKpiCatalogConfig): Promise<IKpiRepositoryResult> {
    switch (config.sourceType) {
      case 'JsonUrl':
        return loadFromJsonUrl(this.fetcher, config);
      case 'ApiEndpoint':
        return loadFromApiEndpoint(this.fetcher, config);
      case 'SharePointList':
        return loadFromSharePointList(this.fetcher, config);
      case 'StaticConfig':
      default:
        return loadFromStaticConfig(config);
    }
  }
}

export function normalizeRepositoryInputs(inputs: IKpiMiniCardInput[]): IKpiMiniCardInput[] {
  return inputs.map((input, index) => normalizeInput(input, index));
}
