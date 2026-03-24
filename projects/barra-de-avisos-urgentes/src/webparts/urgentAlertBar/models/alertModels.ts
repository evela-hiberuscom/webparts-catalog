export type AlertSeverity = 'critical' | 'warning' | 'info' | 'unknown';

export type AlertDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export interface IAlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message?: string;
  startAt?: string;
  endAt?: string;
  ctaUrl?: string;
  priority?: number;
}

export interface IAlertBarRequest {
  dataSourceType: AlertDataSourceType;
  listTitleOrUrl: string;
  jsonUrl?: string;
  staticConfigJson?: string;
  maxAlerts: number;
  dismissible: boolean;
  webAbsoluteUrl: string;
}

export interface IAlertRepositoryResult {
  items: IAlertItem[];
  hasPartialData: boolean;
  sourceLabel: string;
}

export interface IAlertBarViewModel {
  items: IAlertItem[];
  hasPartialData: boolean;
  sourceLabel: string;
}

export interface IAlertBarState {
  status: 'loading' | 'ready' | 'empty' | 'error';
  items: IAlertItem[];
  hasPartialData: boolean;
  errorMessage?: string;
  sourceLabel?: string;
}

export interface IAlertBarService {
  load(request: IAlertBarRequest, now?: Date): Promise<IAlertBarViewModel>;
}
