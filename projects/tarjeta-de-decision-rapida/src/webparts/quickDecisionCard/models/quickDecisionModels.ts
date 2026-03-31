export interface IQuickDecision {
  id: string; question: string; options: { id: string; text: string; }[]; context: string | undefined; expiresAt: string | undefined; }
export interface IQuickDecisionConfiguration { dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig'; listTitleOrUrl: string; autoRefreshSeconds?: number; }
export type AsyncState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'empty' } | { status: 'partialData'; data: T; hasPartialData: boolean } | { status: 'error'; message: string };
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;