import { ensureUniqueStrings } from '@paquete/spfx-common';
import type { IPersonItem, ExpressDirectorySourceType } from '../models/expressDirectoryModels';

const VALID_SOURCE_TYPES: readonly ExpressDirectorySourceType[] = ['Directory', 'SharePointList', 'JsonUrl', 'StaticConfig'];

export function normalizeText(value?: string): string {
  return value?.trim() ?? '';
}

export function normalizeSearchText(value?: string): string {
  return normalizeText(value).toLowerCase();
}

export function parseDataSourceTypes(value: string): ExpressDirectorySourceType[] {
  const parsed: string[] = ensureUniqueStrings(
    normalizeText(value)
      .split(',')
      .map((item) => item.trim())
  );

  return parsed.filter((item): item is ExpressDirectorySourceType =>
    VALID_SOURCE_TYPES.indexOf(item as ExpressDirectorySourceType) !== -1
  );
}

export function normalizePerson(raw: Partial<IPersonItem> & { id?: string | number }): IPersonItem {
  const displayName = normalizeText(raw.displayName) || normalizeText(raw.email) || `Persona ${String(raw.id ?? '0')}`;

  return {
    id: String(raw.id ?? displayName),
    displayName,
    jobTitle: normalizeText(raw.jobTitle) || undefined,
    area: normalizeText(raw.area) || undefined,
    email: normalizeText(raw.email) || undefined,
    profileUrl: normalizeText(raw.profileUrl) || undefined,
    photoUrl: normalizeText(raw.photoUrl) || undefined
  };
}

export function isPartialPerson(person: IPersonItem): boolean {
  return !person.jobTitle || !person.area || !person.email || !person.profileUrl || !person.photoUrl;
}

export function dedupePeople(items: IPersonItem[]): IPersonItem[] {
  const seen = new Set<string>();
  const result: IPersonItem[] = [];

  for (const item of items) {
    const key = normalizeSearchText(item.email || item.profileUrl || item.displayName);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

export function collectAreas(items: IPersonItem[]): string[] {
  return ensureUniqueStrings(
    items
      .map((item) => normalizeText(item.area))
      .filter(Boolean)
  ).sort((left, right) => left.localeCompare(right, 'es'));
}

export function rankPerson(person: IPersonItem, query: string, selectedArea: string): number {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedArea = normalizeSearchText(selectedArea);
  const name = normalizeSearchText(person.displayName);
  const jobTitle = normalizeSearchText(person.jobTitle);
  const area = normalizeSearchText(person.area);
  const email = normalizeSearchText(person.email);
  let score = 0;

  if (normalizedArea && area === normalizedArea) {
    score += 25;
  }

  if (!normalizedQuery) {
    return score - (isPartialPerson(person) ? 1 : 0);
  }

  if (name === normalizedQuery) {
    score += 100;
  } else if (name.startsWith(normalizedQuery)) {
    score += 60;
  } else if (name.includes(normalizedQuery)) {
    score += 35;
  }

  if (jobTitle === normalizedQuery || area === normalizedQuery || email === normalizedQuery) {
    score += 25;
  } else if ([jobTitle, area, email].some((value) => value.includes(normalizedQuery))) {
    score += 15;
  }

  return score - (isPartialPerson(person) ? 1 : 0);
}

export function filterAndSortPeople(
  items: IPersonItem[],
  query: string,
  selectedArea: string,
  maxItems: number
): IPersonItem[] {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedArea = normalizeSearchText(selectedArea);

  const filtered = items.filter((item) => {
    const name = normalizeSearchText(item.displayName);
    const jobTitle = normalizeSearchText(item.jobTitle);
    const area = normalizeSearchText(item.area);
    const email = normalizeSearchText(item.email);
    const profileUrl = normalizeSearchText(item.profileUrl);

    const matchesQuery =
      !normalizedQuery ||
      [name, jobTitle, area, email, profileUrl].some((value) => value.includes(normalizedQuery));
    const matchesArea = !normalizedArea || area === normalizedArea;
    return matchesQuery && matchesArea;
  });

  const sorted = filtered.sort((left, right) => {
    const scoreDelta = rankPerson(right, normalizedQuery, normalizedArea) - rankPerson(left, normalizedQuery, normalizedArea);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.displayName.localeCompare(right.displayName, 'es');
  });

  return maxItems > 0 ? sorted.slice(0, maxItems) : sorted;
}

export function normalizeListRootPath(listTitleOrUrl: string, webUrl: string): string {
  const trimmed = normalizeText(listTitleOrUrl);
  if (!trimmed) {
    return '';
  }

  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
    return trimmed;
  }

  const resolved = new URL(trimmed, webUrl);
  let pathname = resolved.pathname.replace(/\/+$/, '');
  const allItemsSuffix = '/Forms/AllItems.aspx';
  const plainAllItemsSuffix = '/AllItems.aspx';

  if (pathname.endsWith(allItemsSuffix)) {
    pathname = pathname.slice(0, -allItemsSuffix.length);
  } else if (pathname.endsWith(plainAllItemsSuffix)) {
    pathname = pathname.slice(0, -plainAllItemsSuffix.length);
  }

  return pathname || '/';
}

export function buildSharePointListEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const trimmed = normalizeText(listTitleOrUrl);
  if (!trimmed) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    const listRoot = normalizeListRootPath(trimmed, webUrl);
    return `web/GetList(@listUrl)/items?$select=Id,Title,JobTitle,Area,Email,ProfileUrl,PhotoUrl,DisplayName&@listUrl='${encodeURI(listRoot)}'`;
  }

  return `web/lists/getByTitle('${trimmed.replace(/'/g, "''")}')/items?$select=Id,Title,JobTitle,Area,Email,ProfileUrl,PhotoUrl,DisplayName`;
}

export function buildSharePointJsonEndpoint(webUrl: string, jsonUrl: string): string {
  const trimmed = normalizeText(jsonUrl);
  if (!trimmed) {
    throw new Error('jsonUrl is required when sourceType is JsonUrl');
  }

  const resolved = new URL(trimmed, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('jsonUrl must be same-origin or relative');
  }

  return resolved.toString();
}

export function inferPartialDataFlag(items: IPersonItem[]): boolean {
  return items.some(isPartialPerson);
}
