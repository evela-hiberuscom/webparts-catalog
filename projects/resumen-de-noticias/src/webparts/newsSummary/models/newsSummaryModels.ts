import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type NewsSummaryStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface INewsSummaryItem {
  id: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  imageUrl?: string;
  openUrl?: string;
  isFeatured: boolean;
}

export interface INewsSummaryConfiguration {
  title: string;
  description: string;
  maxItems: number;
  sitePagesListTitle: string;
  featuredFirst: boolean;
}

export interface INewsSummaryState {
  status: NewsSummaryStatus;
  items: INewsSummaryItem[];
  errorMessage?: string;
  hasPartialData: boolean;
}

export interface INewsSummaryContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface INewsSummaryRepository {
  getNews(configuration: INewsSummaryConfiguration): Promise<INewsSummaryItem[]>;
}

export interface INewsSummaryService {
  load(configuration: INewsSummaryConfiguration): Promise<INewsSummaryState>;
}
