import type { AlertSeverity, IAlertItem } from '../models/alertModels';

export const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  unknown: 3
};

export function normalizeSeverity(value: unknown): AlertSeverity {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'critical' || normalized === 'warning' || normalized === 'info') {
    return normalized;
  }

  return 'unknown';
}

export function normalizePriority(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function isAlertActive(alert: IAlertItem, now: Date = new Date()): boolean {
  const startAt = parseDate(alert.startAt);
  const endAt = parseDate(alert.endAt);

  if (startAt && now < startAt) {
    return false;
  }

  if (endAt && now > endAt) {
    return false;
  }

  return true;
}

export function isAlertPartial(alert: IAlertItem): boolean {
  return (
    alert.severity === 'unknown' ||
    !alert.message ||
    !alert.startAt ||
    !alert.endAt ||
    !alert.ctaUrl
  );
}

export function sortAlerts(alerts: IAlertItem[]): IAlertItem[] {
  return [...alerts].sort((left, right) => {
    const severityDelta = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.title.localeCompare(right.title);
  });
}

export function limitAlerts(alerts: IAlertItem[], maxAlerts: number): IAlertItem[] {
  if (!Number.isFinite(maxAlerts) || maxAlerts <= 0) {
    return [];
  }

  return alerts.slice(0, Math.trunc(maxAlerts));
}

export function sameOriginUrl(rawUrl: string | undefined, baseUrl: string): string | undefined {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const resolved = new URL(trimmed, baseUrl);
    const base = new URL(baseUrl);
    if (resolved.origin !== base.origin) {
      return undefined;
    }

    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return undefined;
  }
}

export function deriveListRootPath(rawUrl: string, baseUrl: string): string {
  const resolved = new URL(rawUrl, baseUrl);
  let pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lowerPath = pathName.toLowerCase();

  if (lowerPath.endsWith('/forms/allitems.aspx')) {
    pathName = pathName.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/allitems.aspx')) {
    pathName = pathName.slice(0, -'/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/forms')) {
    pathName = pathName.slice(0, -'/Forms'.length);
  }

  return pathName || '/';
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
