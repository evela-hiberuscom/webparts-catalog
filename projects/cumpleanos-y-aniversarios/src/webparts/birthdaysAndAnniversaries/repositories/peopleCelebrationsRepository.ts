import { SPHttpClient } from '@microsoft/sp-http';
import type {
  CelebrationDataSourceType,
  ICelebrationRecord,
  IPeopleCelebrationsRepositoryResult,
  IPeopleCelebrationsRequest
} from '../models/celebrationModels';
import {
  formatCelebrationDateLabel,
  getDaysRemaining,
  normalizeCelebrationType,
  normalizeDateValue,
  normalizeListReference,
  sanitizeImageUrl
} from '../utils/celebrationUtils';

interface IRawCelebrationItem {
  [key: string]: unknown;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function pickFirstString(...values: unknown[]): string {
  for (const value of values) {
    const candidate = toText(value);
    if (candidate) {
      return candidate;
    }
  }

  return '';
}

function extractCollection(payload: unknown): IRawCelebrationItem[] {
  if (Array.isArray(payload)) {
    return payload as IRawCelebrationItem[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const objectPayload = payload as { items?: unknown; value?: unknown; d?: { results?: unknown } };

  if (Array.isArray(objectPayload.items)) {
    return objectPayload.items as IRawCelebrationItem[];
  }

  if (Array.isArray(objectPayload.value)) {
    return objectPayload.value as IRawCelebrationItem[];
  }

  if (objectPayload.d && Array.isArray(objectPayload.d.results)) {
    return objectPayload.d.results as IRawCelebrationItem[];
  }

  return [];
}

function normalizeRecord(raw: IRawCelebrationItem, index: number, webAbsoluteUrl: string): { record?: ICelebrationRecord; partial: boolean } {
  const displayName = pickFirstString(raw.displayName, raw.DisplayName, raw.nombre, raw.Name, raw.Title, raw.title);

  if (!displayName) {
    return { partial: true };
  }

  const photoUrl = sanitizeImageUrl(raw.photoUrl ?? raw.PhotoUrl ?? raw.avatarUrl ?? raw.AvatarUrl, webAbsoluteUrl);
  const dateValue = normalizeDateValue(raw.date ?? raw.Date ?? raw.CelebrationDate ?? raw.Fecha ?? raw.birthday ?? raw.Birthday ?? raw.anniversaryDate ?? raw.AnniversaryDate);
  const celebrationType = normalizeCelebrationType(raw.celebrationType ?? raw.CelebrationType ?? raw.tipo ?? raw.Type);
  const partial = !photoUrl || !dateValue || celebrationType === 'unknown';

  return {
    partial,
    record: {
      id: pickFirstString(raw.id, raw.ID, raw.Id, raw.UniqueId) || `celebration-${index + 1}`,
      displayName,
      photoUrl,
      celebrationType,
      date: dateValue
    }
  };
}

async function loadJsonPayload(url: string): Promise<unknown> {
  const response = await fetch(url, {
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  }

  return response.json() as Promise<unknown>;
}

async function loadJsonSource(url: string, webAbsoluteUrl: string): Promise<{ items: ICelebrationRecord[]; hasPartialData: boolean }> {
  const resolved = new URL(url, webAbsoluteUrl);
  const baseOrigin = new URL(webAbsoluteUrl).origin;

  if (resolved.origin !== baseOrigin) {
    throw new Error('Only same-origin celebration feeds are allowed.');
  }

  const payload = await loadJsonPayload(resolved.href);
  const collection = extractCollection(payload);
  const normalized: ICelebrationRecord[] = [];
  let hasPartialData = false;

  collection.forEach((item, index) => {
    const next = normalizeRecord(item, index, webAbsoluteUrl);
    if (next.record) {
      normalized.push(next.record);
    }
    hasPartialData = hasPartialData || next.partial;
  });

  return {
    items: normalized,
    hasPartialData
  };
}

async function loadSharePointList(
  request: IPeopleCelebrationsRequest,
  listTitleOrUrl: string
): Promise<{ items: ICelebrationRecord[]; hasPartialData: boolean }> {
  if (!request.spHttpClient) {
    throw new Error('SPHttpClient is required for SharePoint list sources.');
  }

  const reference = normalizeListReference(listTitleOrUrl, request.webAbsoluteUrl);

  if (!reference) {
    throw new Error('The SharePoint list reference is missing or not same-origin.');
  }

  const selectFields = 'Id,Title,CelebrationType,CelebrationDate,PhotoUrl';
  const baseUrl = request.webAbsoluteUrl.replace(/\/$/, '');
  const endpoint =
    reference.mode === 'title'
      ? `${baseUrl}/_api/web/lists/getbytitle('${reference.value.replace(/'/g, "''")}')/items?$select=${selectFields}&$top=500`
      : `${baseUrl}/_api/web/GetList(@listUrl)/items?$select=${selectFields}&$top=500&@listUrl='${encodeURIComponent(reference.value)}'`;

  const response = await request.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  }

  const payload = await response.json();
  const collection = extractCollection(payload);
  const normalized: ICelebrationRecord[] = [];
  let hasPartialData = false;

  collection.forEach((item, index) => {
    const next = normalizeRecord(item, index, request.webAbsoluteUrl);
    if (next.record) {
      normalized.push(next.record);
    }
    hasPartialData = hasPartialData || next.partial;
  });

  return {
    items: normalized,
    hasPartialData
  };
}

function getSourcePriority(dataSourceType: CelebrationDataSourceType): string {
  switch (dataSourceType) {
    case 'Directory':
      return 'Directory JSON';
    case 'SharePointList':
      return 'SharePoint list';
    case 'JsonUrl':
      return 'JSON feed';
    default:
      return 'Unknown source';
  }
}

export class PeopleCelebrationsRepository {
  public async load(request: IPeopleCelebrationsRequest): Promise<IPeopleCelebrationsRepositoryResult> {
    const notes: string[] = [];
    const dataSourceTypes = request.dataSourceTypes.length > 0 ? request.dataSourceTypes : (['SharePointList'] as CelebrationDataSourceType[]);
    let emptyResult: IPeopleCelebrationsRepositoryResult | null = null;
    let lastError: Error | null = null;
    let sawConfiguredSource = false;

    for (const dataSourceType of dataSourceTypes) {
      try {
        if (dataSourceType === 'Directory') {
          if (!request.directoryJsonUrl) {
            notes.push('Directory source configured but directoryJsonUrl is empty.');
            continue;
          }

          sawConfiguredSource = true;
          const result = await loadJsonSource(request.directoryJsonUrl, request.webAbsoluteUrl);
          const repositoryResult: IPeopleCelebrationsRepositoryResult = {
            items: result.items,
            sourceLabel: getSourcePriority(dataSourceType),
            hasPartialData: result.hasPartialData,
            notes
          };

          if (result.items.length > 0 || result.hasPartialData) {
            return repositoryResult;
          }

          emptyResult = repositoryResult;
          continue;
        }

        if (dataSourceType === 'SharePointList') {
          if (!request.listTitleOrUrl) {
            notes.push('SharePoint list source configured but listTitleOrUrl is empty.');
            continue;
          }

          sawConfiguredSource = true;
          const result = await loadSharePointList(request, request.listTitleOrUrl);
          const repositoryResult: IPeopleCelebrationsRepositoryResult = {
            items: result.items,
            sourceLabel: getSourcePriority(dataSourceType),
            hasPartialData: result.hasPartialData,
            notes
          };

          if (result.items.length > 0 || result.hasPartialData) {
            return repositoryResult;
          }

          emptyResult = repositoryResult;
          continue;
        }

        if (dataSourceType === 'JsonUrl') {
          if (!request.jsonUrl) {
            notes.push('JSON source configured but jsonUrl is empty.');
            continue;
          }

          sawConfiguredSource = true;
          const result = await loadJsonSource(request.jsonUrl, request.webAbsoluteUrl);
          const repositoryResult: IPeopleCelebrationsRepositoryResult = {
            items: result.items,
            sourceLabel: getSourcePriority(dataSourceType),
            hasPartialData: result.hasPartialData,
            notes
          };

          if (result.items.length > 0 || result.hasPartialData) {
            return repositoryResult;
          }

          emptyResult = repositoryResult;
          continue;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notes.push(`${getSourcePriority(dataSourceType)} failed: ${message}`);
        lastError = error instanceof Error ? error : new Error(message);
      }
    }

    if (emptyResult) {
      return {
        ...emptyResult,
        hasPartialData: emptyResult.hasPartialData || notes.length > 0,
        notes
      };
    }

    if (lastError && sawConfiguredSource) {
      throw lastError;
    }

    return {
      items: [],
      sourceLabel: 'Sin origen configurado',
      hasPartialData: notes.length > 0 || !sawConfiguredSource,
      notes: notes.length > 0 ? notes : ['No celebration source was configured.']
    };
  }
}
