import type {
  IPlannedMaintenanceInput,
  IPlannedMaintenanceItem,
  IPlannedMaintenanceViewModel,
  IPlannedMaintenanceWebPartProps,
  PlannedMaintenanceDataSourceType,
  PlannedMaintenanceImpact,
  PlannedMaintenanceStatus
} from '../models/plannedMaintenanceModels';

export function normalizeWebPartProps(
  raw: Partial<IPlannedMaintenanceWebPartProps> | undefined
): IPlannedMaintenanceWebPartProps {
  return {
    title: typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Mantenimientos programados',
    description:
      typeof raw?.description === 'string' && raw.description.trim()
        ? raw.description.trim()
        : 'Muestra ventanas de mantenimiento planificadas, servicios afectados e impacto previsto.',
    dataSourceType: normalizeDataSourceType(raw?.dataSourceType),
    listTitleOrUrl: typeof raw?.listTitleOrUrl === 'string' ? raw.listTitleOrUrl.trim() : 'MaintenanceList',
    jsonUrl: typeof raw?.jsonUrl === 'string' ? raw.jsonUrl.trim() : '',
    hideCompleted: typeof raw?.hideCompleted === 'boolean' ? raw.hideCompleted : true,
    maxItems: normalizeMaxItems(raw?.maxItems)
  };
}

export function normalizeDataSourceType(value: unknown): PlannedMaintenanceDataSourceType {
  return value === 'JsonUrl' ? 'JsonUrl' : 'SharePointList';
}

export function normalizeMaxItems(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return 10;
  }

  return Math.max(1, Math.min(25, Math.trunc(parsed)));
}

export function parseDateValue(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export function normalizeImpact(value: unknown): PlannedMaintenanceImpact {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized;
  }

  return 'unknown';
}

