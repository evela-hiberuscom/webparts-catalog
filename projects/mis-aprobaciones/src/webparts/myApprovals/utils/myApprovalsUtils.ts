import * as sharedUtils from '@paquete/spfx-common/utils';
import { ApprovalGroup, ApprovalSortKey, IApprovalCounts, IApprovalItem, IApprovalRecord } from '../models/myApprovalsModels';

export interface INormalizedListTarget {
  listTitle: string;
  url: string;
}

const { createSafeExternalLink } = sharedUtils;

export function normalizeText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

export function normalizeDate(value: unknown): string | undefined {
  const text = normalizeText(value);
  if (!text) {
    return undefined;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function normalizeStatus(value: unknown): IApprovalRecord['status'] {
  const status = normalizeText(value).toLowerCase();
  if (!status) {
    return 'unknown';
  }

  if (['pending', 'awaiting', 'in progress', 'open'].indexOf(status) >= 0) {
    return 'pending';
  }

  if (['completed', 'done', 'approved', 'rejected', 'closed'].indexOf(status) >= 0) {
    return 'completed';
  }

  return 'unknown';
}

export function buildApprovalId(source: string, title: string, index: number): string {
  return `${normalizeText(source).toLowerCase() || 'approval'}-${normalizeText(title).toLowerCase().replace(/\s+/g, '-') || 'item'}-${index + 1}`;
}

export function normalizeApprovalRecord(raw: Record<string, unknown>, index: number): IApprovalRecord {
  const source = normalizeText(raw.Source ?? raw.source ?? raw.listTitle ?? raw.list ?? raw.connector ?? 'Approvals') || 'Approvals';
  const title = normalizeText(raw.Title ?? raw.title ?? raw.name ?? raw.subject ?? raw.approvalTitle);
  return {
    id: normalizeText(raw.Id ?? raw.id) || buildApprovalId(source, title || 'Approval', index),
    title: title || `Approval ${index + 1}`,
    requester: normalizeText(raw.Requester ?? raw.requester ?? raw.author ?? raw.assignedTo) || undefined,
    source,
    status: normalizeStatus(raw.Status ?? raw.status ?? raw.state ?? raw.approvalStatus),
    dueDate: normalizeDate(raw.DueDate ?? raw.dueDate ?? raw.deadline),
    createdDate: normalizeDate(raw.Created ?? raw.created ?? raw.createdDate),
    openUrl: normalizeText(raw.OpenUrl ?? raw.openUrl ?? raw.url ?? raw.detailUrl) || undefined,
    category: normalizeText(raw.Category ?? raw.category) || undefined,
    details: normalizeText(raw.Details ?? raw.details ?? raw.description) || undefined
  };
}

export function classifyApprovalGroup(item: Pick<IApprovalRecord, 'status' | 'dueDate' | 'createdDate'>, now: Date = new Date()): ApprovalGroup {
  if (!item.dueDate) {
    return 'noDate';
  }

  const due = new Date(item.dueDate);
  if (Number.isNaN(due.getTime())) {
    return 'noDate';
  }

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diffDays = Math.floor((dueDay - startOfDay) / 86400000);

  if (diffDays < 0 && item.status === 'pending') {
    return 'overdue';
  }

  if (diffDays === 0) {
    return 'today';
  }

  return 'upcoming';
}

export function sortApprovalItems(items: IApprovalRecord[], defaultSort: ApprovalSortKey, now: Date = new Date()): IApprovalRecord[] {
  const groupRank: Record<ApprovalGroup, number> = {
    overdue: 0,
    today: 1,
    upcoming: 2,
    noDate: 3
  };

  const sourceRank = (source: string): number => {
    const normalized = normalizeText(source).toLowerCase();
    if (normalized === 'approvals') {
      return 0;
    }
    if (normalized.includes('sharepoint')) {
      return 1;
    }
    return 2;
  };

  return [...items].sort((left, right) => {
    const leftGroup = classifyApprovalGroup(left, now);
    const rightGroup = classifyApprovalGroup(right, now);
    if (leftGroup !== rightGroup) {
      return groupRank[leftGroup] - groupRank[rightGroup];
    }

    if (defaultSort === 'source') {
      const sourceDiff = sourceRank(left.source) - sourceRank(right.source);
      if (sourceDiff !== 0) {
        return sourceDiff;
      }
    }

    if (defaultSort === 'createdDate') {
      const leftCreated = left.createdDate ? new Date(left.createdDate).getTime() : 0;
      const rightCreated = right.createdDate ? new Date(right.createdDate).getTime() : 0;
      if (leftCreated !== rightCreated) {
        return rightCreated - leftCreated;
      }
    }

    const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.POSITIVE_INFINITY;
    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    const leftCreated = left.createdDate ? new Date(left.createdDate).getTime() : 0;
    const rightCreated = right.createdDate ? new Date(right.createdDate).getTime() : 0;
    if (leftCreated !== rightCreated) {
      return rightCreated - leftCreated;
    }

    return left.title.localeCompare(right.title);
  });
}

export function limitApprovals(items: IApprovalRecord[], maxItems: number): IApprovalRecord[] {
  return items.slice(0, Math.max(1, maxItems));
}

export function summarizeApprovalCounts(items: IApprovalRecord[], now: Date = new Date()): IApprovalCounts {
  return items.reduce<IApprovalCounts>((counts, item) => {
    const group = classifyApprovalGroup(item, now);
    counts.total += 1;
    counts[group] += 1;
    if (item.status === 'completed') {
      counts.completed += 1;
    } else {
      counts.pending += 1;
    }
    if (!item.dueDate || !item.openUrl || !item.requester) {
      counts.partial += 1;
    }
    return counts;
  }, {
    overdue: 0,
    today: 0,
    upcoming: 0,
    noDate: 0,
    pending: 0,
    completed: 0,
    total: 0,
    partial: 0
  });
}

export function decorateApprovalRecord(item: IApprovalRecord, now: Date = new Date()): IApprovalItem {
  const group = classifyApprovalGroup(item, now);
  const isPartial = !item.dueDate || !item.openUrl || !item.requester;
  const isActionable = !!createSafeExternalLink(item.openUrl || undefined);
  const statusLabel = item.status === 'completed'
    ? 'completed'
    : item.status === 'pending'
      ? 'pending'
      : 'unknown';
  const badgeLabel = group === 'overdue'
    ? 'overdue'
    : group === 'today'
      ? 'today'
      : group === 'upcoming'
        ? 'upcoming'
        : 'noDate';

  return {
    ...item,
    group,
    isPartial,
    isActionable,
    statusLabel,
    badgeLabel
  };
}

export function normalizeListTitleOrUrl(value: string | undefined, siteUrl: string = typeof window !== 'undefined' ? window.location.origin : ''): INormalizedListTarget | undefined {
  const text = normalizeText(value);
  if (!text) {
    return undefined;
  }

  if (/^(https?:)?\/\//i.test(text) || text.startsWith('/')) {
    let resolved: URL;
    try {
      resolved = new URL(text, siteUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost'));
    } catch {
      return undefined;
    }

    if (siteUrl) {
      try {
        const base = new URL(siteUrl, resolved.origin);
        if (resolved.origin !== base.origin) {
          return undefined;
        }
      } catch {
        return undefined;
      }
    }

    const segments = resolved.pathname.split('/').filter(Boolean);
    const formsIndex = segments.findIndex((segment) => segment.toLowerCase() === 'forms');
    let listTitle = '';
    if (formsIndex > 0) {
      listTitle = decodeURIComponent(segments[formsIndex - 1]);
    } else {
      const listsIndex = segments.findIndex((segment) => segment.toLowerCase() === 'lists');
      if (listsIndex >= 0 && segments[listsIndex + 1]) {
        listTitle = decodeURIComponent(segments[listsIndex + 1]);
      } else if (segments.length > 0) {
        listTitle = decodeURIComponent(segments[segments.length - 1]);
      }
    }

    return listTitle
      ? {
        listTitle,
        url: resolved.toString()
      }
      : undefined;
  }

  return {
    listTitle: text,
    url: text
  };
}

export function createFallbackApprovals(): IApprovalRecord[] {
  return [
    {
      id: 'approval-001',
      title: 'Aprobar vacaciones de Ana López',
      requester: 'Ana López',
      source: 'Approvals',
      status: 'pending',
      dueDate: '2026-03-29T12:00:00.000Z',
      createdDate: '2026-03-25T09:00:00.000Z',
      openUrl: '/sites/portal/approvals/vacations/ana-lopez'
    },
    {
      id: 'approval-002',
      title: 'Validar factura de proveedor',
      requester: 'Compras',
      source: 'SharePointList',
      status: 'pending',
      dueDate: '2026-03-30T16:00:00.000Z',
      createdDate: '2026-03-28T11:15:00.000Z',
      openUrl: '/sites/portal/Lists/Approvals/AllItems.aspx'
    },
    {
      id: 'approval-003',
      title: 'Confirmar solicitud de acceso',
      requester: undefined,
      source: 'JsonUrl',
      status: 'pending',
      dueDate: undefined,
      createdDate: '2026-03-26T08:20:00.000Z',
      openUrl: '/sites/portal/access-requests/confirm'
    },
    {
      id: 'approval-004',
      title: 'Revisar aprobación de compras',
      requester: 'Daniel Ruiz',
      source: 'Approvals',
      status: 'completed',
      dueDate: '2026-03-20T12:00:00.000Z',
      createdDate: '2026-03-18T12:00:00.000Z',
      openUrl: '/sites/portal/approvals/purchases'
    },
    {
      id: 'approval-005',
      title: 'Autorizar publicación interna',
      requester: 'Marketing',
      source: 'SharePointList',
      status: 'pending',
      dueDate: '2026-03-30T09:00:00.000Z',
      createdDate: '2026-03-29T09:30:00.000Z',
      openUrl: '/sites/portal/approvals/publication'
    }
  ];
}
