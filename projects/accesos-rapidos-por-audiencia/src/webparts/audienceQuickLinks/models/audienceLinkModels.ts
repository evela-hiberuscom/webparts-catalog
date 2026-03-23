import type { SPHttpClient } from '@microsoft/sp-http';

export type AudienceMode = 'department' | 'country' | 'group' | 'role' | 'hybrid';
export type DataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';
export type AudienceQuickLinksState = 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

export interface IAudienceQuickLinksWebPartProps {
  title: string;
  description: string;
  dataSourceType: DataSourceType;
  listTitleOrUrl: string;
  audienceMode: AudienceMode;
  defaultCategory: string;
  maxItems: number;
  showAudienceHint: boolean;
}

export interface IAudienceQuickLinksHostContext {
  spHttpClient: SPHttpClient;
  webUrl: string;
  siteUrl: string;
  userDisplayName: string;
  userEmail?: string;
  userLoginName?: string;
  localeName?: string;
}

export interface IAudienceLinkInput {
  id?: string;
  title?: string;
  category?: string;
  iconName?: string;
  description?: string;
  openUrl?: string;
  audiences?: string[] | string;
  isGeneric?: boolean | string;
  priority?: number | string;
}

export interface IAudienceLinkRecord {
  id: string;
  title: string;
  category: string;
  iconName: string;
  description: string;
  openUrl?: string;
  audiences: string[];
  isGeneric: boolean;
  priority?: number;
  sourceBadge: 'personalizado' | 'genérico' | 'partial';
}

export interface IAudienceLinkRepositoryResult {
  items: IAudienceLinkRecord[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface IUserContextTokenBucket {
  departmentTokens: string[];
  countryTokens: string[];
  groupTokens: string[];
  roleTokens: string[];
  fallbackTokens: string[];
  allTokens: string[];
}

export interface IUserContextResult {
  displayName: string;
  email?: string;
  loginName?: string;
  localeName?: string;
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  tokens: IUserContextTokenBucket;
}

export interface IAudienceQuickLinksViewModel {
  title: string;
  description: string;
  sourceLabel: string;
  resolvedAudienceLabel: string;
  resolvedAudienceTokens: string[];
  categories: string[];
  selectedCategory: string;
  allItems: IAudienceLinkRecord[];
  visibleItems: IAudienceLinkRecord[];
  hasPartialData: boolean;
  state: AudienceQuickLinksState;
  notes: string[];
}

export interface IAudienceQuickLinksLoadRequest {
  webPartProps: IAudienceQuickLinksWebPartProps;
  hostContext: IAudienceQuickLinksHostContext;
}
