import type { IAudienceLinkInput, IAudienceLinkRecord, IUserContextTokenBucket } from '../models/audienceLinkModels';

export const ALL_CATEGORIES_LABEL = 'Todas';
export const UNKNOWN_CATEGORY_LABEL = 'Sin categoría';

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function splitTextTokens(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,;|]/)
    .map((token) => normalizeText(token))
    .filter(Boolean);
}

export function splitAudienceTokens(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return uniqueNormalizedTokens(value);
  }

  return splitTextTokens(value);
}

export function uniqueNormalizedTokens(values: string[]): string[] {
  const normalized: string[] = [];

  values.forEach((value) => {
    const candidate = normalizeText(value);
    if (candidate && normalized.indexOf(candidate) === -1) {
      normalized.push(candidate);
    }
  });

  return normalized;
}

export function normalizeCategory(value: string | undefined, fallback: string = UNKNOWN_CATEGORY_LABEL): string {
  const normalized = (value ?? '').trim();
  return normalized || fallback;
}

function parseBoolean(value: boolean | string | undefined, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }

  return fallback;
}

function parsePriority(value: number | string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function coerceAudienceLink(input: IAudienceLinkInput, index: number, defaultCategory: string): IAudienceLinkRecord {
  const title = (input.title ?? '').trim();
  const audiences = splitAudienceTokens(input.audiences);
  const isGeneric = parseBoolean(input.isGeneric, audiences.length === 0);
  const category = normalizeCategory(input.category, defaultCategory);
  const description = (input.description ?? '').trim();
  const iconName = (input.iconName ?? '').trim() || 'Page';
  const openUrl = (input.openUrl ?? '').trim();

  return {
    id: (input.id ?? `audience-link-${index + 1}`).trim() || `audience-link-${index + 1}`,
    title: title || `Acceso ${index + 1}`,
    category,
    iconName,
    description: description || 'Sin descripción disponible.',
    openUrl: openUrl || undefined,
    audiences,
    isGeneric,
    priority: parsePriority(input.priority),
    sourceBadge: isGeneric ? 'genérico' : 'personalizado'
  };
}

export function sortAudienceLinks(items: IAudienceLinkRecord[]): IAudienceLinkRecord[] {
  return [...items].sort((left, right) => {
    const leftPriority = left.priority ?? Number.POSITIVE_INFINITY;
    const rightPriority = right.priority ?? Number.POSITIVE_INFINITY;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const categoryOrder = left.category.localeCompare(right.category, 'es', { sensitivity: 'base' });
    if (categoryOrder !== 0) {
      return categoryOrder;
    }

    return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
  });
}

export function getAudienceCategories(
  items: IAudienceLinkRecord[],
  allCategoriesLabel: string = ALL_CATEGORIES_LABEL
): string[] {
  const categories: string[] = [allCategoriesLabel];

  items.forEach((item) => {
    const category = normalizeCategory(item.category);
    if (categories.indexOf(category) === -1) {
      categories.push(category);
    }
  });

  return categories;
}

export function filterByCategory(
  items: IAudienceLinkRecord[],
  category: string,
  allCategoriesLabel: string = ALL_CATEGORIES_LABEL
): IAudienceLinkRecord[] {
  if (!category || category === allCategoriesLabel) {
    return items;
  }

  return items.filter((item) => item.category === category);
}

export function hasVisibleLink(item: IAudienceLinkRecord): boolean {
  return typeof item.openUrl === 'string' && item.openUrl.trim().length > 0;
}

export function classifyLinkBadge(item: IAudienceLinkRecord): IAudienceLinkRecord['sourceBadge'] {
  if (!hasVisibleLink(item) || !item.description) {
    return 'partial';
  }

  return item.isGeneric || item.audiences.length === 0 ? 'genérico' : 'personalizado';
}

export function buildAudienceTokensByMode(bucket: IUserContextTokenBucket, mode: string): string[] {
  const normalizedMode = normalizeText(mode);

  if (normalizedMode === 'department') {
    return bucket.departmentTokens;
  }

  if (normalizedMode === 'country') {
    return bucket.countryTokens;
  }

  if (normalizedMode === 'group') {
    return bucket.groupTokens;
  }

  if (normalizedMode === 'role') {
    return bucket.roleTokens;
  }

  return bucket.allTokens;
}

export function matchAudienceLinkTokens(item: IAudienceLinkRecord, resolvedTokens: string[]): boolean {
  if (item.isGeneric || item.audiences.length === 0) {
    return true;
  }

  for (let index = 0; index < resolvedTokens.length; index += 1) {
    if (item.audiences.indexOf(resolvedTokens[index]) >= 0) {
      return true;
    }
  }

  return false;
}

export interface IAudienceSummaryLabels {
  general: string;
  hybridPrefix: string;
  namedPrefix: string;
}

const DEFAULT_AUDIENCE_SUMMARY_LABELS: IAudienceSummaryLabels = {
  general: 'Audiencia general',
  hybridPrefix: 'Audiencia híbrida',
  namedPrefix: 'Audiencia'
};

export function buildAudienceSummaryLabel(
  tokens: string[],
  mode: string,
  labels: IAudienceSummaryLabels = DEFAULT_AUDIENCE_SUMMARY_LABELS
): string {
  if (tokens.length === 0) {
    return labels.general;
  }

  const preview = tokens.slice(0, 3).join(' · ');
  const normalizedMode = normalizeText(mode);

  if (normalizedMode === 'hybrid') {
    return `${labels.hybridPrefix}: ${preview}`;
  }

  return `${labels.namedPrefix} ${normalizedMode || 'general'}: ${preview}`;
}

export function markPartialLink(item: IAudienceLinkRecord): IAudienceLinkRecord {
  return {
    ...item,
    sourceBadge: classifyLinkBadge(item)
  };
}
