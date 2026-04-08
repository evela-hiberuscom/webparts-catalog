import type { IWhatChangedFeedItem } from '../models/whatChangedFeedModels';

export function clampMaxItems(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(20, Math.trunc(value)));
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

export function normalizeValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function sanitizeText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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

export function isPartialChange(item: IWhatChangedFeedItem): boolean {
  return !item.changedAt || !item.openUrl || !item.summary || !item.type;
}

export function sortChanges(items: IWhatChangedFeedItem[]): IWhatChangedFeedItem[] {
  return [...items].sort((left, right) => {
    const leftTime = left.changedAt ? new Date(left.changedAt).getTime() : Number.NEGATIVE_INFINITY;
    const rightTime = right.changedAt ? new Date(right.changedAt).getTime() : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });
}

export function filterChangesByType(items: IWhatChangedFeedItem[], typeFilter: string): IWhatChangedFeedItem[] {
  const normalizedFilter = normalizeValue(typeFilter);
  if (!normalizedFilter) {
    return items;
  }

  return items.filter((item) => normalizeValue(item.type) === normalizedFilter);
}
