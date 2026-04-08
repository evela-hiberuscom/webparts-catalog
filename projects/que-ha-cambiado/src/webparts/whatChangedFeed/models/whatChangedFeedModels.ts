import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type WhatChangedFeedStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
export type WhatChangedFeedSourceKind = 'list' | 'library';

export interface IWhatChangedFeedItem {
  id: string;
  title: string;
  type: string;
  changedAt?: string;
  summary?: string;
  openUrl?: string;
  featured: boolean;
}

export interface IWhatChangedFeedConfiguration {
  title: string;
  description: string;
  sourceKind: WhatChangedFeedSourceKind;
  listTitleOrUrl: string;
  defaultTypeFilter: string;
  maxItems: number;
}

export interface IWhatChangedFeedState {
  status: WhatChangedFeedStatus;
  items: IWhatChangedFeedItem[];
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface IWhatChangedFeedContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface IWhatChangedFeedRepository {
  getChanges(configuration: IWhatChangedFeedConfiguration): Promise<IWhatChangedFeedItem[]>;
}

export interface IWhatChangedFeedService {
  load(configuration: IWhatChangedFeedConfiguration): Promise<IWhatChangedFeedState>;
}
