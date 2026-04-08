import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';

export type TemplatesSourceKind = 'library' | 'list';
export type TemplatesLibraryStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface ITemplateItem {
  id: string;
  title: string;
  templateType: string;
  category: string;
  updatedAt?: string;
  openUrl?: string;
  downloadUrl?: string;
  featured: boolean;
}

export interface ITemplatesLibraryConfiguration {
  title: string;
  description: string;
  sourceKind: TemplatesSourceKind;
  listTitleOrUrl: string;
  defaultCategory: string;
  maxItems: number;
}

export interface ITemplatesLibraryState {
  status: TemplatesLibraryStatus;
  items: ITemplateItem[];
  categories: string[];
  types: string[];
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface ITemplatesLibraryContext {
  spHttpClient: Pick<SPHttpClient, 'get'>;
  spHttpClientConfiguration: SPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

export interface ITemplatesRepository {
  getTemplates(configuration: ITemplatesLibraryConfiguration): Promise<ITemplateItem[]>;
}

export interface ITemplatesLibraryService {
  load(configuration: ITemplatesLibraryConfiguration): Promise<ITemplatesLibraryState>;
}
