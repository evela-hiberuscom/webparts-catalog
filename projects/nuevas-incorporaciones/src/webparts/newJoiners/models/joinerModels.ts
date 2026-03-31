export interface IJoiner {
  id: string;
  displayName: string;
  jobTitle: string | undefined;
  department: string | undefined;
  photoUrl: string | undefined;
  startDate: string | undefined;
  profileUrl: string | undefined;
  welcomeMessage: string | undefined;
}

export interface INewJoinersConfiguration {
  dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig';
  listTitleOrUrl: string;
  maxItems: number;
  daysBack: number;
  autoRefreshSeconds?: number;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'partialData'; data: T; hasPartialData: boolean }
  | { status: 'error'; message: string };