export type ProjectStatusValue = 'green' | 'amber' | 'red' | 'unknown';

export type ProjectStatusFilter = ProjectStatusValue | 'all';

export type ProjectStatusDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export interface IProjectStatusRequest {
  webUrl: string;
  dataSourceType: ProjectStatusDataSourceType;
  listTitleOrUrl: string;
  jsonUrl?: string;
  maxItems: number;
  defaultStatusFilter?: ProjectStatusFilter;
  showOwner: boolean;
}

export interface IProjectStatusWebPartConfig {
  dataSourceType: ProjectStatusDataSourceType;
  listTitleOrUrl: string;
  jsonUrl?: string;
  maxItems: number;
  defaultStatusFilter?: ProjectStatusFilter;
  showOwner: boolean;
}

export interface IProjectRecord {
  id: string;
  title: string;
  status?: string;
  owner?: string;
  relevantDate?: string;
  openUrl?: string;
  category?: string;
  partial?: boolean;
}

export interface IProjectStatusItem extends IProjectRecord {
  status: ProjectStatusValue;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'error' | 'neutral';
  relevantDateLabel: string;
  hasPartialData: boolean;
  safeLink?: {
    href: string;
    rel: string;
    target: string;
  };
}

export interface IProjectStatusSourceSummary {
  sourceLabel: string;
  totalCount: number;
  hasPartialData: boolean;
  availableFilters: ProjectStatusFilter[];
}

export interface IProjectStatusResult extends IProjectStatusSourceSummary {
  items: IProjectStatusItem[];
}

export interface IProjectStatusViewModel extends IProjectStatusResult {
  status: 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
  selectedFilter: ProjectStatusFilter;
  errorMessage?: string;
}

export interface IProjectStatusDataSource {
  loadProjects(request: IProjectStatusRequest): Promise<IProjectRecord[]>;
  getSourceLabel(request: IProjectStatusRequest): string;
}
