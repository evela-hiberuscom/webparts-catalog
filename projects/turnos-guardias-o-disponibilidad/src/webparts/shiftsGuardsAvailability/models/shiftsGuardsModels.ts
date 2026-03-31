export interface IShiftEntry {
  id: string; personName: string; role: string; type: 'turno' | 'guardia' | 'disponibilidad'; startTime: string; endTime: string; contact: string | undefined; location: string | undefined;
}
export interface IShiftsGuardsConfiguration { dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig'; listTitleOrUrl: string; maxItems: number; autoRefreshSeconds?: number; }
export type AsyncState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'empty' } | { status: 'partialData'; data: T; hasPartialData: boolean } | { status: 'error'; message: string };
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;