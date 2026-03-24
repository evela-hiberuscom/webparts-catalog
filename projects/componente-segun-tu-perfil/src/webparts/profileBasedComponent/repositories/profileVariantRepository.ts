import type {
  IProfileVariant,
  IProfileVariantRepository,
  IProfileVariantRequest
} from '../models/profileBasedComponentModels';
import { isSameOriginUrl } from '../utils/profileVariantMatching';
import { normalizeAudienceTokens, normalizeToken } from '../utils/profileTokens';

interface IFetchJson {
  (url: string, init?: RequestInit): Promise<unknown>;
}

interface IProfileVariantRepositoryOptions {
  fetchJson: IFetchJson;
}

interface IRawVariantRecord {
  Id?: number | string;
  id?: number | string;
  Title?: string;
  title?: string;
  Summary?: string;
  summary?: string;
  Body?: string;
  body?: string;
  IconName?: string;
  iconName?: string;
  AccentLabel?: string;
  accentLabel?: string;
  CtaLabel?: string;
  ctaLabel?: string;
  CtaUrl?: string;
  ctaUrl?: string;
  AudienceTokens?: string | string[];
  audienceTokens?: string | string[];
  IsGeneric?: boolean | string;
  isGeneric?: boolean | string;
  ContentType?: string;
  contentType?: string;
  Priority?: number | string;
  priority?: number | string;
  Tags?: string | string[];
  tags?: string | string[];
  PayloadJson?: string;
  payloadJson?: string;
  Payload?: unknown;
  payload?: unknown;
  VariantJson?: string;
  variantJson?: string;
}

function escapeListTitle(title: string): string {
  return title.replace(/'/g, "''");
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }

  return false;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(/[\s,;|]+/g).filter(Boolean);
  }

  return [];
}

function parsePayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  return raw as Record<string, unknown>;
}

function parsePayloadJson(raw: unknown): Record<string, unknown> {
  if (typeof raw !== 'string' || !raw.trim()) {
    return {};
  }

  const parsed = JSON.parse(raw);
  return parsePayload(parsed);
}

function mapRecordToVariant(record: IRawVariantRecord, fallbackIndex: number): IProfileVariant {
  const payloadFromJson = parsePayloadJson(record.PayloadJson ?? record.payloadJson ?? record.VariantJson ?? record.variantJson);
  const payload = {
    ...payloadFromJson,
    ...(parsePayload(record.Payload ?? record.payload))
  };
  const rawAudienceTokens = record.AudienceTokens ?? record.audienceTokens;
  const title = String(record.Title ?? record.title ?? `Variant ${fallbackIndex + 1}`);
  const summary = String(record.Summary ?? record.summary ?? title);
  const body = String(record.Body ?? record.body ?? '');
  const contentType = String(record.ContentType ?? record.contentType ?? 'card') as IProfileVariant['contentType'];
  const ctaLabel = String(record.CtaLabel ?? record.ctaLabel ?? '');
  const ctaUrl = String(record.CtaUrl ?? record.ctaUrl ?? '');

  return {
    id: String(record.Id ?? record.id ?? `variant-${fallbackIndex + 1}`),
    title,
    summary,
    body,
    iconName: String(record.IconName ?? record.iconName ?? ''),
    accentLabel: String(record.AccentLabel ?? record.accentLabel ?? ''),
    ctaLabel,
    ctaUrl,
    audienceTokens: normalizeAudienceTokens(toStringArray(rawAudienceTokens)),
    isGeneric: toBoolean(record.IsGeneric ?? record.isGeneric),
    contentType,
    priority: toNumber(record.Priority ?? record.priority),
    tags: toStringArray(record.Tags ?? record.tags).map(normalizeToken),
    payload
  };
}

async function parseResponseAsRecords(response: unknown): Promise<IRawVariantRecord[]> {
  if (Array.isArray(response)) {
    return response as IRawVariantRecord[];
  }

  if (!response || typeof response !== 'object') {
    throw new Error('Unsupported profile variant payload shape.');
  }

  const candidate = response as {
    value?: IRawVariantRecord[];
    d?: { results?: IRawVariantRecord[] };
    results?: IRawVariantRecord[];
    items?: IRawVariantRecord[];
  };

  if (Array.isArray(candidate.value)) {
    return candidate.value;
  }

  if (candidate.d && Array.isArray(candidate.d.results)) {
    return candidate.d.results;
  }

  if (Array.isArray(candidate.results)) {
    return candidate.results;
  }

  if (Array.isArray(candidate.items)) {
    return candidate.items;
  }

  throw new Error('Unsupported profile variant payload shape.');
}

