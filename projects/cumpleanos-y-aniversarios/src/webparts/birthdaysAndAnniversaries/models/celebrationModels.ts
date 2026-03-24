import type { SPHttpClient } from '@microsoft/sp-http';

export type CelebrationDataSourceType = 'Directory' | 'SharePointList' | 'JsonUrl';

export type CelebrationType = 'birthday' | 'anniversary' | 'unknown';

export interface ISharePointHttpClientLike {
  get(url: string, configuration: unknown, options?: unknown): Promise<{
    ok: boolean;
    status: number;
    statusText: string;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }>;
}

export interface IPeopleCelebrationsRequest {
  dataSourceTypes: CelebrationDataSourceType[];
  directoryJsonUrl?: string;
  listTitleOrUrl?: string;
  jsonUrl?: string;
  showBirthdays: boolean;
  showAnniversaries: boolean;
  daysAhead: number;
  webAbsoluteUrl: string;
  spHttpClient?: SPHttpClient;
}

export interface ICelebrationRecord {
  id: string;
  displayName: string;
  photoUrl: string | null;
  celebrationType: CelebrationType;
  date: string | null;
}

export interface ICelebrationItem extends ICelebrationRecord {
  avatarText: string;
  dateLabel: string;
  daysRemaining: number | null;
  isToday: boolean;
  isPartial: boolean;
}

export interface IPeopleCelebrationsRepositoryResult {
  items: ICelebrationRecord[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface ICelebrationViewModel {
  status: 'loading' | 'error' | 'partialData' | 'empty' | 'ready';
  items: ICelebrationItem[];
  todayItems: ICelebrationItem[];
  upcomingItems: ICelebrationItem[];
  partialItems: ICelebrationItem[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  errorMessage?: string;
}

export interface ICelebrationSourceReference {
  mode: 'title' | 'url';
  value: string;
}

