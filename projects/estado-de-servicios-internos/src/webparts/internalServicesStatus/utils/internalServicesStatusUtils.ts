import type {
  IInternalServiceStatus,
  IInternalServiceStatusSourceRecord,
  InternalServiceCriticalityValue,
  InternalServiceStatusValue
} from "../models/internalServicesStatusModels";

const STATUS_ORDER: Record<InternalServiceStatusValue, number> = {
  critical: 0,
  warning: 1,
  maintenance: 2,
  ok: 3,
  unknown: 4
};

const CRITICALITY_ORDER: Record<InternalServiceCriticalityValue, number> = {
  high: 0,
  medium: 1,
  low: 2,
  unknown: 3
};

function toLower(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeStatus(value?: string): InternalServiceStatusValue {
  const normalized = toLower(value);

  if (["ok", "healthy", "up", "available"].indexOf(normalized) !== -1) {
    return "ok";
  }

  if (["warning", "degraded", "partial"].indexOf(normalized) !== -1) {
    return "warning";
  }

  if (["critical", "down", "outage", "error"].indexOf(normalized) !== -1) {
    return "critical";
  }

  if (["maintenance", "maintenance-mode", "planned-maintenance"].indexOf(normalized) !== -1) {
    return "maintenance";
  }

  return "unknown";
}

export function normalizeCriticality(value?: string): InternalServiceCriticalityValue {
  const normalized = toLower(value);

  if (["high", "critical", "p1"].indexOf(normalized) !== -1) {
    return "high";
  }

  if (["medium", "moderate", "p2"].indexOf(normalized) !== -1) {
    return "medium";
  }

  if (["low", "minor", "p3"].indexOf(normalized) !== -1) {
    return "low";
  }

  return "unknown";
}

export function parseIsoDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDateTime(value?: string): string {
  const date = parseIsoDate(value);
  if (!date) {
    return "Sin actualización";
  }

  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function isStale(updatedAt: string | undefined, thresholdMinutes: number, now: Date = new Date()): boolean {
  const parsed = parseIsoDate(updatedAt);
  if (!parsed || thresholdMinutes <= 0) {
    return false;
  }

  return now.getTime() - parsed.getTime() > thresholdMinutes * 60 * 1000;
}

export function mapServiceRecord(
  record: IInternalServiceStatusSourceRecord,
  thresholdMinutes: number,
  now: Date = new Date()
): IInternalServiceStatus {
  const status = normalizeStatus(record.status);
  const criticality = normalizeCriticality(record.criticality ?? (status === "critical" ? "high" : undefined));
  const updatedAt = parseIsoDate(record.updatedAt ?? undefined);
  const isMissingMandatoryFields = !record.name || !record.summary;
  const detailUrl = (record.detailUrl ?? undefined) || undefined;
  const normalizedUpdatedAt = updatedAt ? updatedAt.toISOString() : undefined;

  return {
    id: String(record.id ?? record.name ?? "service"),
    name: record.name ?? record.title ?? "Servicio sin nombre",
    status,
    criticality,
    summary: record.summary ?? "Sin descripción disponible.",
    updatedAt: normalizedUpdatedAt,
    detailUrl,
    domain: record.domain,
    isPartial: isMissingMandatoryFields,
    isStale: isStale(normalizedUpdatedAt, thresholdMinutes, now)
  };
}

export function sortServices(items: IInternalServiceStatus[]): IInternalServiceStatus[] {
  return [...items].sort((left, right) => {
    const statusDelta = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }

    const criticalityDelta = CRITICALITY_ORDER[left.criticality] - CRITICALITY_ORDER[right.criticality];
    if (criticalityDelta !== 0) {
      return criticalityDelta;
    }

    const leftUpdatedAt = parseIsoDate(left.updatedAt)?.getTime() ?? Number.MIN_SAFE_INTEGER;
    const rightUpdatedAt = parseIsoDate(right.updatedAt)?.getTime() ?? Number.MIN_SAFE_INTEGER;
    if (leftUpdatedAt !== rightUpdatedAt) {
      return rightUpdatedAt - leftUpdatedAt;
    }

    return left.name.localeCompare(right.name);
  });
}

export function filterServices(
  items: IInternalServiceStatus[],
  filter: "all" | InternalServiceStatusValue
): IInternalServiceStatus[] {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.status === filter);
}

export function countStaleServices(items: IInternalServiceStatus[]): number {
  return items.filter((item) => item.isStale).length;
}

export function getLastUpdatedValue(items: IInternalServiceStatus[]): string | undefined {
  const timestamps = items
    .map((item) => parseIsoDate(item.updatedAt)?.getTime())
    .filter((value): value is number => typeof value === "number");

  if (!timestamps.length) {
    return undefined;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}
