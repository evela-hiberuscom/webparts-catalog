import type { ISmartFaqItem } from '../models/smartFaqModels';

export function clampMaxItems(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(200, Math.trunc(value)));
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

export function normalizeCategory(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback || 'General';
}

export function parseTextList(value: unknown): string[] {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];
  const result: string[] = [];

  for (const entry of values) {
    if (typeof entry === 'string') {
      entry.split(/[;,|]/).forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) {
          result.push(trimmed);
        }
      });
      continue;
    }

    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      result.push(...parseTextList(record.Label ?? record.label ?? record.Title ?? record.title ?? record.Value ?? record.value));
      result.push(...parseTextList(record.results ?? record.Values ?? record.values));
    }
  }

  return Array.from(new Set(result));
}

export function formatDate(value: string | undefined, localeName: string): string | undefined {
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

export function sortFaqs(items: ISmartFaqItem[]): ISmartFaqItem[] {
  return [...items].sort((left, right) => {
    if (left.isFeatured !== right.isFeatured) {
      return left.isFeatured ? -1 : 1;
    }

    const categoryComparison = left.category.localeCompare(right.category, 'es', { sensitivity: 'base' });
    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    return left.question.localeCompare(right.question, 'es', { sensitivity: 'base' });
  });
}

export function matchesQuery(item: ISmartFaqItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    item.question,
    item.answer,
    item.category,
    ...item.aliases
  ].join(' ').toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function filterFaqs(items: ISmartFaqItem[], query: string, category: string): ISmartFaqItem[] {
  return items.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category;
    return categoryMatch && matchesQuery(item, query);
  });
}

export function isFaqPartial(item: ISmartFaqItem): boolean {
  return !item.answer || !item.category;
}
