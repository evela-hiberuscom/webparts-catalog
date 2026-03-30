export type ExpressDirectorySourceType = 'Directory' | 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export interface IExpressDirectoryWebPartProps {
  description: string;
  dataSourceTypesCsv: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticPeopleJson: string;
  maxItems: number;
  defaultAreaFilter: string;
}

export interface IExpressDirectoryProps {
  context: import('@microsoft/sp-webpart-base').WebPartContext;
  description: string;
  dataSourceTypesCsv: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticPeopleJson: string;
  maxItems: number;
  defaultAreaFilter: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

export interface IPersonItem {
  id: string;
  displayName: string;
  jobTitle: string | undefined;
  area: string | undefined;
  email: string | undefined;
  profileUrl: string | undefined;
  photoUrl: string | undefined;
}

export interface IExpressDirectorySourceRequest {
  webUrl: string;
  query: string;
  selectedArea: string;
  dataSourceTypesCsv: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticPeopleJson: string;
  maxItems: number;
  defaultAreaFilter: string;
}

export interface IExpressDirectorySourceResult {
  sourceType: ExpressDirectorySourceType;
  sourceLabel: string;
  items: IPersonItem[];
  warnings: string[];
}

export interface IExpressDirectoryState {
  status: 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
  errorMessage?: string;
  items: IPersonItem[];
  areas: string[];
  hasPartialData: boolean;
  sourceLabels: string[];
  warnings: string[];
  query: string;
  selectedArea: string;
}
