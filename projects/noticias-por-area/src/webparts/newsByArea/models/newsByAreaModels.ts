import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type NewsByAreaStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface INewsByAreaItem {
  id: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  imageUrl?: string;
  openUrl?: string;
  tags: string[];
  isFeatured: boolean;
}

export interface INewsByAreaConfiguration {
  title: string;
  description: string;
  areaFilter: string;
  sitePagesListTitle: string;
  maxItems: number;
  showImage: boolean;
  featuredFirst: boolean;
}

export interface INewsByAreaState {
  status: NewsByAreaStatus;
  items: INewsByAreaItem[];
  errorMessage?: string;
  hasPartialData: boolean;
}

export interface INewsByAreaContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface INewsByAreaRepository {
  getNews(configuration: INewsByAreaConfiguration): Promise<INewsByAreaItem[]>;
}

export interface INewsByAreaService {
  load(configuration: INewsByAreaConfiguration): Promise<INewsByAreaState>;
}
