export type RecentAccessesSourceMode = 'SharePointList' | 'JsonUrl' | 'GraphRecent';

export type RecentResourceType = 'document' | 'page' | 'app' | 'unknown';

export interface IRecentResource {
  id: string;
  title: string;
  type: RecentResourceType;
  lastAccessedAt?: string;
  openUrl?: string;
  sourceLabel: string;
}

export interface IRecentAccessesConfig {
  description: string;
  dataSourceMode: RecentAccessesSourceMode;
  recentItemsJsonUrl: string;
  maxItems: number;
  resourceTypeFilter: string;
}

export interface IRecentAccessesResult {
  items: IRecentResource[];
  availableTypes: RecentResourceType[];
  hasPartialData: boolean;
  sourceLabel: string;
  warnings: string[];
  totalCount: number;
}

export interface IRecentAccessesViewState extends IRecentAccessesResult {
  isLoading: boolean;
  errorMessage?: string;
}
