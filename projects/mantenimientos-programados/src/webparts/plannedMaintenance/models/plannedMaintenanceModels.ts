export type PlannedMaintenanceDataSourceType = 'SharePointList' | 'JsonUrl';
export type PlannedMaintenanceStatus = 'upcoming' | 'inProgress' | 'completed' | 'unknown';
export type PlannedMaintenanceImpact = 'low' | 'medium' | 'high' | 'unknown';
export type PlannedMaintenanceViewState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IPlannedMaintenanceWebPartProps {
  title: string;
  description: string;
  dataSourceType: PlannedMaintenanceDataSourceType;
  listTitleOrUrl: string;
  jsonUrl: string;
  hideCompleted: boolean;
  maxItems: number;
}

export interface IPlannedMaintenanceHostContext {
  spHttpClient: {
    configurations?: {
      v1?: unknown;
    };
    get(url: string, configuration: unknown, options?: { headers?: Record<string, string> }): Promise<{
      ok: boolean;
      status: number;
      json(): Promise<unknown>;
    }>;
  };
  webUrl: string;
  siteUrl: string;
  localeName?: string;
}

export interface IPlannedMaintenanceRequest {
  webPartProps: IPlannedMaintenanceWebPartProps;
  hostContext: IPlannedMaintenanceHostContext;
  now?: Date;
}

export interface IPlannedMaintenanceInput {
  id?: string | number;
  title?: string;
  Title?: string;
  startAt?: string;
  StartAt?: string;
  startDate?: string;
  StartDate?: string;
  endAt?: string;
  EndAt?: string;
  endDate?: string;
  EndDate?: string;
  impact?: string;
  Impact?: string;
  services?: string[] | string;
  Services?: string[] | string;
  detailUrl?: string;
  DetailUrl?: string;
}

export interface IPlannedMaintenanceItem {
  id: string;
  title: string;
  startAt?: string;
  endAt?: string;
  impact: PlannedMaintenanceImpact;
  services: string[];
  detailUrl?: string;
  status: PlannedMaintenanceStatus;
  partialData: boolean;
}

export interface IPlannedMaintenanceRepositoryResult {
  items: IPlannedMaintenanceItem[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface IPlannedMaintenanceViewModel {
  title: string;
  description: string;
  sourceLabel: string;
  allItems: IPlannedMaintenanceItem[];
  items: IPlannedMaintenanceItem[];
  hideCompleted: boolean;
  state: PlannedMaintenanceViewState;
  hasPartialData: boolean;
  notes: string[];
  counts: {
    inProgress: number;
    upcoming: number;
    completed: number;
    unknown: number;
  };
}
