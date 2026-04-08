import type { ITemplateItem } from '../models/templatesLibraryModels';

export function clampMaxItems(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(100, Math.trunc(value)));
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

export function deriveDownloadUrl(openUrl: string | undefined): string | undefined {
  if (!openUrl) {
    return undefined;
  }

  return openUrl.includes('?') ? `${openUrl}&download=1` : `${openUrl}?download=1`;
}

export function normalizeTemplateType(value: string | undefined, fallback = 'General'): string {
  return value?.trim() || fallback;
}

export function normalizeCategory(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback || 'General';
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

export function isTemplatePartial(item: ITemplateItem): boolean {
  return !item.templateType || !item.category || (!item.openUrl && !item.downloadUrl);
}

export function sortTemplates(items: ITemplateItem[]): ITemplateItem[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const categoryComparison = left.category.localeCompare(right.category, 'es', { sensitivity: 'base' });
    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
  });
}

export function filterTemplates(items: ITemplateItem[], query: string, category: string, templateType: string): ITemplateItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category;
    const typeMatch = templateType === 'all' || item.templateType === templateType;
    const queryMatch = !normalizedQuery || `${item.title} ${item.category} ${item.templateType}`.toLowerCase().includes(normalizedQuery);

    return categoryMatch && typeMatch && queryMatch;
  });
}
