import { createSafeExternalLink, ensureUniqueStrings } from '@paquete/spfx-common';
import type {
  IHighlightedIncident,
  IIncidentSourceRecord,
  IncidentSeverity,
  IncidentStatus
} from '../models/highlightedIncidentModels';

const severityWeights: Record<IncidentSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unknown: 0
};

const statusWeights: Record<IncidentStatus, number> = {
  active: 3,
  monitoring: 2,
  resolved: 1,
  unknown: 0
};

const severityLabels: Record<IncidentSeverity, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  unknown: 'Desconocida'
};

const statusLabels: Record<IncidentStatus, string> = {
  active: 'Activa',
  monitoring: 'Monitorización',
  resolved: 'Resuelta',
  unknown: 'Desconocido'
};

function readText(record: IIncidentSourceRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function readIdentifier(record: IIncidentSourceRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function parseDateInput(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeKeyword(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function normalizeSeverity(value?: string): IncidentSeverity {
  const normalized = normalizeKeyword(value);

  if (
    normalized.indexOf('critical') !== -1 ||
    normalized.indexOf('sev1') !== -1 ||
    normalized.indexOf('sev 1') !== -1 ||
    normalized.indexOf('p1') !== -1 ||
    normalized.indexOf('prio1') !== -1
  ) {
    return 'critical';
  }

  if (
    normalized.indexOf('high') !== -1 ||
    normalized.indexOf('major') !== -1 ||
    normalized.indexOf('sev2') !== -1 ||
    normalized.indexOf('p2') !== -1
  ) {
    return 'high';
  }

  if (
    normalized.indexOf('medium') !== -1 ||
    normalized.indexOf('moderate') !== -1 ||
    normalized.indexOf('sev3') !== -1 ||
    normalized.indexOf('p3') !== -1
  ) {
    return 'medium';
  }

  if (
    normalized.indexOf('low') !== -1 ||
    normalized.indexOf('minor') !== -1 ||
    normalized.indexOf('sev4') !== -1 ||
    normalized.indexOf('p4') !== -1
  ) {
    return 'low';
  }

  return 'unknown';
}

export function normalizeIncidentStatus(value?: string): IncidentStatus {
  const normalized = normalizeKeyword(value);

  if (normalized.indexOf('monitor') !== -1) {
    return 'monitoring';
  }

  if (normalized.indexOf('active') !== -1 || normalized.indexOf('open') !== -1) {
    return 'active';
  }

  if (normalized.indexOf('resolve') !== -1 || normalized.indexOf('closed') !== -1) {
    return 'resolved';
  }

  return 'unknown';
}

export function formatIncidentEta(value?: string): string | undefined {
  const date = parseDateInput(value);
  if (!date) {
    return undefined;
  }

  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getSeverityLabel(severity: IncidentSeverity): string {
  return severityLabels[severity];
}

export function getStatusLabel(status: IncidentStatus): string {
  return statusLabels[status];
}

export function mapIncidentRecord(
  record: IIncidentSourceRecord,
  sourceName: string,
  index: number
): IHighlightedIncident {
  const title = readText(record, ['Title', 'title', 'name']) ?? `Incidencia ${index + 1}`;
  const severity = normalizeSeverity(readText(record, ['Severity', 'severity', 'priorityLevel', 'level']));
  const status = normalizeIncidentStatus(readText(record, ['Status', 'status', 'state']));
  const impact = readText(record, ['Impact', 'impact', 'summary']);
  const workaround = readText(record, ['Workaround', 'workaround', 'workAround']);
  const eta = readText(record, ['ETA', 'eta', 'expectedResolution', 'resolutionEta']);
  const detailUrl = readText(record, ['DetailUrl', 'detailUrl', 'url', 'link', 'openUrl']);
  const isPartial =
    !impact ||
    !workaround ||
    !eta ||
    !detailUrl ||
    severity === 'unknown' ||
    status === 'unknown';

  return {
    id: readIdentifier(record, ['Id', 'ID', 'id']) ?? `${sourceName}-${index + 1}`,
    title,
    severity,
    impact,
    status,
    workaround,
    eta,
    detailUrl,
    sourceName,
    isPartial
  };
}

export function sortIncidents(items: IHighlightedIncident[]): IHighlightedIncident[] {
  return [...items].sort((left, right) => {
    const severityDiff = severityWeights[right.severity] - severityWeights[left.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }

    const statusDiff = statusWeights[right.status] - statusWeights[left.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    const leftEta = left.eta ? new Date(left.eta).getTime() : Number.MAX_SAFE_INTEGER;
    const rightEta = right.eta ? new Date(right.eta).getTime() : Number.MAX_SAFE_INTEGER;
    if (leftEta !== rightEta) {
      return leftEta - rightEta;
    }

    return left.title.localeCompare(right.title, 'es-ES');
  });
}

export function truncateIncidents(items: IHighlightedIncident[], maxItems: number): IHighlightedIncident[] {
  return items.slice(0, Math.max(0, maxItems));
}

export function countDistinctSources(items: IHighlightedIncident[]): number {
  return ensureUniqueStrings(items.map((item) => item.sourceName)).length;
}

export function classifyIncidentCardTone(severity: IncidentSeverity): string {
  return `severity-${severity}`;
}

export interface IResolvedIncidentLink {
  href: string;
  target?: string;
  rel?: string;
}

export function resolveIncidentDetailLink(
  url: string | undefined,
  webUrl: string
): IResolvedIncidentLink | undefined {
  const value = (url ?? '').trim();

  if (!value || /^(javascript|data|vbscript):/i.test(value)) {
    return undefined;
  }

  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('?') || /^(mailto:|tel:)/i.test(value)) {
    return { href: value };
  }

  try {
    const resolved = new URL(value, webUrl);
    const origin = new URL(webUrl).origin;

    if (resolved.origin === origin) {
      return {
        href: `${resolved.pathname}${resolved.search}${resolved.hash}`
      };
    }

    return createSafeExternalLink(resolved.toString()) as IResolvedIncidentLink | undefined;
  } catch {
    return undefined;
  }
}
