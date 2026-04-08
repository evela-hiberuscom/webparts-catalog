import type { INewsByAreaItem } from '../models/newsByAreaModels';

export function clampMaxItems(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(12, Math.trunc(value)));
}

export function resolveAbsoluteUrl(webAbsoluteUrl: string, candidate: string | undefined): string | undefined {
  if (!candidate?.trim()) {
    return undefined;
  }

  try {
    return new URL(candidate, webAbsoluteUrl).toString();
  } catch {
    return undefined;
  }
}

export function parseBannerImageUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (value && typeof value === 'object') {
    const item = value as { Url?: string; url?: string };
    return item.Url || item.url;
  }

  return undefined;
}

export function normalizeTag(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizeTags(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, collection) => collection.indexOf(value) === index);
}

export function extractMatchedTags(tags: string[], areaFilter: string): string[] {
  const normalizedFilter = normalizeTag(areaFilter);
  if (!normalizedFilter) {
    return [];
  }

  return tags.filter((tag) => normalizeTag(tag).includes(normalizedFilter));
}

export function formatNewsDate(value: string | undefined, localeName: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat(localeName, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsed);
}

export function isNewsByAreaItemPartial(item: INewsByAreaItem): boolean {
  return !item.summary || !item.imageUrl || !item.openUrl || !item.publishedAt || item.tags.length === 0;
}

export function sortNewsByAreaItems(items: INewsByAreaItem[], featuredFirst: boolean): INewsByAreaItem[] {
  const sorted = [...items].sort((left, right) => {
    const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : Number.NEGATIVE_INFINITY;
    const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });

  return sorted.map((item, index) => ({
    ...item,
    isFeatured: featuredFirst && index === 0
  }));
}
