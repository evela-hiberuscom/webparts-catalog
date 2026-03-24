import { createSafeExternalLink, ensureUniqueStrings } from '@paquete/spfx-common';
import type {
  IProjectRecord,
  IProjectStatusItem,
  IProjectStatusRequest,
  IProjectStatusResult,
  ProjectStatusFilter,
  ProjectStatusValue
} from '../models/projectStatusTypes';

const STATUS_ORDER: Record<ProjectStatusValue, number> = {
  red: 0,
  amber: 1,
  green: 2,
  unknown: 3
};

const STATUS_LABELS: Record<ProjectStatusValue, string> = {
  red: 'Rojo',
  amber: 'Ámbar',
  green: 'Verde',
  unknown: 'Desconocido'
};

const STATUS_TONES: Record<ProjectStatusValue, 'success' | 'warning' | 'error' | 'neutral'> = {
  red: 'error',
  amber: 'warning',
  green: 'success',
  unknown: 'neutral'
};

function normalizeText(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function normalizeProjectStatus(value: string | undefined): ProjectStatusValue {
  const text = normalizeText(value);

  if (!text) {
    return 'unknown';
  }

  if (text.indexOf('red') !== -1 || text.indexOf('critical') !== -1 || text.indexOf('blocked') !== -1 || text.indexOf('risk') !== -1 || text.indexOf('at risk') !== -1 || text.indexOf('overdue') !== -1) {
    return 'red';
  }

  if (text.indexOf('amber') !== -1 || text.indexOf('warning') !== -1 || text.indexOf('watch') !== -1 || text.indexOf('pending') !== -1 || text.indexOf('slip') !== -1) {
    return 'amber';
  }

  if (text.indexOf('green') !== -1 || text.indexOf('ok') !== -1 || text.indexOf('healthy') !== -1 || text.indexOf('on track') !== -1 || text.indexOf('done') !== -1 || text.indexOf('complete') !== -1) {
    return 'green';
  }

  return 'unknown';
}

export function formatProjectDate(value: string | undefined): string {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short'
  }).format(date);
}

function parseDateSortValue(value: string | undefined): number {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }

  return date.getTime();
}

export function normalizeProjectRecord(record: Partial<IProjectRecord> & { [key: string]: unknown }): IProjectRecord {
  const title = String(record.title ?? record.Title ?? record.name ?? record.Name ?? record.projectName ?? '').trim();
  const id = String(record.id ?? record.ID ?? record.Id ?? title ?? 'project').trim() || 'project';
  const status = String(record.status ?? record.Status ?? record.health ?? record.Health ?? record.semaforo ?? '');
  const owner = String(record.owner ?? record.Owner ?? record.responsible ?? record.Responsible ?? record.area ?? record.Area ?? '');
  const relevantDate = String(record.relevantDate ?? record.RelevantDate ?? record.nextReviewDate ?? record.NextReviewDate ?? record.date ?? record.Date ?? '');
  const openUrl = String(record.openUrl ?? record.OpenUrl ?? record.detailUrl ?? record.DetailUrl ?? record.url ?? record.Url ?? '');
  const category = String(record.category ?? record.Category ?? record.stream ?? record.Stream ?? '');

  return {
    id,
    title: title || id,
    status: status || undefined,
    owner: owner || undefined,
    relevantDate: relevantDate || undefined,
    openUrl: openUrl || undefined,
    category: category || undefined,
    partial: Boolean(record.partial)
  };
}

export function buildProjectStatusItem(record: IProjectRecord): IProjectStatusItem {
  const status = normalizeProjectStatus(record.status);
  const safeLink = record.openUrl ? createSafeExternalLink(record.openUrl) : undefined;
  const hasPartialData = !record.status || !record.owner || !record.relevantDate || Boolean(record.partial) || !safeLink && Boolean(record.openUrl);

  return {
    ...record,
    status,
    statusLabel: STATUS_LABELS[status],
    statusTone: STATUS_TONES[status],
    relevantDateLabel: formatProjectDate(record.relevantDate),
    hasPartialData,
    safeLink
  };
}

export function sortProjectItems(items: IProjectStatusItem[]): IProjectStatusItem[] {
  return [...items].sort((left, right) => {
    const statusDelta = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }

    const dateDelta = parseDateSortValue(left.relevantDate) - parseDateSortValue(right.relevantDate);
    if (dateDelta !== 0) {
      return dateDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

export function filterProjectItems(items: IProjectStatusItem[], filter: ProjectStatusFilter): IProjectStatusItem[] {
  if (filter === 'all') {
    return items;
  }

  return items.filter((item) => item.status === filter);
}

export function buildAvailableFilters(items: IProjectStatusItem[], defaultFilter: ProjectStatusFilter): ProjectStatusFilter[] {
  const values = ensureUniqueStrings(items.map((item) => item.status));
  const ordered = values.sort((left, right) => STATUS_ORDER[left as ProjectStatusValue] - STATUS_ORDER[right as ProjectStatusValue]) as ProjectStatusValue[];
  return ['all', ...ordered, defaultFilter].filter((value, index, source) => source.indexOf(value) === index) as ProjectStatusFilter[];
}

export function buildProjectStatusResult(request: IProjectStatusRequest, sourceLabel: string, records: IProjectRecord[]): IProjectStatusResult {
  const normalized = records.map(buildProjectStatusItem);
  const items = sortProjectItems(normalized);
  const hasPartialData = normalized.some((item) => item.hasPartialData);
  const availableFilters = buildAvailableFilters(normalized, request.defaultStatusFilter ?? 'all');

  return {
    sourceLabel,
    totalCount: normalized.length,
    hasPartialData,
    availableFilters,
    items
  };
}
