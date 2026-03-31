export interface IFeaturedQuestion {
  id: string;
  question: string;
  context: string | undefined;
  category: string | undefined;
  authorName: string | undefined;
  authorPhotoUrl: string | undefined;
  options: { text: string; votes: number }[];
  expiresAt: string | undefined;
}

export interface IFeaturedQuestionConfiguration {
  dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig';
  listTitleOrUrl: string;
  showVotes: boolean;
  allowMultipleVotes: boolean;
  autoRefreshSeconds?: number;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'partialData'; data: T; hasPartialData: boolean }
  | { status: 'error'; message: string };