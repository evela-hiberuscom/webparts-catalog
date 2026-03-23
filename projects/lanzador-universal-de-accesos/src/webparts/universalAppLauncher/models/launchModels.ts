export interface ILaunchItemInput {
  id?: string;
  title?: string;
  category?: string;
  audienceTokens?: string[] | string;
  description?: string;
  iconName?: string;
  priority?: number | string;
  featured?: boolean | string;
  openUrl?: string;
  openInNewTab?: boolean | string;
}

export type AudienceMatchMode = 'department' | 'country' | 'group' | 'role' | 'hybrid';

export interface ILaunchItem {
  id: string;
  title: string;
  category: string;
  audienceTokens: string[];
  description: string;
  iconName: string;
  priority?: number;
  featured: boolean;
  openUrl: string;
  openInNewTab: boolean;
}

export interface ILaunchRepositoryResult {
  items: ILaunchItem[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface ILaunchCatalogConfig {
  title: string;
  subtitle: string;
  launchItemsJson: string;
  defaultCategory: string;
  currentAudienceTokens: string[];
  audienceMode: AudienceMatchMode;
  maxItems: number;
  openInNewTab: boolean;
}

export interface ILaunchCatalogState {
  query: string;
  selectedCategory: string;
}

export interface ILaunchViewModel {
  status: 'loading' | 'error' | 'partialData' | 'empty' | 'ready';
  items: ILaunchItem[];
  categories: string[];
  visibleItems: ILaunchItem[];
  query: string;
  selectedCategory: string;
  sourceLabel: string;
  audienceTokens: string[];
  hasPartialData: boolean;
}
