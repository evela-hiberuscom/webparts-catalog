export interface IGoalItem {
  id: string;
  title: string;
  description: string | undefined;
  progress: number;
  status: 'onTrack' | 'atRisk' | 'completed' | 'unknown';
  owner: string | undefined;
  dueDate: string | undefined;
  detailUrl: string | undefined;
}

export interface IAreaGoalsConfiguration {
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