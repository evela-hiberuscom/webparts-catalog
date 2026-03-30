export type CountdownSourceType = 'StaticConfig' | 'SharePointList' | 'JsonUrl';

export type CountdownPhase = 'countdown' | 'live' | 'completed' | 'unknown';

export type CountdownViewState = 'loading' | 'empty' | 'partialData' | 'error' | 'ready';

export interface ICountdownWebPartConfig {
  sourceType: CountdownSourceType;
  eventTitle: string;
  targetDate: string;
  subtitle?: string;
  detailUrl?: string;
  showCompleted: boolean;
  jsonUrl?: string;
  listTitleOrUrl?: string;
  titleField?: string;
  targetDateField?: string;
  subtitleField?: string;
  detailUrlField?: string;
  refreshIntervalSeconds: number;
  webUrl: string;
}

export interface ICountdownItem {
  title: string;
  targetDate: string;
  subtitle?: string;
  detailUrl?: string;
  state: CountdownPhase;
  showCompleted: boolean;
  hasPartialData: boolean;
}

export interface ICountdownRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
}

export interface ICountdownRepositoryResult {
  item?: ICountdownItem;
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface ICountdownSnapshot extends ICountdownRepositoryResult {
  errorMessage?: string;
}

export interface ICountdownViewModel {
  state: CountdownViewState;
  phase: CountdownPhase;
  item?: ICountdownItem;
  remaining?: ICountdownRemaining;
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  phaseLabel: string;
  supportingText: string;
  emptyReason?: string;
  errorMessage?: string;
  ctaLink?: {
    href: string;
    rel: string;
    target: string;
  };
}

export interface ICountdownSourceRecord {
  [key: string]: unknown;
}
