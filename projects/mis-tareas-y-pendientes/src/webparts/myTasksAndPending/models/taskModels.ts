export interface ITaskItem {
  id: string;
  title: string;
  source: string;
  status: 'open' | 'completed' | 'unknown';
  dueDate: string | undefined;
  priority: 'low' | 'medium' | 'high' | 'unknown';
  openUrl: string | undefined;
  group: 'overdue' | 'today' | 'soon' | 'someday' | 'noDate';
}

export interface ITasksConfiguration {
  dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig';
  listTitleOrUrl: string;
  showCompleted: boolean;
  maxItems: number;
  defaultSort: 'dueDate' | 'priority' | 'source';
  autoRefreshSeconds?: number;
}

export interface ITasksUserContext {
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

export interface ITasksViewModel {
  items: ITaskItem[];
  counts: { overdue: number; today: number; soon: number; noDate: number };
  hasPartialData: boolean;
}