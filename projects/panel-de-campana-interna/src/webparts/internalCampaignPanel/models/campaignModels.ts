export interface ICampaignItem {
  id: string;
  title: string;
  claim: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
  ctaText: string | undefined;
  ctaUrl: string | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  priority: number;
  category: string | undefined;
}

export interface IInternalCampaignConfiguration {
  dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig';
  listTitleOrUrl: string;
  maxItems: number;
  autoRefreshSeconds?: number;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'partialData'; data: T; hasPartialData: boolean }
  | { status: 'error'; message: string };