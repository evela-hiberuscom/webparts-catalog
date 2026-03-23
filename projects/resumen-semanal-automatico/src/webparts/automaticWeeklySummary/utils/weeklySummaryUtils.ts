import type { IWeeklyHighlight, IWeeklySummaryRange, SummaryPeriodMode, WeeklyHighlightType } from '../models/weeklySummaryTypes';

const SPANISH_MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic'
];

function padTwoDigits(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function startOfWeek(referenceDate: Date): Date {
  const start = new Date(referenceDate);
  const day = start.getDay();
  const offset = (day + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - offset);
  return start;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateKey(value: string | Date | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());
  return `${year}-${month}-${day}`;
}

export function parseCustomDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = SPANISH_MONTHS[date.getMonth()] ?? '';
  return `${day} ${month}`;
}

export function buildRangeLabel(start: Date, end: Date, prefix: string): string {
  return `${prefix}: ${formatShortDate(start)} - ${formatShortDate(end)}`;
}

export function getWeeklySummaryRange(
  periodMode: SummaryPeriodMode,
  referenceDate: Date,
  customRangeStart?: string,
  customRangeEnd?: string
): IWeeklySummaryRange {
  if (periodMode === 'previousWeek') {
    const end = startOfWeek(referenceDate);
    const start = addDays(end, -7);
    return {
      start,
      end,
      isCustom: false,
      label: buildRangeLabel(start, end, 'Semana anterior')
    };
  }

  if (periodMode === 'customRange') {
    const start = parseCustomDate(customRangeStart) ?? startOfWeek(referenceDate);
    const end = parseCustomDate(customRangeEnd) ?? addDays(start, 7);
    return {
      start,
      end,
      isCustom: true,
      label: buildRangeLabel(start, end, 'Periodo personalizado')
    };
  }

  const start = startOfWeek(referenceDate);
  const end = addDays(start, 7);
  return {
    start,
    end,
    isCustom: false,
    label: buildRangeLabel(start, end, 'Semana actual')
  };
}

export function isDateInRange(value: string | undefined, range: IWeeklySummaryRange): boolean {
  const valueKey = toDateKey(value);
  const startKey = toDateKey(range.start);
  const endKey = toDateKey(range.end);

  if (!valueKey || !startKey || !endKey) {
    return false;
  }

  return valueKey >= startKey && valueKey < endKey;
}

export function normalizeHighlightType(
  value: WeeklyHighlightType | string | undefined,
  sourceName: string
): WeeklyHighlightType {
  const text = `${value ?? ''} ${sourceName}`.toLowerCase();
  if (text.indexOf('news') !== -1) {
    return 'news';
  }
  if (text.indexOf('milestone') !== -1 || text.indexOf('hito') !== -1) {
    return 'milestone';
  }
  if (text.indexOf('incident') !== -1 || text.indexOf('incid') !== -1) {
    return 'incident';
  }
  if (text.indexOf('task') !== -1 || text.indexOf('tarea') !== -1) {
    return 'task';
  }
  return 'generic';
}

export function sortHighlights(items: IWeeklyHighlight[]): IWeeklyHighlight[] {
  return [...items].sort((left, right) => {
    const leftPriority = left.priority ?? Number.MIN_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MIN_SAFE_INTEGER;
    if (leftPriority !== rightPriority) {
      return rightPriority - leftPriority;
    }

    const leftDate = left.date ? new Date(left.date).getTime() : Number.MIN_SAFE_INTEGER;
    const rightDate = right.date ? new Date(right.date).getTime() : Number.MIN_SAFE_INTEGER;
    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return left.title.localeCompare(right.title);
  });
}

export function truncateHighlights(items: IWeeklyHighlight[], maxItems: number): IWeeklyHighlight[] {
  return items.slice(0, Math.max(0, maxItems));
}

export function collectSourceNames(items: IWeeklyHighlight[]): string[] {
  return Array.from(new Set(items.map((item) => item.sourceName).filter(Boolean)));
}
