import type { AlertDataSourceType, IAlertBarRequest, IAlertItem, IAlertRepositoryResult } from '../models/alertModels';
import {
  deriveListRootPath,
  escapeODataString,
  normalizePriority,
  normalizeSeverity,
  normalizeText,
  sameOriginUrl
} from '../utils/alertRules';

interface IRawAlertRecord {
  [key: string]: unknown;
}

function readField(record: IRawAlertRecord, name: string): unknown {
  const candidates = [name, name.toLowerCase(), name.toUpperCase()];
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(record, candidate)) {
      return record[candidate];
    }
  }

  return undefined;
}

function normalizeAlertRecord(record: IRawAlertRecord, index: number, webAbsoluteUrl: string): { item?: IAlertItem; isPartial: boolean } {
  const title = normalizeText(readField(record, 'title') ?? readField(record, 'Title'));
  if (!title) {
    return { isPartial: true };
  }

  const severity = normalizeSeverity(readField(record, 'severity') ?? readField(record, 'Severity'));
  const message = normalizeText(readField(record, 'message') ?? readField(record, 'Message'));
  const startAt = normalizeText(readField(record, 'startAt') ?? readField(record, 'StartAt'));
  const endAt = normalizeText(readField(record, 'endAt') ?? readField(record, 'EndAt'));
  const rawCtaUrl = normalizeText(readField(record, 'ctaUrl') ?? readField(record, 'CtaUrl'));
  const ctaUrl = sameOriginUrl(rawCtaUrl, webAbsoluteUrl);
  const priority = normalizePriority(readField(record, 'priority') ?? readField(record, 'Priority'));

  return {
    item: {
      id: normalizeText(readField(record, 'id') ?? readField(record, 'Id')) ?? `alert-${index}`,
      severity,
      title,
      message,
      startAt,
      endAt,
      ctaUrl,
      priority
    },
    isPartial:
      severity === 'unknown' ||
      !message ||
      !startAt ||
      !endAt ||
      !ctaUrl
  };
}

function normalizeAlertCollection(records: IRawAlertRecord[], webAbsoluteUrl: string): IAlertRepositoryResult {
  const items: IAlertItem[] = [];
  let hasPartialData = false;

  records.forEach((record, index) => {
    const normalized = normalizeAlertRecord(record, index, webAbsoluteUrl);
    hasPartialData = hasPartialData || normalized.isPartial;
    if (normalized.item) {
      items.push(normalized.item);
    }
  });

  return {
    items,
    hasPartialData,
    sourceLabel: 'SharePoint'
  };
}

function parseStaticConfigJson(staticConfigJson: string | undefined, webAbsoluteUrl: string): IAlertRepositoryResult {
  const trimmed = staticConfigJson?.trim();
  if (!trimmed) {
    return {
      items: [],
      hasPartialData: false,
      sourceLabel: 'StaticConfig'
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('StaticConfig JSON is malformed.');
  }

  const candidates = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { items?: unknown[] }).items)
      ? (parsed as { items: unknown[] }).items
      : Array.isArray((parsed as { alerts?: unknown[] }).alerts)
        ? (parsed as { alerts: unknown[] }).alerts
        : Array.isArray((parsed as { value?: unknown[] }).value)
          ? (parsed as { value: unknown[] }).value
          : undefined;

  if (!candidates) {
    return {
      items: [],
      hasPartialData: false,
      sourceLabel: 'StaticConfig'
    };
  }

  return normalizeAlertCollection(candidates.filter((entry): entry is IRawAlertRecord => Boolean(entry)), webAbsoluteUrl);
}

function buildSharePointListEndpoint(request: IAlertBarRequest): { endpoint: string; sourceLabel: string } {
  const value = request.listTitleOrUrl.trim();
  if (!value) {
    throw new Error('listTitleOrUrl is required.');
  }

  const looksLikeUrl = value.startsWith('/') || /^https?:\/\//i.test(value);

  if (looksLikeUrl) {
    const url = sameOriginUrl(value, request.webAbsoluteUrl);
    if (!url) {
      throw new Error('listTitleOrUrl must be same-origin when provided as a URL.');
    }

    const listPath = deriveListRootPath(url, request.webAbsoluteUrl);
    return {
      endpoint: `${request.webAbsoluteUrl}/_api/web/GetList(@listUrl)/items?@listUrl='${encodeURIComponent(listPath)}'`,
      sourceLabel: 'SharePointListUrl'
    };
  }

  return {
    endpoint: `${request.webAbsoluteUrl}/_api/web/lists/GetByTitle('${escapeODataString(value)}')/items`,
    sourceLabel: 'SharePointListTitle'
  };
}

function getSelectClause(maxAlerts: number): string {
  const fetchLimit = Math.max(Math.trunc(maxAlerts) * 5, 20);
  return `$select=Id,Title,Severity,Message,StartAt,EndAt,CtaUrl,Priority&$orderby=Priority asc,Id asc&$top=${fetchLimit}`;
}

export class AlertsRepository {
  public constructor(
    private readonly spHttpClient: Pick<{ get(url: string, options?: unknown, configuration?: unknown): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }> }, 'get'>,
    private readonly webAbsoluteUrl: string
  ) {}

  public async load(request: IAlertBarRequest): Promise<IAlertRepositoryResult> {
    switch (request.dataSourceType as AlertDataSourceType) {
      case 'JsonUrl':
        return this.loadFromJsonUrl(request);
      case 'StaticConfig':
        return parseStaticConfigJson(request.staticConfigJson, this.webAbsoluteUrl);
      case 'SharePointList':
      default:
        return this.loadFromSharePointList(request);
    }
  }

  private async loadFromJsonUrl(request: IAlertBarRequest): Promise<IAlertRepositoryResult> {
    const sourceUrl = sameOriginUrl(request.jsonUrl, this.webAbsoluteUrl);
    if (!sourceUrl) {
      throw new Error('JsonUrl must be a same-origin or relative URL.');
    }

    const response = await fetch(new URL(sourceUrl, this.webAbsoluteUrl).toString(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`JsonUrl request failed with status ${response.status}.`);
    }

    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      throw new Error('JsonUrl payload is malformed.');
    }

    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { items?: unknown[] }).items)
        ? (parsed as { items: unknown[] }).items
        : Array.isArray((parsed as { alerts?: unknown[] }).alerts)
          ? (parsed as { alerts: unknown[] }).alerts
          : Array.isArray((parsed as { value?: unknown[] }).value)
            ? (parsed as { value: unknown[] }).value
            : undefined;

    if (!items) {
      throw new Error('JsonUrl payload is not an alerts collection.');
    }

    return {
      ...normalizeAlertCollection(items.filter((entry): entry is IRawAlertRecord => Boolean(entry)), this.webAbsoluteUrl),
      sourceLabel: 'JsonUrl'
    };
  }

  private async loadFromSharePointList(request: IAlertBarRequest): Promise<IAlertRepositoryResult> {
    const { endpoint, sourceLabel } = buildSharePointListEndpoint(request);
    const response = await this.spHttpClient.get(`${endpoint}&${getSelectClause(request.maxAlerts)}`);

    if (!response.ok) {
      throw new Error(`SharePoint list request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as { value?: IRawAlertRecord[] };
    if (!Array.isArray(payload.value)) {
      throw new Error('SharePoint list payload is malformed.');
    }

    const normalized = normalizeAlertCollection(payload.value, this.webAbsoluteUrl);
    return {
      ...normalized,
      sourceLabel
    };
  }
}
