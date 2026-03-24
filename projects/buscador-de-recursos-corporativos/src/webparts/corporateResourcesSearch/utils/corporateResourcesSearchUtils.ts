import type {
  CorporateResourcesDataSourceType,
  ICorporateResourceItem,
  ICorporateResourcesFacet,
  ICorporateResourcesFilters
} from '../models/corporateResourcesSearchModels';

const SUPPORTED_DATA_SOURCE_TYPES: CorporateResourcesDataSourceType[] = [
  'SearchAPI',
  'SharePointList',
  'SharePointLibrary',
  'JsonUrl'
];

export function normalizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function normalizeOptionalText(value: unknown): string | undefined {
  const normalized = normalizeText(value);
  return normalized ? normalized : undefined;
}

export function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function normalizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return fallback;
}

export function parseDataSourceTypes(value: string): CorporateResourcesDataSourceType[] {
  const tokens = value
    .split(/[,\n;|]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const normalized = tokens.filter((entry): entry is CorporateResourcesDataSourceType =>
    (SUPPORTED_DATA_SOURCE_TYPES as string[]).indexOf(entry) >= 0
  );

  return normalized.length > 0 ? normalized : ['SearchAPI'];
}

export function splitKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n;|]+/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

export function isSameOriginOrRelativeUrl(rawUrl: string | undefined, webUrl: string): boolean {
  const value = normalizeText(rawUrl);
  if (!value) {
    return false;
  }

  try {
    if (/^https?:\/\//i.test(value)) {
      return new URL(value).origin === new URL(webUrl).origin;
    }

    return true;
  } catch {
    return false;
  }
}

