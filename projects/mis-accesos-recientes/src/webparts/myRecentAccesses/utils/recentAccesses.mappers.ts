import type {
  IRecentResource,
  RecentResourceType
} from '../models/recentAccesses.types';

function ensureUniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

type RawRecentItem = Partial<IRecentResource> & {
  title?: string;
  name?: string;
  url?: string;
  href?: string;
  type?: string;
  lastAccessedAt?: string;
  openUrl?: string;
  sourceLabel?: string;
};

export function normalizeRecentResourceType(value: string | undefined): RecentResourceType {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'document' || normalized === 'page' || normalized === 'app') {
    return normalized;
  }

  return 'unknown';
}

export function normalizeRecentResource(item: RawRecentItem, index: number): IRecentResource {
  const title = (item.title ?? item.name ?? `Acceso reciente ${index + 1}`).trim();
  const openUrl = (item.openUrl ?? item.url ?? item.href)?.trim();

  return {
    id: item.id?.trim() || `recent-${index + 1}`,
    title,
    type: normalizeRecentResourceType(item.type),
    lastAccessedAt: item.lastAccessedAt?.trim() || undefined,
    openUrl: openUrl || undefined,
    sourceLabel: item.sourceLabel?.trim() || 'Fuente local'
  };
}

export function normalizeRecentResources(items: readonly RawRecentItem[]): IRecentResource[] {
  return items.map((item, index) => normalizeRecentResource(item, index));
}

export function sortRecentResources(items: readonly IRecentResource[]): IRecentResource[] {
  return [...items].sort((left, right) => {
    const leftTime = left.lastAccessedAt ? new Date(left.lastAccessedAt).getTime() : Number.NEGATIVE_INFINITY;
    const rightTime = right.lastAccessedAt ? new Date(right.lastAccessedAt).getTime() : Number.NEGATIVE_INFINITY;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.title.localeCompare(right.title);
  });
}

export function filterRecentResources(
  items: readonly IRecentResource[],
  resourceTypeFilter: string,
  maxItems: number
): IRecentResource[] {
  const filterValue = resourceTypeFilter.trim().toLowerCase();
  const filtered = filterValue ? items.filter((item) => item.type === filterValue) : [...items];
  return sortRecentResources(filtered).slice(0, Math.max(1, maxItems));
}

export function deriveRecentResourceTypes(items: readonly IRecentResource[]): RecentResourceType[] {
  return ensureUniqueStrings(items.map((item) => item.type)) as RecentResourceType[];
}

export function mapUnknownFieldsToWarnings(items: readonly IRecentResource[]): string[] {
  const warnings: string[] = [];
  if (items.some((item) => !item.openUrl)) {
    warnings.push('Algunos accesos no tienen enlace de apertura.');
  }
  if (items.some((item) => !item.lastAccessedAt)) {
    warnings.push('Algunos accesos no tienen fecha de ultimo acceso.');
  }

  return warnings;
}
