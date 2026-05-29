import type { IUpcomingMilestoneItem } from '../models/upcomingMilestonesModels';

interface ISharePointHyperlinkValue {
  Url?: string;
}

type SharePointFieldValue = string | ISharePointHyperlinkValue | undefined;

const DATE_FIELDS = ['MilestoneDate', 'TargetDate', 'EventDate', 'Date', 'DueDate', 'PlannedDate'];
const TYPE_FIELDS = ['MilestoneType', 'Type', 'Category', 'Phase'];
const URL_FIELDS = ['DetailUrl', 'LinkUrl', 'URL', 'FileRef'];

function normalizeComparable(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function isHyperlinkValue(value: unknown): value is ISharePointHyperlinkValue {
  return typeof value === 'object' && !!value;
}

export function formatMilestoneDate(value: string | undefined, localeName: string): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(localeName || 'es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsed);
}

export function isMilestonePartial(item: IUpcomingMilestoneItem): boolean {
  return !item.date || !item.type || !item.detailUrl;
}

export function isMilestoneSoon(
  item: IUpcomingMilestoneItem,
  referenceDate: Date = new Date(),
  thresholdDays: number = 7
): boolean {
  if (!item.date) {
    return false;
  }

  const milestoneDate = new Date(item.date);
  if (Number.isNaN(milestoneDate.getTime())) {
    return false;
  }

  const millisInDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.ceil((milestoneDate.getTime() - referenceDate.getTime()) / millisInDay);
  return diffDays >= 0 && diffDays <= thresholdDays;
}

export function sortMilestonesByDate(items: IUpcomingMilestoneItem[]): IUpcomingMilestoneItem[] {
  return [...items].sort((left, right) => {
    const leftTime = left.date ? new Date(left.date).getTime() : Number.POSITIVE_INFINITY;
    const rightTime = right.date ? new Date(right.date).getTime() : Number.POSITIVE_INFINITY;

    if (leftTime === rightTime) {
      return normalizeComparable(left.title).localeCompare(normalizeComparable(right.title));
    }

    return leftTime - rightTime;
  });
}

export function resolveAbsoluteUrl(baseUrl: string, candidate: string | undefined): string | undefined {
  if (!candidate) {
    return undefined;
  }

  try {
    return new URL(candidate, `${baseUrl}/`).toString();
  } catch {
    return undefined;
  }
}

export function extractFieldValue(record: Record<string, unknown>, fieldNames: string[]): string | undefined {
  for (const fieldName of fieldNames) {
    const value = record[fieldName] as SharePointFieldValue;
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (isHyperlinkValue(value) && typeof value.Url === 'string' && value.Url.trim()) {
      return value.Url.trim();
    }
  }

  return undefined;
}

export function mapSharePointMilestone(
  item: Record<string, unknown>,
  webAbsoluteUrl: string
): IUpcomingMilestoneItem {
  return {
    id: String(item.Id ?? item.ID ?? item.Title ?? 'unknown-milestone'),
    title: typeof item.Title === 'string' && item.Title.trim() ? item.Title.trim() : 'Hito sin titulo',
    date: extractFieldValue(item, DATE_FIELDS),
    type: extractFieldValue(item, TYPE_FIELDS),
    detailUrl: resolveAbsoluteUrl(webAbsoluteUrl, extractFieldValue(item, URL_FIELDS))
  };
}