export function resolveSameOriginUrl(rawUrl: string | undefined, webUrl: string): string {
  const value = normalizeText(rawUrl);
  if (!value) {
    throw new Error('url is required');
  }

  const resolved = new URL(value, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('url must be same-origin or relative');
  }

  return resolved.toString();
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

export function escapeKqlString(value: string): string {
  return value.replace(/"/g, '\\"').replace(/'/g, "''");
}

export function deriveServerRelativeListRoot(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  let pathname = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lowerPath = pathname.toLowerCase();

  if (lowerPath.endsWith('/forms/allitems.aspx')) {
    pathname = pathname.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/allitems.aspx')) {
    pathname = pathname.slice(0, -'/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/forms')) {
    pathname = pathname.slice(0, -'/Forms'.length);
  }

  return pathname || '/';
}

export function buildSearchApiUrl(webUrl: string, query: string, maxItems: number, scopeUrl: string): string {
  const baseUrl = new URL(webUrl);
  const escapedQuery = escapeKqlString(query.trim());
  const queryText = scopeUrl.trim()
    ? `"${escapedQuery}" AND path:"${escapeKqlString(resolveSameOriginUrl(scopeUrl, webUrl))}*"`
    : `"${escapedQuery}"`;
  const endpoint = new URL(`${baseUrl.origin}/_api/search/query`);
  endpoint.searchParams.set('querytext', `'${queryText}'`);
  endpoint.searchParams.set('rowlimit', String(Math.max(1, maxItems)));
  endpoint.searchParams.set(
    'selectproperties',
    "'Title,Path,Description,FileExtension,SPWebUrl,Author,IsDocument,SiteTitle,HitHighlightedSummary'"
  );
  endpoint.searchParams.set('trimduplicates', 'false');
  endpoint.searchParams.set('enablestemming', 'true');
  return endpoint.toString();
}

export function buildSharePointItemsUrl(webUrl: string, listTitleOrUrl: string, maxItems: number, libraryMode = false): string {
  const baseUrl = new URL(webUrl);
  const value = normalizeText(listTitleOrUrl);

  if (!value) {
    throw new Error('listTitleOrUrl is required');
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
    if (!isSameOriginOrRelativeUrl(value, webUrl)) {
      throw new Error('listTitleOrUrl must be same-origin or relative');
    }

    const listRootPath = deriveServerRelativeListRoot(resolveSameOriginUrl(value, webUrl), webUrl);
    const endpoint = new URL(`${baseUrl.origin}/_api/web/GetList(@listUrl)/items`);
    endpoint.searchParams.set('@listUrl', `'${listRootPath}'`);
    endpoint.searchParams.set(
      '$select',
      libraryMode
        ? 'Id,FileRef,FileLeafRef,Title,ResourceType,Category,Summary,OpenUrl,IsFeatured,Keywords'
        : 'Id,Title,ResourceType,Category,Summary,OpenUrl,IsFeatured,Keywords'
    );
    endpoint.searchParams.set('$top', String(Math.max(10, maxItems * 5)));
    return endpoint.toString();
  }

  const endpoint = new URL(`${baseUrl.origin}/_api/web/lists/getbytitle('${escapeODataString(value)}')/items`);
  endpoint.searchParams.set(
    '$select',
    libraryMode
      ? 'Id,FileRef,FileLeafRef,Title,ResourceType,Category,Summary,OpenUrl,IsFeatured,Keywords'
      : 'Id,Title,ResourceType,Category,Summary,OpenUrl,IsFeatured,Keywords'
  );
  endpoint.searchParams.set('$top', String(Math.max(10, maxItems * 5)));
  return endpoint.toString();
}

export function dedupeResources(items: ICorporateResourceItem[]): ICorporateResourceItem[] {
  const seen = new Map<string, ICorporateResourceItem>();

  for (const item of items) {
    const key = [item.title.toLowerCase(), item.openUrl?.toLowerCase() ?? '', item.sourceType].join('|');
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values());
}

export function rankResourceItem(item: ICorporateResourceItem, query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return item.isFeatured ? 100 : 10;
  }

  const title = item.title.toLowerCase();
  const resourceType = (item.resourceType ?? '').toLowerCase();
  const category = (item.category ?? '').toLowerCase();
  const keywords = item.keywords.map((keyword) => keyword.toLowerCase());

  let score = 0;
  if (title === normalizedQuery) {
    score += 1000;
  } else if (title.startsWith(normalizedQuery)) {
    score += 700;
  } else if (title.indexOf(normalizedQuery) >= 0) {
    score += 500;
  }

  if (resourceType.indexOf(normalizedQuery) >= 0) {
    score += 120;
  }

  if (category.indexOf(normalizedQuery) >= 0) {
    score += 100;
  }

  if (keywords.some((keyword) => keyword.indexOf(normalizedQuery) >= 0)) {
    score += 80;
  }

  if (item.isFeatured) {
    score += 30;
  }

  if (!item.openUrl) {
    score -= 40;
  }

  return score;
}

export function matchesFilters(item: ICorporateResourceItem, filters: ICorporateResourcesFilters): boolean {
  const typeMatch = !filters.resourceType || (item.resourceType ?? '').toLowerCase() === filters.resourceType.toLowerCase();
  const categoryMatch = !filters.category || (item.category ?? '').toLowerCase() === filters.category.toLowerCase();
  return typeMatch && categoryMatch;
}

export function buildFacets(items: ICorporateResourceItem[]): {
  resourceTypes: ICorporateResourcesFacet[];
  categories: ICorporateResourcesFacet[];
} {
  const resourceTypes = new Map<string, number>();
  const categories = new Map<string, number>();

  for (const item of items) {
    const resourceType = normalizeOptionalText(item.resourceType);
    if (resourceType) {
      resourceTypes.set(resourceType, (resourceTypes.get(resourceType) ?? 0) + 1);
    }

    const category = normalizeOptionalText(item.category);
    if (category) {
      categories.set(category, (categories.get(category) ?? 0) + 1);
    }
  }

  const toFacetArray = (source: Map<string, number>): ICorporateResourcesFacet[] =>
    Array.from(source.entries())
      .map(([label, count]) => ({
        label,
        value: label.toLowerCase(),
        count
      }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

  return {
    resourceTypes: toFacetArray(resourceTypes),
    categories: toFacetArray(categories)
  };
}

export function normalizeFeaturedFlag(value: unknown): boolean {
  return normalizeBoolean(value, false);
}

export function sanitizeMaxItems(value: unknown): number {
  return Math.min(50, Math.max(1, normalizeNumber(value, 10)));
}
