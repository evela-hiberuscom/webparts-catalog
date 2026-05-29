import type { AgendaGroup, IAgendaItem, IAgendaRawItem } from '../models/teamAgendaModels';

export function sanitizeUrl(value: string | undefined, webUrl: string): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    return new URL(value, webUrl).toString();
  } catch {
    return undefined;
  }
}

export function getAgendaGroup(startsAt: string | undefined, now: Date): AgendaGroup {
  if (!startsAt) {
    return 'unknown';
  }

  const candidate = new Date(startsAt);
  if (Number.isNaN(candidate.getTime())) {
    return 'unknown';
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);
  const dayAfterTomorrowStart = new Date(todayStart);
  dayAfterTomorrowStart.setDate(todayStart.getDate() + 2);

  if (candidate < todayStart) {
    return 'past';
  }

  if (candidate < tomorrowStart) {
    return 'today';
  }

  if (candidate < dayAfterTomorrowStart) {
    return 'tomorrow';
  }

  return 'upcoming';
}

function normalizeDate(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function normalizeAgendaItem(
  item: IAgendaRawItem,
  index: number,
  webUrl: string,
  now: Date
): IAgendaItem {
  const startsAt = normalizeDate(item.startsAt);
  const endsAt = normalizeDate(item.endsAt);
  const location = item.location?.trim() || undefined;
  const joinUrl = sanitizeUrl(item.joinUrl, webUrl);
  const openUrl = sanitizeUrl(item.openUrl, webUrl);

  return {
    id: item.id || `agenda-item-${index + 1}`,
    title: item.title?.trim() || `Evento ${index + 1}`,
    startsAt,
    endsAt,
    eventType: item.eventType?.trim() || undefined,
    location,
    joinUrl,
    openUrl,
    group: getAgendaGroup(startsAt, now),
    isPartial: !startsAt || (!location && !joinUrl && !openUrl)
  };
}

export function sortAgendaItems(items: IAgendaItem[]): IAgendaItem[] {
  return [...items].sort((left, right) => {
    const leftTime = left.startsAt ? new Date(left.startsAt).getTime() : Number.POSITIVE_INFINITY;
    const rightTime = right.startsAt ? new Date(right.startsAt).getTime() : Number.POSITIVE_INFINITY;

    if (leftTime === rightTime) {
      return (left.title || '').localeCompare(right.title || '');
    }

    return leftTime - rightTime;
  });
}

export function filterPastAgendaItems(items: IAgendaItem[], showPast: boolean): IAgendaItem[] {
  if (showPast) {
    return items;
  }

  return items.filter((item) => item.group !== 'past');
}

export function applyAgendaTypeFilter(items: IAgendaItem[], selectedType: string): IAgendaItem[] {
  if (!selectedType.trim()) {
    return items;
  }

  return items.filter((item) => item.eventType === selectedType);
}

export function limitAgendaItems(items: IAgendaItem[], maxItems: number): IAgendaItem[] {
  const safeLimit = Math.max(1, Math.min(20, Math.trunc(maxItems || 1)));
  return items.slice(0, safeLimit);
}
