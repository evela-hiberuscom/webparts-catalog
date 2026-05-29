import type { WebPartContext } from '@microsoft/sp-webpart-base';

export type MiniOrgChartDataSourceType = 'Directory' | 'SharePointList' | 'JsonUrl' | 'StaticConfig';
export type MiniOrgChartViewMode = 'managerWithReports' | 'chain' | 'smallTree';
export type MiniOrgChartState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IMiniOrgChartWebPartProps {
  title?: string;
  description?: string;
  dataSourceTypesCsv?: string;
  listTitleOrUrl?: string;
  rootPersonId?: string;
  viewMode?: MiniOrgChartViewMode;
  maxDepth?: number;
  directoryEndpoint?: string;
  jsonUrl?: string;
  staticConfigJson?: string;
}

export interface IMiniOrgChartConfig {
  dataSourceTypes: MiniOrgChartDataSourceType[];
  listTitleOrUrl?: string;
  rootPersonId?: string;
  viewMode: MiniOrgChartViewMode;
  maxDepth: number;
  directoryEndpoint?: string;
  jsonUrl?: string;
  staticConfigJson?: string;
}

export interface IOrgPerson {
  id: string;
  displayName: string;
  jobTitle?: string;
  photoUrl?: string;
  profileUrl?: string;
  managerId?: string;
  reportIds: string[];
  department?: string;
  email?: string;
  sourceLabel: MiniOrgChartDataSourceType | 'Unknown';
  isPartial: boolean;
}

export interface IOrgTreeNode {
  person: IOrgPerson;
  depth: number;
  children: IOrgTreeNode[];
}

export interface IOrgSourceSummary {
  source: MiniOrgChartDataSourceType | 'Unknown';
  count: number;
  warning?: string;
}

export interface IOrgLoadResult {
  people: IOrgPerson[];
  sourceSummaries: IOrgSourceSummary[];
  warnings: string[];
  errors: string[];
}

export interface IOrgViewModel {
  state: MiniOrgChartState;
  root: IOrgTreeNode | undefined;
  flatPeople: IOrgPerson[];
  partialReasons: string[];
  filteredCount: number;
  totalCount: number;
}

export interface IMiniOrgChartProps {
  context: WebPartContext;
  config: IMiniOrgChartConfig;
  description?: string;
  title: string;
  userDisplayName: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
}
