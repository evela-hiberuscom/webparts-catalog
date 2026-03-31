export type ApprovalDataSourceType = 'Approvals' | 'SharePointList' | 'JsonUrl';
export type ApprovalStatus = 'pending' | 'completed' | 'unknown';
export type ApprovalGroup = 'overdue' | 'today' | 'upcoming' | 'noDate';
export type ApprovalSortKey = 'dueDate' | 'createdDate' | 'source';

export interface IApprovalRecord {
  id: string;
  title: string;
  requester: string | null;
  source: string;
  status: ApprovalStatus;
  dueDate: string | null;
  createdDate: string | null;
  openUrl: string | null;
  category?: string | null;
  details?: string | null;
}

export interface IApprovalItem extends IApprovalRecord {
  group: ApprovalGroup;
  isPartial: boolean;
  isActionable: boolean;
  statusLabel: string;
  badgeLabel: string;
}

export interface IApprovalCounts {
  overdue: number;
  today: number;
  upcoming: number;
  noDate: number;
  pending: number;
  completed: number;
  total: number;
  partial: number;
}

export interface IApprovalSnapshot {
  items: IApprovalItem[];
  counts: IApprovalCounts;
  hasPartialData: boolean;
  sourceWarnings: string[];
}

export interface IApprovalsSourceConfig {
  title: string;
  dataSourceType: ApprovalDataSourceType;
  sourceUrl?: string;
  listTitleOrUrl?: string;
  showCompleted: boolean;
  maxItems: number;
  defaultSort: ApprovalSortKey;
}

export interface IApprovalLoadResult {
  items: IApprovalRecord[];
  hasPartialData: boolean;
  warnings: string[];
}

export interface IApprovalsRepository {
  loadApprovals(config: IApprovalsSourceConfig): Promise<IApprovalLoadResult>;
}

export interface IApprovalsAggregationService {
  loadSnapshot(config: IApprovalsSourceConfig): Promise<IApprovalSnapshot>;
}

export interface IApprovalsServiceState {
  isLoading: boolean;
  error: string | null;
  snapshot: IApprovalSnapshot | null;
}
