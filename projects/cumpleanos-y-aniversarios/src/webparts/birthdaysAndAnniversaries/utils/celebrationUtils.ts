import { ensureUniqueStrings } from '@paquete/spfx-common';
import type { CelebrationDataSourceType, CelebrationType, ICelebrationItem } from '../models/celebrationModels';

const DATA_SOURCE_TYPES: CelebrationDataSourceType[] = ['Directory', 'SharePointList', 'JsonUrl'];

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isDangerousProtocol(value: string): boolean {
  return /^(javascript|data|vbscript):/i.test(value);
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseDataSourceTypes(value: string | string[] | undefined): CelebrationDataSourceType[] {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,;\n]/g)
      : [];

  const normalized = rawValues
    .map((entry) => entry.trim())
    .filter((entry): entry is CelebrationDataSourceType => DATA_SOURCE_TYPES.indexOf(entry as CelebrationDataSourceType) >= 0);

  return ensureUniqueStrings(normalized) as CelebrationDataSourceType[];
}

export function normalizeCelebrationType(value: unknown): CelebrationType {
  const normalized = toTrimmedString(value).toLowerCase();

  if (normalized === 'birthday' || normalized === 'cumpleanos' || normalized === 'cumpleaños') {
    return 'birthday';
  }

  if (normalized === 'anniversary' || normalized === 'aniversary' || normalized === 'aniversario') {
    return 'anniversary';
  }

  return 'unknown';
}

export function buildAvatarText(displayName: string): string {
  const parts = displayName
    .split(/\s+/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function sanitizeImageUrl(value: unknown, webAbsoluteUrl: string): string | null {
  const rawValue = toTrimmedString(value);

  if (!rawValue || isDangerousProtocol(rawValue)) {
    return null;
  }

  try {
    const resolved = new URL(rawValue, webAbsoluteUrl);
    const origin = new URL(webAbsoluteUrl).origin;

    if (resolved.origin !== origin) {
      return null;
    }

    return resolved.href;
  } catch {
    return null;
  }
}

export function normalizeDateValue(value: unknown): string | null {
  const rawValue = toTrimmedString(value);

  if (!rawValue) {
    return null;
  }

  const parsed = new Date(rawValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function getDaysRemaining(dateValue: string | null, today: Date = new Date()): number | null {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const currentDay = startOfDay(today);
  const currentYear = currentDay.getFullYear();
  const nextOccurrence = new Date(currentYear, parsed.getMonth(), parsed.getDate());

  if (nextOccurrence < currentDay) {
    nextOccurrence.setFullYear(currentYear + 1);
  }

  const diff = startOfDay(nextOccurrence).getTime() - currentDay.getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

export function isTodayCelebration(daysRemaining: number | null): boolean {
  return daysRemaining === 0;
}

export function formatCelebrationDateLabel(dateValue: string | null, today: Date = new Date()): string {
  const daysRemaining = getDaysRemaining(dateValue, today);

  if (daysRemaining === null) {
    return 'Fecha pendiente';
  }

  if (daysRemaining === 0) {
    return 'Hoy';
  }

  const parsed = new Date(dateValue as string);
  return parsed.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  });
}

export function normalizeListReference(input: string | undefined, webAbsoluteUrl: string): { mode: 'title' | 'url'; value: string } | undefined {
  const rawValue = toTrimmedString(input);

  if (!rawValue) {
    return undefined;
  }

  if (/^https?:\/\//i.test(rawValue) || rawValue.startsWith('/')) {
    try {
      const baseUrl = new URL(webAbsoluteUrl);
      const resolved = new URL(rawValue, webAbsoluteUrl);

      if (resolved.origin !== baseUrl.origin) {
        return undefined;
      }

      const withoutQuery = `${resolved.pathname}`;
      const cleaned = withoutQuery.replace(/\/Forms\/AllItems\.aspx$/i, '').replace(/\/$/, '');

      return {
        mode: 'url',
        value: cleaned || '/'
      };
    } catch {
      return undefined;
    }
  }

  return {
    mode: 'title',
    value: rawValue
  };
}

export function sortCelebrationItems(items: ICelebrationItem[]): ICelebrationItem[] {
  return [...items].sort((left, right) => {
    if (left.isToday !== right.isToday) {
      return left.isToday ? -1 : 1;
    }

    if (left.isPartial !== right.isPartial) {
      return left.isPartial ? 1 : -1;
    }

    const leftDays = left.daysRemaining ?? Number.POSITIVE_INFINITY;
    const rightDays = right.daysRemaining ?? Number.POSITIVE_INFINITY;

    if (leftDays !== rightDays) {
      return leftDays - rightDays;
    }

    return left.displayName.localeCompare(right.displayName, 'es');
  });
}