export function normalizeServices(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

export function classifyMaintenanceStatus(
  startAt: Date | undefined,
  endAt: Date | undefined,
  now: Date
): PlannedMaintenanceStatus {
  if (!startAt || !endAt) {
    return 'unknown';
  }

  if (now < startAt) {
    return 'upcoming';
  }

  if (now > endAt) {
    return 'completed';
  }

  return 'inProgress';
}

export function normalizeMaintenanceItem(
  input: IPlannedMaintenanceInput,
  fallbackId: string,
  now: Date
): IPlannedMaintenanceItem {
  const title =
    (typeof input.title === 'string' && input.title.trim() ? input.title.trim() : undefined) ??
    (typeof input.Title === 'string' && input.Title.trim() ? input.Title.trim() : undefined) ??
    `Mantenimiento ${fallbackId}`;
  const startAtRaw =
    (typeof input.startAt === 'string' && input.startAt.trim() ? input.startAt.trim() : undefined) ??
    (typeof input.StartAt === 'string' && input.StartAt.trim() ? input.StartAt.trim() : undefined) ??
    (typeof input.startDate === 'string' && input.startDate.trim() ? input.startDate.trim() : undefined) ??
    (typeof input.StartDate === 'string' && input.StartDate.trim() ? input.StartDate.trim() : undefined);
  const endAtRaw =
    (typeof input.endAt === 'string' && input.endAt.trim() ? input.endAt.trim() : undefined) ??
    (typeof input.EndAt === 'string' && input.EndAt.trim() ? input.EndAt.trim() : undefined) ??
    (typeof input.endDate === 'string' && input.endDate.trim() ? input.endDate.trim() : undefined) ??
    (typeof input.EndDate === 'string' && input.EndDate.trim() ? input.EndDate.trim() : undefined);
  const startAt = parseDateValue(startAtRaw);
  const endAt = parseDateValue(endAtRaw);
  const impact = normalizeImpact(input.impact ?? input.Impact);
  const services = normalizeServices(input.services ?? input.Services);
  const detailUrl =
    (typeof input.detailUrl === 'string' && input.detailUrl.trim() ? input.detailUrl.trim() : undefined) ??
    (typeof input.DetailUrl === 'string' && input.DetailUrl.trim() ? input.DetailUrl.trim() : undefined);
  const status = classifyMaintenanceStatus(startAt, endAt, now);
  const partialData = !startAt || !endAt || impact === 'unknown';

  return {
    id: String(input.id ?? fallbackId),
    title,
    startAt: startAtRaw,
    endAt: endAtRaw,
    impact,
    services,
    detailUrl,
    status,
    partialData
  };
}

export function sortMaintenanceItems(items: IPlannedMaintenanceItem[]): IPlannedMaintenanceItem[] {
  const priority: Record<PlannedMaintenanceStatus, number> = {
    inProgress: 0,
    upcoming: 1,
    unknown: 2,
    completed: 3
  };

  return [...items].sort((left, right) => {
    const priorityDiff = priority[left.status] - priority[right.status];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const leftStart = parseDateValue(left.startAt)?.getTime();
    const rightStart = parseDateValue(right.startAt)?.getTime();

    if (left.status === 'completed') {
      return (rightStart ?? 0) - (leftStart ?? 0);
    }

    return (leftStart ?? Number.MAX_SAFE_INTEGER) - (rightStart ?? Number.MAX_SAFE_INTEGER);
  });
}

export function filterCompleted(items: IPlannedMaintenanceItem[], hideCompleted: boolean): IPlannedMaintenanceItem[] {
  if (!hideCompleted) {
    return items;
  }

  return items.filter((item) => item.status !== 'completed');
}

export function countByStatus(items: IPlannedMaintenanceItem[]): IPlannedMaintenanceViewModel['counts'] {
  return items.reduce(
    (accumulator, item) => {
      accumulator[item.status] += 1;
      return accumulator;
    },
    {
      inProgress: 0,
      upcoming: 0,
      completed: 0,
      unknown: 0
    }
  );
}

export function normalizeMaintenancePayload(payload: unknown, now: Date): IPlannedMaintenanceItem[] {
  let inputItems: IPlannedMaintenanceInput[] = [];

  if (Array.isArray(payload)) {
    inputItems = payload as IPlannedMaintenanceInput[];
  } else if (payload && typeof payload === 'object') {
    const record = payload as { value?: unknown; items?: unknown };
    if (Array.isArray(record.value)) {
      inputItems = record.value as IPlannedMaintenanceInput[];
    } else if (Array.isArray(record.items)) {
      inputItems = record.items as IPlannedMaintenanceInput[];
    }
  }

  return inputItems.map((item, index) => normalizeMaintenanceItem(item, `maintenance-${index + 1}`, now));
}

export function normalizeListTarget(rawValue: string, webUrl: string): { kind: 'title' | 'url'; value: string } | undefined {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^(https?:\/\/|\/|~sitecollection\/|~site\/)/i.test(trimmed)) {
    const resolved = new URL(trimmed, webUrl);
    const webOrigin = new URL(webUrl).origin;
    if (resolved.origin !== webOrigin) {
      return undefined;
    }

    let serverRelative = resolved.pathname;
    serverRelative = serverRelative.replace(/\/Forms\/AllItems\.aspx$/i, '');
    serverRelative = serverRelative.replace(/\/Forms\/.*$/i, '');
    serverRelative = serverRelative.replace(/\/$/, '');

    return {
      kind: 'url',
      value: serverRelative || '/'
    };
  }

  return {
    kind: 'title',
    value: trimmed
  };
}

export function normalizeJsonUrl(rawValue: string, webUrl: string): string | undefined {
  const trimmed = rawValue.trim();
  if (!trimmed || /^(javascript|data|vbscript):/i.test(trimmed)) {
    return undefined;
  }

  const resolved = new URL(trimmed, webUrl);
  const webOrigin = new URL(webUrl).origin;
  if (resolved.origin !== webOrigin) {
    return undefined;
  }

  return resolved.toString();
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
