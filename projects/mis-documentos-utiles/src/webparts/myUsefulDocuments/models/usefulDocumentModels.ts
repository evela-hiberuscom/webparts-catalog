export interface IUsefulDocument {
  id: string;
  title: string;
  category: string | undefined;
  updatedAt: string | undefined;
  owner: string | undefined;
  openUrl: string | undefined;
  priority: 'featured' | 'frequent' | 'normal' | 'unknown';
}

export interface IUsefulDocumentsConfiguration {
  dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig';
  listTitleOrUrl: string;
  maxItems: number;
  defaultCategory: string | undefined;
  autoRefreshSeconds?: number;
}

export interface IUsefulDocumentsUserContext {
  displayName: string;
  email: string;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'partialData'; data: T; hasPartialData: boolean }
  | { status: 'error'; message: string };

export interface IUsefulDocumentsViewModel {
  items: IUsefulDocument[];
  categories: string[];
  hasPartialData: boolean;
}