function deriveListRootPath(rawUrl: string, siteUrl: string): string {
  const target = new URL(rawUrl, siteUrl);
  let pathName = decodeURIComponent(target.pathname).replace(/\/$/, '');
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

function buildListItemsUrl(siteUrl: string, listTitleOrUrl: string): string {
  const baseUrl = new URL(siteUrl);
  const value = listTitleOrUrl.trim();

  if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
    const target = new URL(value, siteUrl);
    if (!isSameOriginUrl(target.toString(), siteUrl)) {
      throw new Error('SharePoint list URLs must be same-origin.');
    }

    const serverRelativePath = deriveListRootPath(target.toString(), siteUrl);
    return `${baseUrl.origin}/_api/web/GetList(@listUrl)/items?$select=Id,Title,Summary,Body,IconName,AccentLabel,CtaLabel,CtaUrl,AudienceTokens,IsGeneric,ContentType,Priority,Tags&@listUrl='${encodeURIComponent(serverRelativePath)}'`;
  }

  return `${baseUrl.origin}/_api/web/lists/getbytitle('${escapeListTitle(value)}')/items?$select=Id,Title,Summary,Body,IconName,AccentLabel,CtaLabel,CtaUrl,AudienceTokens,IsGeneric,ContentType,Priority,Tags`;
}

function ensureSameOriginJsonUrl(siteUrl: string, jsonUrl: string): string {
  const target = new URL(jsonUrl, siteUrl);
  if (!isSameOriginUrl(target.toString(), siteUrl)) {
    throw new Error('JsonUrl must be same-origin or relative.');
  }

  return target.toString();
}

function buildFetchInit(): RequestInit {
  return {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json;odata=nometadata'
    }
  };
}

class ProfileVariantRepository implements IProfileVariantRepository {
  public constructor(private readonly options: IProfileVariantRepositoryOptions) {}

  public async loadVariants(request: IProfileVariantRequest): Promise<IProfileVariant[]> {
    switch (request.dataSourceType) {
      case 'SharePointList':
        return this.loadFromSharePointList(request);
      case 'JsonUrl':
        return this.loadFromJsonUrl(request);
      case 'StaticConfig':
        return this.loadFromStaticConfig(request);
      default:
        return [];
    }
  }

  private async loadFromSharePointList(request: IProfileVariantRequest): Promise<IProfileVariant[]> {
    const listTitleOrUrl = request.listTitleOrUrl.trim();
    if (!listTitleOrUrl) {
      throw new Error('listTitleOrUrl is required for SharePointList sources.');
    }

    const response = await this.options.fetchJson(buildListItemsUrl(request.siteUrl, listTitleOrUrl), buildFetchInit());
    const records = await parseResponseAsRecords(response);
    return records.map((record, index) => mapRecordToVariant(record, index));
  }

  private async loadFromJsonUrl(request: IProfileVariantRequest): Promise<IProfileVariant[]> {
    const jsonUrl = request.jsonUrl.trim();
    if (!jsonUrl) {
      throw new Error('jsonUrl is required for JsonUrl sources.');
    }

    const response = await this.options.fetchJson(ensureSameOriginJsonUrl(request.siteUrl, jsonUrl), buildFetchInit());
    const records = await parseResponseAsRecords(response);
    return records.map((record, index) => mapRecordToVariant(record, index));
  }

  private async loadFromStaticConfig(request: IProfileVariantRequest): Promise<IProfileVariant[]> {
    const raw = request.staticConfigJson.trim();
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    const records = await parseResponseAsRecords(parsed);
    return records.map((record, index) => mapRecordToVariant(record, index));
  }
}

export function createProfileVariantRepository(options: IProfileVariantRepositoryOptions): IProfileVariantRepository {
  return new ProfileVariantRepository(options);
}
