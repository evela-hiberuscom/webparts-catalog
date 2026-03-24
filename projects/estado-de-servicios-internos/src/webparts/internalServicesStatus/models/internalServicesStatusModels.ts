export type InternalServiceSourceType = "SharePointList" | "JsonUrl" | "StaticConfig";

export type InternalServiceStatusValue =
  | "ok"
  | "warning"
  | "critical"
  | "maintenance"
  | "unknown";

export type InternalServiceCriticalityValue = "low" | "medium" | "high" | "unknown";

export type InternalServicesStatusFilter = "all" | InternalServiceStatusValue;
export type InternalServicesStatusViewState = "loading" | "ready" | "partialData" | "empty" | "error";

export interface IInternalServicesStatusWebPartProps {
  description: string;
  dataSourceType: InternalServiceSourceType;
  listTitleOrUrl: string;
  autoRefreshSeconds: number;
  showOnlyCritical: boolean;
  staleThresholdMinutes: number;
}

export interface IInternalServiceStatusSourceRecord {
  id?: string | number;
  name?: string;
  title?: string;
  status?: string;
  criticality?: string;
  summary?: string;
  updatedAt?: string;
  detailUrl?: string;
  domain?: string;
}

export interface IInternalServiceStatus {
  id: string;
  name: string;
  status: InternalServiceStatusValue;
  criticality: InternalServiceCriticalityValue;
  summary: string;
  updatedAt?: string;
  detailUrl?: string;
  domain?: string;
  isPartial: boolean;
  isStale: boolean;
}

export interface IInternalServicesStatusRequest {
  dataSourceType: InternalServiceSourceType;
  listTitleOrUrl: string;
  showOnlyCritical: boolean;
  staleThresholdMinutes: number;
  autoRefreshSeconds?: number;
}

export interface IInternalServicesStatusResult {
  items: IInternalServiceStatus[];
  status: InternalServicesStatusViewState;
  hasPartialData: boolean;
  sourceCount: number;
  lastUpdated?: string;
  staleCount: number;
}

export interface IInternalServiceStatusRepository {
  loadRecords(request: IInternalServicesStatusRequest): Promise<IInternalServiceStatusSourceRecord[]>;
}

export interface IInternalServicesStatusService {
  loadSnapshot(request: IInternalServicesStatusRequest): Promise<IInternalServicesStatusResult>;
}
