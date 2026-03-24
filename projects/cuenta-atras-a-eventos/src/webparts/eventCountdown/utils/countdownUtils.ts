import type {
  CountdownPhase,
  ICountdownItem,
  ICountdownRemaining,
  ICountdownSourceRecord,
  ICountdownWebPartConfig
} from '../models/eventCountdownModels';

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function createLowerCaseLookup(source: ICountdownSourceRecord): Record<string, string> {
  return Object.keys(source).reduce((lookup, key) => {
    lookup[key.toLowerCase()] = key;
    return lookup;
  }, {} as Record<string, string>);
}

function getRawValue(source: ICountdownSourceRecord, names: string[]): unknown {
  const lookup = createLowerCaseLookup(source);

  for (const name of names) {
    const key = lookup[name.toLowerCase()];
    if (key !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function getTextValue(source: ICountdownSourceRecord, names: string[], fallback = ''): string {
  const value = getRawValue(source, names);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function getOptionalTextValue(source: ICountdownSourceRecord, names: string[]): string | undefined {
  const value = getTextValue(source, names);
  return value ? value : undefined;
}

function isPathLikeReference(value: string): boolean {
  return value.startsWith('/') || value.indexOf('/') !== -1 || /^https?:\/\//i.test(value) || /\.aspx([?#].*)?$/i.test(value);
}

export function resolveSameOriginUrl(value: string, baseUrl: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }

  const base = new URL(baseUrl);
  const resolved = new URL(trimmed, base);

  if (resolved.origin !== base.origin) {
    throw new Error(`${label} must be same-origin or relative`);
  }

  return resolved.toString();
}

export function normalizeListServerRelativePath(pathname: string): string {
  let normalized = decodeURIComponent(pathname).replace(/\/+$/, '');

  if (/\/Forms\/AllItems\.aspx$/i.test(normalized)) {
    normalized = normalized.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (/\/AllItems\.aspx$/i.test(normalized)) {
    normalized = normalized.slice(0, -'/AllItems.aspx'.length);
  } else if (/\/Forms\/[^/]+\.aspx$/i.test(normalized)) {
    normalized = normalized.slice(0, normalized.lastIndexOf('/Forms'));
  } else if (/\/[^/]+\.aspx$/i.test(normalized)) {
    normalized = normalized.slice(0, normalized.lastIndexOf('/'));
  }

  return normalized.replace(/\/$/, '');
}

export function buildListItemsEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const baseUrl = webUrl.replace(/\/$/, '');
  const trimmed = listTitleOrUrl.trim();

  if (!trimmed) {
    throw new Error('listTitleOrUrl is required');
  }

  if (isPathLikeReference(trimmed)) {
    const resolved = new URL(trimmed, `${baseUrl}/`);
    if (resolved.origin !== new URL(baseUrl).origin) {
      throw new Error('listTitleOrUrl must be same-origin or relative');
    }

    const serverRelativePath = normalizeListServerRelativePath(resolved.pathname);
    return `${baseUrl}/_api/web/GetList(@listUrl)/items?$top=100&@listUrl='${encodeURIComponent(serverRelativePath)}'`;
  }

  const escapedTitle = trimmed.replace(/'/g, "''");
  return `${baseUrl}/_api/web/lists/getbytitle('${escapedTitle}')/items?$top=100`;
}

export function buildJsonUrl(baseUrl: string, jsonUrl: string | undefined): string {
  return resolveSameOriginUrl(jsonUrl ?? '', baseUrl, 'jsonUrl');
}

function parseDateCandidate(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return undefined;
}

export function parseCountdownDate(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function sameLocalDate(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function calculateRemaining(targetDate: Date, now: Date): ICountdownRemaining {
  const difference = Math.max(0, targetDate.getTime() - now.getTime());
  const days = Math.floor(difference / MS_PER_DAY);
  const hours = Math.floor((difference % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((difference % MS_PER_HOUR) / MS_PER_MINUTE);

  return {
    days,
    hours,
    minutes,
    totalMinutes: Math.floor(difference / MS_PER_MINUTE)
  };
}

export function formatRemainingSummary(remaining: ICountdownRemaining): string {
  const segments: string[] = [];

  if (remaining.days > 0) {
    segments.push(`${remaining.days} ${remaining.days === 1 ? 'día' : 'días'}`);
  }

  if (remaining.hours > 0 || segments.length > 0) {
    segments.push(`${remaining.hours} ${remaining.hours === 1 ? 'hora' : 'horas'}`);
  }

  segments.push(`${remaining.minutes} ${remaining.minutes === 1 ? 'minuto' : 'minutos'}`);
  return segments.join(' · ');
}

export function formatEventDate(value: string): string {
  const date = parseCountdownDate(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function deriveCountdownPhase(item: ICountdownItem, now: Date): CountdownPhase {
  const targetDate = parseCountdownDate(item.targetDate);

  if (!targetDate) {
    return 'unknown';
  }

  if (now.getTime() < targetDate.getTime()) {
    return 'countdown';
  }

  if (sameLocalDate(now, targetDate)) {
    return 'live';
  }

  return 'completed';
}

function isTruthyValue(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
  }

  return false;
}

export function mapSourceRecordToCountdownItem(
  source: ICountdownSourceRecord,
  config: Pick<ICountdownWebPartConfig, 'eventTitle' | 'targetDate' | 'subtitle' | 'detailUrl' | 'titleField' | 'targetDateField' | 'subtitleField' | 'detailUrlField' | 'showCompleted'>
): ICountdownItem {
  const titleFields = [config.titleField, 'title', 'Title', 'eventTitle', 'EventTitle', 'name', 'Name'].filter(Boolean) as string[];
  const dateFields = [config.targetDateField, 'targetDate', 'TargetDate', 'date', 'Date', 'eventDate', 'EventDate'].filter(Boolean) as string[];
  const subtitleFields = [config.subtitleField, 'subtitle', 'Subtitle', 'description', 'Description', 'summary', 'Summary'].filter(Boolean) as string[];
  const detailUrlFields = [config.detailUrlField, 'detailUrl', 'DetailUrl', 'url', 'Url', 'link', 'Link'].filter(Boolean) as string[];

  const title = getTextValue(source, titleFields, config.eventTitle || 'Cuenta atrás a eventos');
  const targetDateText = getTextValue(source, dateFields, config.targetDate);
  const subtitle = getOptionalTextValue(source, subtitleFields) ?? config.subtitle;
  const detailUrl = getOptionalTextValue(source, detailUrlFields) ?? config.detailUrl;

  return {
    title,
    targetDate: parseDateCandidate(targetDateText) ?? targetDateText,
    subtitle,
    detailUrl,
    state: 'unknown',
    showCompleted: config.showCompleted,
    hasPartialData:
      !title ||
      !targetDateText ||
      !subtitle ||
      !detailUrl ||
      isTruthyValue(getRawValue(source, ['hasPartialData', 'HasPartialData', 'isPartial', 'IsPartial']))
  };
}

export function selectPrimaryRecord(records: ICountdownSourceRecord[], config: Pick<ICountdownWebPartConfig, 'targetDate'>): ICountdownSourceRecord | null {
  if (!records.length) {
    return null;
  }

  const datePreference = records.find((record) => {
    const candidate = getTextValue(record, ['targetDate', 'TargetDate', 'date', 'Date', 'eventDate', 'EventDate']);
    return Boolean(candidate || config.targetDate);
  });

  return datePreference ?? records[0] ?? null;
}
