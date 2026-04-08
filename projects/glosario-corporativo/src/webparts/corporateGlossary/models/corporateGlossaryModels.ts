import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type CorporateGlossaryStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface ICorporateGlossaryItem {
  id: string;
  title: string;
  definition: string;
  category?: string;
  aliases: string[];
  relatedUrl?: string;
  updatedAt?: string;
  featured: boolean;
  partialData: boolean;
}

export interface ICorporateGlossaryConfiguration {
  title: string;
  description: string;
  listTitle: string;
  defaultCategory: string;
  maxItems: number;
  enableAlphabetNav: boolean;
}

export interface ICorporateGlossaryState {
  status: CorporateGlossaryStatus;
  items: ICorporateGlossaryItem[];
  categories: string[];
  letters: string[];
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface ICorporateGlossaryContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface ICorporateGlossaryRepository {
  getGlossary(configuration: ICorporateGlossaryConfiguration): Promise<ICorporateGlossaryItem[]>;
}

export interface ICorporateGlossaryService {
  load(configuration: ICorporateGlossaryConfiguration): Promise<ICorporateGlossaryState>;
}
