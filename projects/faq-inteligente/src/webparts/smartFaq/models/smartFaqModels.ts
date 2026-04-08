import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type SmartFaqStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface ISmartFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  aliases: string[];
  relatedUrl?: string;
  updatedAt?: string;
  isFeatured: boolean;
}

export interface ISmartFaqConfiguration {
  title: string;
  description: string;
  listTitleOrUrl: string;
  defaultCategory: string;
  enableSearch: boolean;
  maxItems: number;
}

export interface ISmartFaqState {
  status: SmartFaqStatus;
  items: ISmartFaqItem[];
  categories: string[];
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface ISmartFaqContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface ISmartFaqRepository {
  getFaqs(configuration: ISmartFaqConfiguration): Promise<ISmartFaqItem[]>;
}

export interface ISmartFaqService {
  load(configuration: ISmartFaqConfiguration): Promise<ISmartFaqState>;
}
