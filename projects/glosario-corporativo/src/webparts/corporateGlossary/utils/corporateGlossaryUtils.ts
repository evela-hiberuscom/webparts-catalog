import type { ICorporateGlossaryItem } from '../models/corporateGlossaryModels';

export function clampMaxItems(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(1000, Math.trunc(value)));
}

export function normalizeText(value: string | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function normalizeKey(value: string | undefined): string {
  return normalizeText(value).toLowerCase();
}

export function splitAliases(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(String(item))).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return splitAliases(record.Label ?? record.label ?? record.Title ?? record.title ?? record.Value ?? record.value);
  }

  return [];
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

export function formatGlossaryDate(value: string | undefined, localeName: string): string | undefined {
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

export function buildAlphabetIndex(items: ICorporateGlossaryItem[]): string[] {
  const letters = new Set<string>();

  items.forEach((item) => {
    const letter = normalizeKey(item.title).charAt(0).toUpperCase();
    letters.add(letter || '#');
  });

  return Array.from(letters).sort((left, right) => left.localeCompare(right, 'es', { sensitivity: 'base' }));
}

export function isGlossaryItemPartial(item: ICorporateGlossaryItem): boolean {
  return !item.definition || !item.relatedUrl;
}

export function sortGlossaryItems(items: ICorporateGlossaryItem[]): ICorporateGlossaryItem[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const categoryOrder = (left.category ?? 'General').localeCompare(right.category ?? 'General', 'es', { sensitivity: 'base' });
    if (categoryOrder !== 0) {
      return categoryOrder;
    }

    return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
  });
}

export function filterGlossaryItems(
  items: ICorporateGlossaryItem[],
  query: string,
  category: string,
  letter: string,
  defaultCategory: string
): ICorporateGlossaryItem[] {
  const normalizedQuery = normalizeKey(query);
  const normalizedCategory = normalizeText(category);
  const normalizedLetter = normalizeKey(letter);
  const normalizedDefaultCategory = normalizeText(defaultCategory);

  return sortGlossaryItems(items)
    .filter((item) => {
      const itemCategory = normalizeText(item.category ?? normalizedDefaultCategory) || normalizedDefaultCategory || 'General';

      if (normalizedCategory && itemCategory !== normalizedCategory) {
        return false;
      }

      if (normalizedLetter && normalizedLetter !== 'all') {
        const itemLetter = normalizeKey(item.title).charAt(0).toUpperCase();
        if (itemLetter !== normalizedLetter.toUpperCase()) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [item.title, item.definition, item.category, ...item.aliases].map((value) => normalizeKey(value)).join(' ');
      return haystack.indexOf(normalizedQuery) >= 0;
    })
    .map((item) => ({
      ...item,
      featured: item.featured
    }));
}

export function scoreGlossaryItem(item: ICorporateGlossaryItem, query: string): number {
  const normalizedQuery = normalizeKey(query);
  if (!normalizedQuery) {
    return 0;
  }

  const exactTitle = normalizeKey(item.title) === normalizedQuery;
  const exactAlias = item.aliases.some((alias) => normalizeKey(alias) === normalizedQuery);

  if (exactTitle || exactAlias) {
    return 0;
  }

  const titleMatch = normalizeKey(item.title).indexOf(normalizedQuery) >= 0;
  const aliasMatch = item.aliases.some((alias) => normalizeKey(alias).indexOf(normalizedQuery) >= 0);

  return titleMatch || aliasMatch ? 1 : 2;
}
