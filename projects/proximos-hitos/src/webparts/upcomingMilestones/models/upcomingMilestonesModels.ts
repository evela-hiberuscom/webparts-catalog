import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type UpcomingMilestonesStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
export type UpcomingMilestonesViewMode = 'timeline' | 'list';

export interface IUpcomingMilestoneItem {
  id: string;
  title: string;
  date?: string;
  type?: string;
  detailUrl?: string;
}

export interface IUpcomingMilestonesConfiguration {
  title: string;
  description: string;
  listTitleOrUrl: string;
  maxItems: number;
  viewMode: UpcomingMilestonesViewMode;
}

export interface IUpcomingMilestonesState {
  status: UpcomingMilestonesStatus;
  items: IUpcomingMilestoneItem[];
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface IUpcomingMilestonesContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface IUpcomingMilestonesRepository {
  getMilestones(configuration: IUpcomingMilestonesConfiguration): Promise<IUpcomingMilestoneItem[]>;
}

export interface IUpcomingMilestonesService {
  load(configuration: IUpcomingMilestonesConfiguration): Promise<IUpcomingMilestonesState>;
}
